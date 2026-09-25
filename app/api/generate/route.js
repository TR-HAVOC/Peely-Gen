import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { service, tier, userId } = await req.json();

    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // 1. Verify User Role
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'User profile not found. Please log in.' }, { status: 401 });
    }

    if (tier === 'paid' && profile.role !== 'paid' && profile.role !== 'admin') {
      return NextResponse.json({ error: 'Access Denied: Paid Gen tier requires a Paid or Admin subscription.' }, { status: 403 });
    }

    // 2. Fetch unused account stock
    const { data: account, error: accountErr } = await supabase
      .from('accounts')
      .select('*')
      .eq('service', service)
      .eq('tier', tier)
      .eq('is_used', false)
      .limit(1)
      .maybeSingle();

    if (accountErr || !account) {
      return NextResponse.json({ error: `Out of stock for ${service} (${tier} tier).` }, { status: 404 });
    }

    // 3. Mark account as used so it cannot be generated again
    await supabase
      .from('accounts')
      .update({ is_used: true })
      .eq('id', account.id);

    return NextResponse.json({ success: true, account: account.credentials });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
