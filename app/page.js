'use client';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default function App() {
  // Safe lazy-initialization of Supabase Client
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
    return createClient(url, key);
  }, []);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  
  // Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authConfirmPass, setAuthConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authError, setAuthError] = useState(null);
  const [authMsg, setAuthMsg] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // App Navigation & Settings
  const [activeTab, setActiveTab] = useState('generate');
  const [activePreset, setActivePreset] = useState('peelygen');

  // Generator State
  const [genTier, setGenTier] = useState('free');
  const [service, setService] = useState('roblox');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState(null);

  // Gambling State
  const [gamblingMsg, setGamblingMsg] = useState('');

  // Admin State
  const [adminUsers, setAdminUsers] = useState([]);

  const presets = {
    peelygen: { primary: '#eab308', bg: '#080808', card: '#0f0f0f', text: '#f0f0f0' },
    midnight: { primary: '#4f46e5', bg: '#05050a', card: '#0d0d18', text: '#e0e7ff' },
    neongreen: { primary: '#10b981', bg: '#020b06', card: '#06170d', text: '#d1fae5' },
    crimson: { primary: '#dc2626', bg: '#080101', card: '#120404', text: '#fee2e2' },
  };
  const theme = presets[activePreset] || presets.peelygen;

  // Load Session
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    };
    fetchSession();
  }, [supabase]);

  const loadProfile = async (uid) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) setProfile(data);
  };

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setAuthError('Supabase Environment Variables missing on Vercel Dashboard!');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
      },
    });
    if (error) setAuthError(error.message);
  };

  // Email / Password Auth Handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMsg(null);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setAuthError('Supabase URL missing! Please add NEXT_PUBLIC_SUPABASE_URL to Vercel Environment Variables.');
      return;
    }

    if (authMode === 'signup' && authPass !== authConfirmPass) {
      setAuthError('Passwords do not match!');
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: authEmail, 
          password: authPass 
        });
        if (error) throw error;
        setUser(data.user);
        loadProfile(data.user.id);
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email: authEmail, 
          password: authPass,
          options: { data: { username: authEmail.split('@')[0] } }
        });
        if (error) throw error;
        if (data?.user) {
          setAuthMsg('Account created successfully! You can now log in.');
          setAuthMode('login');
          setAuthPass('');
          setAuthConfirmPass('');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Failed to fetch. Verify Supabase config.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // Generator Action
  const handleGenerate = async () => {
    setLoading(true);
    setGenError(null);
    setAccount(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, tier: genTier, userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed generation');
      setAccount(data.account);
    } catch (err) {
      setGenError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Gambling Game
  const playBlackjack = async () => {
    if (!profile || profile.gambling_credits < 1) {
      setGamblingMsg('You have used your 1 free credit!');
      return;
    }

    await supabase.from('profiles').update({ gambling_credits: 0 }).eq('id', user.id);
    setProfile({ ...profile, gambling_credits: 0 });

    const playerCard = Math.floor(Math.random() * 10) + 12;
    const dealerCard = Math.floor(Math.random() * 10) + 12;

    let msg = '';
    if (playerCard > 21) msg = `Bust! You rolled ${playerCard}. Dealer won.`;
    else if (dealerCard > 21 || playerCard > dealerCard) msg = `🎉 WIN! You score ${playerCard} vs Dealer ${dealerCard}. Reward unlocked!`;
    else msg = `Dealer won with ${dealerCard} against your ${playerCard}.`;

    setGamblingMsg(msg);
  };

  // Admin Actions
  const loadAdminUsers = async () => {
    if (profile?.role !== 'admin') return;
    const { data } = await supabase.from('profiles').select('*');
    if (data) setAdminUsers(data);
  };

  const updateUserRole = async (targetId, newRole) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', targetId);
    loadAdminUsers();
  };

  // SIGN IN / SIGN UP SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0f0f0f] border border-neutral-800 p-6 rounded-xl space-y-5">
          
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-wider text-yellow-500">peelygen</h1>
            <p className="text-xs text-neutral-400 mt-1">Sign in to access Free & Paid account generators</p>
          </div>

          {/* Google Auth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-2.5 rounded text-xs flex items-center justify-center gap-2 transition-all shadow"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-2 my-2">
            <div className="h-[1px] bg-neutral-800 flex-1" />
            <span className="text-[10px] uppercase text-neutral-500 font-bold">Or Email</span>
            <div className="h-[1px] bg-neutral-800 flex-1" />
          </div>

          {/* Form Banner Notifications */}
          {authError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
              {authError}
            </div>
          )}
          {authMsg && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400">
              {authMsg}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Email</label>
              <input 
                type="email" 
                required 
                value={authEmail} 
                onChange={(e) => setAuthEmail(e.target.value)} 
                className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-sm mt-1 focus:outline-none focus:border-yellow-500" 
              />
            </div>

            {/* Password input with show/hide toggle */}
            <div>
              <label className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Password</label>
              <div className="relative mt-1">
                <input 
                  type={showPass ? 'text' : 'password'} 
                  required 
                  value={authPass} 
                  onChange={(e) => setAuthPass(e.target.value)} 
                  className="w-full bg-black border border-neutral-800 rounded pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-yellow-500" 
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-white"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password field (Only visible when signing up) */}
            {authMode === 'signup' && (
              <div>
                <label className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Confirm Password</label>
                <div className="relative mt-1">
                  <input 
                    type={showConfirmPass ? 'text' : 'password'} 
                    required 
                    value={authConfirmPass} 
                    onChange={(e) => setAuthConfirmPass(e.target.value)} 
                    className="w-full bg-black border border-neutral-800 rounded pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-yellow-500" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-white"
                  >
                    {showConfirmPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded text-sm transition-all disabled:opacity-50 mt-2"
            >
              {authLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="text-center text-xs text-neutral-500">
            <button 
              type="button" 
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setAuthError(null);
                setAuthMsg(null);
              }} 
              className="hover:underline text-neutral-400"
            >
              {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // MAIN APP DASHBOARD
  return (
    <div className="flex min-h-screen antialiased" style={{ backgroundColor: theme.bg, color: theme.text }}>
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-neutral-900 flex flex-col justify-between shrink-0" style={{ backgroundColor: theme.card }}>
        <div>
          <div className="p-4 border-b border-neutral-900 flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full border-2 border-green-500 bg-yellow-500 flex items-center justify-center font-black text-black text-xs">
                🍌
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wider text-white">peely<span style={{ color: theme.primary }}>gen</span></div>
              <div className="text-[10px] text-green-400">Server Online</div>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-neutral-900 bg-black/20 flex items-center justify-between text-xs">
            <span className="font-semibold truncate text-white">{profile?.username || user.email}</span>
            <span className="uppercase text-[9px] font-bold px-2 py-0.5 rounded border border-neutral-700" style={{ color: theme.primary }}>
              {profile?.role || 'free'}
            </span>
          </div>

          <nav className="p-3 space-y-1 text-xs font-medium">
            {[
              { id: 'generate', label: 'Generator', icon: '⚡' },
              { id: 'gambling', label: '1-Credit Blackjack', icon: '🎰' },
              { id: 'themes', label: 'Site Themes', icon: '🎨' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-all"
                style={{
                  backgroundColor: activeTab === item.id ? `${theme.primary}20` : 'transparent',
                  color: activeTab === item.id ? theme.primary : 'inherit',
                }}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}

            {profile?.role === 'admin' && (
              <button
                onClick={() => { setActiveTab('admin'); loadAdminUsers(); }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-all text-red-500 font-bold bg-red-500/10 mt-4"
              >
                <span>👑</span> Admin Control Panel
              </button>
            )}
          </nav>
        </div>

        <div className="p-3 border-t border-neutral-900">
          <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-xs text-neutral-500 hover:text-red-400">
            ↳ Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* GENERATOR TAB */}
        {activeTab === 'generate' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Account Generator</h1>
              <p className="text-xs text-neutral-400 mt-1">Single-claim stock output (No duplicate pulls)</p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 space-y-4" style={{ backgroundColor: theme.card }}>
              
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 border border-neutral-800 rounded-lg">
                <button
                  onClick={() => setGenTier('free')}
                  className={`py-2 rounded text-xs font-bold transition-all ${genTier === 'free' ? 'bg-yellow-500 text-black' : 'text-neutral-400'}`}
                >
                  Free Gen
                </button>
                <button
                  onClick={() => setGenTier('paid')}
                  className={`py-2 rounded text-xs font-bold transition-all ${genTier === 'paid' ? 'bg-yellow-500 text-black' : 'text-neutral-400'}`}
                >
                  Paid Gen 🔒
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-neutral-400">Target Service</label>
                <select value={service} onChange={(e) => setService(e.target.value)} className="w-full bg-black border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none">
                  <option value="roblox">Roblox</option>
                  <option value="fortnite">Fortnite</option>
                  <option value="minecraft">Minecraft</option>
                  <option value="spotify">Spotify</option>
                </select>
              </div>

              <button onClick={handleGenerate} disabled={loading} className="w-full font-bold py-3 px-4 rounded-lg text-black text-sm shadow-lg disabled:opacity-50" style={{ backgroundColor: theme.primary }}>
                {loading ? 'Processing...' : `Generate (${genTier.toUpperCase()} Tier)`}
              </button>

              {genError && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">{genError}</div>}

              {account && (
                <div className="p-4 bg-black border border-neutral-800 rounded-lg font-mono text-xs text-neutral-200">
                  <div className="text-[10px] text-neutral-500 uppercase mb-1">Single-Claim Credentials</div>
                  {account}
                </div>
              )}
            </div>
          </div>
        )}

        {/* GAMBLING TAB */}
        {activeTab === 'gambling' && (
          <div className="max-w-md mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">1-Credit Blackjack</h1>
              <p className="text-xs text-neutral-400 mt-1">Every registered user gets exactly 1 free play credit</p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 space-y-4 text-center" style={{ backgroundColor: theme.card }}>
              <div className="text-xs font-mono text-neutral-400">
                Credits Available: <span className="text-yellow-400 font-bold">{profile?.gambling_credits ?? 0}</span>
              </div>

              <button
                onClick={playBlackjack}
                disabled={profile?.gambling_credits < 1}
                className="w-full font-bold py-3 px-4 rounded-lg text-black text-sm disabled:opacity-50"
                style={{ backgroundColor: theme.primary }}
              >
                Play 1-Credit Game
              </button>

              {gamblingMsg && <div className="p-3 bg-black border border-neutral-800 rounded-lg text-xs font-mono">{gamblingMsg}</div>}
            </div>
          </div>
        )}

        {/* ADMIN TAB */}
        {activeTab === 'admin' && profile?.role === 'admin' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-red-500">Admin Control Panel</h1>
              <p className="text-xs text-neutral-400 mt-1">Grant or revoke Paid Gen rights for signed-up users</p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 space-y-4" style={{ backgroundColor: theme.card }}>
              <div className="space-y-2">
                {adminUsers.map((u) => (
                  <div key={u.id} className="p-3 bg-black border border-neutral-800 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{u.username || 'No Name'}</div>
                      <div className="text-[10px] text-neutral-500">{u.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {['free', 'paid', 'admin'].map((role) => (
                        <button
                          key={role}
                          onClick={() => updateUserRole(u.id, role)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${u.role === role ? 'bg-yellow-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* THEMES TAB */}
        {activeTab === 'themes' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-white">Themes & Customizer</h1>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(presets).map((key) => (
                <div
                  key={key}
                  onClick={() => setActivePreset(key)}
                  className="p-4 rounded-xl border border-neutral-800 cursor-pointer flex items-center justify-between"
                  style={{ backgroundColor: presets[key].card }}
                >
                  <span className="text-xs font-bold capitalize text-white">{key}</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: presets[key].primary }} />
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
