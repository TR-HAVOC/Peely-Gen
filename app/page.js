'use client';
import { useState } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [activePreset, setActivePreset] = useState('peelygen');
  const [service, setService] = useState('roblox');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Upgrader / Gambling state
  const [upgradeInput, setUpgradeInput] = useState('');
  const [multiplier, setMultiplier] = useState(2);
  const [upgradeResult, setUpgradeResult] = useState(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Dynamic Theme Preset Mapping (Yellow as Default)
  const presets = {
    peelygen: { primary: '#eab308', bg: '#080808', card: '#0f0f0f', text: '#f0f0f0' }, // Yellow default
    midnight: { primary: '#4f46e5', bg: '#05050a', card: '#0d0d18', text: '#e0e7ff' },
    neongreen: { primary: '#10b981', bg: '#020b06', card: '#06170d', text: '#d1fae5' },
    ice: { primary: '#38bdf8', bg: '#030a12', card: '#091522', text: '#e0f2fe' },
    purplehaze: { primary: '#9333ea', bg: '#0a0312', card: '#140824', text: '#f3e8ff' },
    crimson: { primary: '#dc2626', bg: '#080101', card: '#120404', text: '#fee2e2' },
  };

  const currentTheme = presets[activePreset] || presets.peelygen;

  // Gambling / Upgrade Logic
  const handleUpgrade = () => {
    if (!upgradeInput) return;
    setIsUpgrading(true);
    setUpgradeResult(null);

    setTimeout(() => {
      const winChance = (95 / multiplier);
      const roll = Math.random() * 100;
      const success = roll <= winChance;

      setIsUpgrading(false);
      setUpgradeResult({
        success,
        roll: roll.toFixed(2),
        target: winChance.toFixed(2),
        reward: success ? `${upgradeInput} [UPGRADED ${multiplier}X]` : null
      });
    }, 1500);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setAccount(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate account');
      setAccount(data.account || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen font-sans antialiased transition-colors duration-300"
      style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}
    >
      
      {/* 1. LEFT SIDEBAR */}
      <aside 
        className="w-64 border-r border-neutral-900/80 flex flex-col justify-between shrink-0"
        style={{ backgroundColor: currentTheme.card }}
      >
        <div>
          {/* Top Brand & Server Status Profile Header */}
          <div className="p-4 border-b border-neutral-900/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Server Profile Picture with Green Online Status Outline */}
              <div className="relative">
                <div 
                  className="w-9 h-9 rounded-full border-2 p-0.5 flex items-center justify-center font-bold text-xs text-black"
                  style={{ borderColor: '#22c55e', backgroundColor: '#eab308' }} // Green online indicator ring with Yellow avatar
                >
                  PG
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
              </div>

              <div className="truncate">
                <div className="font-extrabold text-sm tracking-wider flex items-center gap-1 text-white">
                  peely<span style={{ color: currentTheme.primary }}>gen</span>
                </div>
                <div className="text-[10px] text-green-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Server Online
                </div>
              </div>
            </div>
          </div>

          {/* User Profile Strip */}
          <div className="px-4 py-3 border-b border-neutral-900/80 flex items-center gap-3 bg-black/20">
            <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-white">
              S
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold truncate text-white">sweat</div>
              <div className="text-[9px] uppercase tracking-widest font-bold" style={{ color: currentTheme.primary }}>
                VIP Tier
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-5 text-xs font-medium">
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                Main Menu
              </div>
              <div className="space-y-1">
                {[
                  { id: 'home', label: 'home', icon: '🏠' },
                  { id: 'generate', label: 'generate', icon: '⚡' },
                  { id: 'gambling', label: 'upgrader / gamble', icon: '🎰' },
                  { id: 'themes', label: 'themes & customizer', icon: '🎨' },
                  { id: 'vault', label: 'account vault', icon: '🔒' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-all"
                    style={{
                      backgroundColor: activeTab === item.id ? `${currentTheme.primary}20` : 'transparent',
                      color: activeTab === item.id ? currentTheme.primary : 'inherit',
                      fontWeight: activeTab === item.id ? '700' : '500',
                    }}
                  >
                    <span>{item.icon}</span> {item.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-900/80 text-[11px] text-neutral-500">
          <button className="w-full text-left px-3 py-2 hover:text-yellow-400 transition-colors flex items-center gap-2">
            <span>↳</span> disconnect session
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT VIEWPORT */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* TAB 1: GENERATOR */}
        {activeTab === 'generate' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Account Generator</h1>
              <p className="text-xs text-neutral-400 mt-1">Pull high-tier stock directly from PeelyGen inventory</p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 shadow-2xl space-y-4" style={{ backgroundColor: currentTheme.card }}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-neutral-400">
                  Select Target Service
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-black/40 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none text-white"
                >
                  <option value="roblox">Roblox (Premium Stock)</option>
                  <option value="fortnite">Fortnite (Skins/Stacked)</option>
                  <option value="minecraft">Minecraft (Java/Bedrock)</option>
                  <option value="spotify">Spotify Premium</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full font-bold py-3 px-4 rounded-lg transition-all text-sm shadow-lg text-black disabled:opacity-50"
                style={{ backgroundColor: currentTheme.primary }}
              >
                {loading ? 'Fetching Account...' : 'Generate Account'}
              </button>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
                  {error}
                </div>
              )}

              {account && (
                <div className="p-4 bg-black/50 border border-neutral-800 rounded-lg font-mono text-xs">
                  <div className="flex justify-between items-center text-[10px] text-neutral-500 uppercase tracking-wider mb-2">
                    <span>Account Credentials Received</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(typeof account === 'string' ? account : JSON.stringify(account))}
                      className="hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap break-all text-neutral-200">
                    {typeof account === 'object' ? JSON.stringify(account, null, 2) : account}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GAMBLING / UPGRADER */}
        {activeTab === 'gambling' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Account Upgrader</h1>
              <p className="text-xs text-neutral-400 mt-1">Gamble your generated account for a higher-tier multiplier stock</p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 shadow-2xl space-y-5" style={{ backgroundColor: currentTheme.card }}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-neutral-400">
                  Enter Account / Item to Risk
                </label>
                <input
                  type="text"
                  value={upgradeInput}
                  onChange={(e) => setUpgradeInput(e.target.value)}
                  placeholder="e.g. Standard Roblox Account #4092"
                  className="w-full bg-black/40 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-neutral-400">
                  Target Multiplier ({multiplier}x)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1.5, 2, 5, 10].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMultiplier(m)}
                      className="py-2 rounded-lg border border-neutral-800 text-xs font-bold transition-all text-white"
                      style={{
                        backgroundColor: multiplier === m ? currentTheme.primary : 'transparent',
                        color: multiplier === m ? '#000000' : 'inherit'
                      }}
                    >
                      {m}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-black/30 rounded-lg border border-neutral-800/80 text-center space-y-1">
                <div className="text-[10px] uppercase font-bold text-neutral-500">Estimated Win Probability</div>
                <div className="text-xl font-mono font-extrabold" style={{ color: currentTheme.primary }}>
                  {((95 / multiplier)).toFixed(1)}%
                </div>
              </div>

              <button
                onClick={handleUpgrade}
                disabled={isUpgrading || !upgradeInput}
                className="w-full font-bold py-3 px-4 rounded-lg text-black transition-all text-sm disabled:opacity-50"
                style={{ backgroundColor: currentTheme.primary }}
              >
                {isUpgrading ? 'Rolling Server Hash...' : `Risk Item for ${multiplier}x Upgrade`}
              </button>

              {upgradeResult && (
                <div className={`p-4 rounded-lg border font-mono text-xs text-center space-y-1 ${upgradeResult.success ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  <div className="font-bold uppercase tracking-wider text-sm">
                    {upgradeResult.success ? '🎉 Upgrade Successful!' : '💥 Upgrade Failed'}
                  </div>
                  <p className="text-[11px] opacity-80">
                    Rolled: {upgradeResult.roll} (Needed &le; {upgradeResult.target})
                  </p>
                  {upgradeResult.reward && (
                    <p className="text-xs font-bold text-white mt-2">New Item: {upgradeResult.reward}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: THEMES & CUSTOMIZER */}
        {activeTab === 'themes' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Themes & Aesthetics</h1>
              <p className="text-xs text-neutral-400 mt-1">Switch dashboard colors live or customize palettes</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(presets).map((key) => {
                const item = presets[key];
                return (
                  <div
                    key={key}
                    onClick={() => setActivePreset(key)}
                    className="p-4 rounded-xl border border-neutral-800 cursor-pointer transition-all flex items-center justify-between"
                    style={{
                      backgroundColor: item.card,
                      borderColor: activePreset === key ? item.primary : 'rgba(38, 38, 38, 0.8)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full shadow" style={{ backgroundColor: item.primary }} />
                      <div>
                        <div className="text-xs font-bold capitalize text-white">{key === 'peelygen' ? 'peely gen (default)' : key}</div>
                        <div className="text-[10px] text-neutral-500">Preset color profile</div>
                      </div>
                    </div>
                    {activePreset === key && (
                      <span className="text-xs font-bold" style={{ color: item.primary }}>Active</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: HOME / OVERVIEW */}
        {activeTab === 'home' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
              <p className="text-xs text-neutral-400 mt-1">Live status of PeelyGen services and account stock</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-neutral-800 bg-black/30 space-y-1">
                <div className="text-[10px] uppercase font-bold text-neutral-500">Total Stock</div>
                <div className="text-2xl font-bold font-mono text-white">1,420</div>
              </div>
              <div className="p-4 rounded-xl border border-neutral-800 bg-black/30 space-y-1">
                <div className="text-[10px] uppercase font-bold text-neutral-500">Accounts Generated</div>
                <div className="text-2xl font-bold font-mono text-white">8,912</div>
              </div>
              <div className="p-4 rounded-xl border border-neutral-800 bg-black/30 space-y-1">
                <div className="text-[10px] uppercase font-bold text-neutral-500">Upgrader Win Rate</div>
                <div className="text-2xl font-bold font-mono text-green-400">48.2%</div>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
