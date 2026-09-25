'use client';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function App() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  
  // Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authMode, setAuthMode] = useState('login');

  // App Navigation & Settings
  const [activeTab, setActiveTab] = useState('generate');
  const [activePreset, setActivePreset] = useState('peelygen');

  // Generator State
  const [genTier, setGenTier] = useState('free'); // 'free' or 'paid'
  const [service, setService] = useState('roblox');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState(null);

  // Gambling State
  const [blackjackState, setBlackjackState] = useState(null);
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

  // Load User & Profile
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    };
    fetchSession();
  }, []);

  const loadProfile = async (uid) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) setProfile(data);
  };

  // Auth Handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass });
      if (error) alert(error.message);
      else { setUser(data.user); loadProfile(data.user.id); }
    } else {
      const { data, error } = await supabase.auth.signUp({ 
        email: authEmail, 
        password: authPass,
        options: { data: { username: authEmail.split('@')[0] } }
      });
      if (error) alert(error.message);
      else alert('Account created! You can now log in.');
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

  // Gambling: 1-Credit Blackjack Game
  const playBlackjack = async () => {
    if (!profile || profile.gambling_credits < 1) {
      setGamblingMsg('You have used your 1 free credit!');
      return;
    }

    // Deduct 1 credit
    await supabase.from('profiles').update({ gambling_credits: 0 }).eq('id', user.id);
    setProfile({ ...profile, gambling_credits: 0 });

    const playerCard = Math.floor(Math.random() * 10) + 12; // 12-21
    const dealerCard = Math.floor(Math.random() * 10) + 12;

    let msg = '';
    if (playerCard > 21) msg = `Bust! You rolled ${playerCard}. Dealer won.`;
    else if (dealerCard > 21 || playerCard > dealerCard) msg = `🎉 WIN! You score ${playerCard} vs Dealer ${dealerCard}. Reward unlocked!`;
    else msg = `Dealer won with ${dealerCard} against your ${playerCard}.`;

    setBlackjackState({ playerCard, dealerCard });
    setGamblingMsg(msg);
  };

  // Admin: Load all users
  const loadAdminUsers = async () => {
    if (profile?.role !== 'admin') return;
    const { data } = await supabase.from('profiles').select('*');
    if (data) setAdminUsers(data);
  };

  const updateUserRole = async (targetId, newRole) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', targetId);
    loadAdminUsers();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-4">
        <form onSubmit={handleAuth} className="w-full max-w-md bg-[#0f0f0f] border border-neutral-800 p-6 rounded-xl space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-wider text-yellow-500">peelygen</h1>
            <p className="text-xs text-neutral-400 mt-1">Sign in to access Free & Paid account generators</p>
          </div>
          <div>
            <label className="text-xs text-neutral-400 uppercase font-bold">Email</label>
            <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-sm mt-1 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-neutral-400 uppercase font-bold">Password</label>
            <input type="password" required value={authPass} onChange={(e) => setAuthPass(e.target.value)} className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-sm mt-1 focus:outline-none" />
          </div>
          <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded text-sm transition-all">
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
          <div className="text-center text-xs text-neutral-500">
            <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="hover:underline">
              {authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen antialiased" style={{ backgroundColor: theme.bg, color: theme.text }}>
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-neutral-900 flex flex-col justify-between shrink-0" style={{ backgroundColor: theme.card }}>
        <div>
          {/* PeelyGen Brand Logo Header */}
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

          {/* Profile Strip */}
          <div className="px-4 py-3 border-b border-neutral-900 bg-black/20 flex items-center justify-between text-xs">
            <span className="font-semibold truncate text-white">{profile?.username || user.email}</span>
            <span className="uppercase text-[9px] font-bold px-2 py-0.5 rounded border border-neutral-700" style={{ color: theme.primary }}>
              {profile?.role || 'free'}
            </span>
          </div>

          {/* Navigation */}
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

            {/* Admin Panel Tab (Only visible to Admin) */}
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
              
              {/* Free Gen vs Paid Gen Selector */}
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
