import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const redis = Redis.fromEnv();

export async function POST(req) {
  try {
    const { userId, service } = await req.json();

    if (!userId || !service) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Check Redis Cooldown (15-minute / 900-second limit)
    const cooldownKey = `cooldown:${userId}:${service}`;
    const isCoolingDown = await redis.get(cooldownKey);

    if (isCoolingDown) {
      const ttl = await redis.ttl(cooldownKey);
      return NextResponse.json(
        { error: `Cooldown active. Please wait ${ttl} seconds.` },
        { status: 429 }
      );
    }

    // 2. Grab 1 unused account from Supabase
    const { data: account, error: fetchError } = await supabase
      .from('stock')
      .select('*')
      .eq('service_name', service)
      .eq('is_used', false)
      .limit(1)
      .single();

    if (fetchError || !account) {
      return NextResponse.json({ error: 'Out of stock for this service.' }, { status: 404 });
    }

    // 3. Mark account as used
    await supabase
      .from('stock')
      .update({ is_used: true })
      .eq('id', account.id);

    // 4. Set 15-minute cooldown in Redis
    await redis.set(cooldownKey, 'true', { ex: 900 });

    // 5. Return credentials
    return NextResponse.json({
      success: true,
      credentials: account.credentials
    });

  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
