'use client';
import { useState } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('themes');
  const [activePreset, setActivePreset] = useState('hellgen');
  const [service, setService] = useState('roblox');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Customizer color state
  const [colors, setColors] = useState({
    background: '#080808',
    text: '#f0f0f0',
    cardSurface: '#0f0f0f',
    sidebar: '#111111',
    contentArea: '#0d0d0d',
  });

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
    <div className="flex min-h-screen bg-[#080808] text-[#f0f0f0] font-sans antialiased selection:bg-red-500/30 selection:text-red-400">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 border-r border-neutral-900 bg-[#0b0b0b] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-5 flex items-center gap-3 border-b border-neutral-900">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center font-black text-black text-xs shadow-lg shadow-red-600/20">
              PG
            </div>
            <span className="font-bold text-lg tracking-wider text-white">
              peely<span className="text-red-500">gen</span>
            </span>
          </div>

          {/* User Profile Info */}
          <div className="px-5 py-4 border-b border-neutral-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden flex items-center justify-center text-xs font-bold">
              SW
            </div>
            <div className="truncate">
              <div className="text-sm font-semibold truncate text-neutral-200">sweat</div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Premium</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-6 text-xs font-medium text-neutral-400">
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-widest text-neutral-600 uppercase">
                Pinned
              </div>
              <button 
                onClick={() => setActiveTab('media')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2.5 transition-colors ${activeTab === 'media' ? 'bg-neutral-900 text-white font-semibold' : 'hover:bg-neutral-900/50 hover:text-neutral-200'}`}
              >
                <span>🎥</span> media
              </button>
            </div>

            <div>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-widest text-neutral-600 uppercase">
                Main
              </div>
              <div className="space-y-0.5">
                {[
                  { id: 'home', label: 'home', icon: '🏠' },
                  { id: 'generate', label: 'generate', icon: '⚡' },
                  { id: 'themes', label: 'themes', icon: '🎨' },
                  { id: 'activity', label: 'activity', icon: '📈' },
                  { id: 'vault', label: 'vault', icon: '🔒' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2.5 transition-colors ${activeTab === item.id ? 'bg-neutral-900 text-red-500 font-semibold' : 'hover:bg-neutral-900/50 hover:text-neutral-200'}`}
                  >
                    <span>{item.icon}</span> {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-widest text-neutral-600 uppercase">
                Rewards
              </div>
              <div className="space-y-0.5">
                {['invite rewards', 'message rewards', 'boost rewards', 'referral rewards'].map((item) => (
                  <button key={item} className="w-full text-left px-3 py-1.5 rounded-md hover:bg-neutral-900/50 hover:text-neutral-200 transition-colors">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Sign Out Button */}
        <div className="p-3 border-t border-neutral-900">
          <button className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-2">
            <span>↳</span> sign out
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0d0d0d]">
        
        {/* Top View Viewport: Render selected tab view */}
        {activeTab === 'generate' ? (
          
          /* GENERATOR VIEW */
          <div className="p-8 max-w-xl mx-auto w-full my-auto">
            <div className="bg-[#0f0f0f] border border-neutral-800/80 rounded-xl p-6 shadow-2xl relative">
              <div className="text-center mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                  Operational
                </span>
                <h1 className="text-2xl font-bold text-white mt-3">Generator Dashboard</h1>
                <p className="text-xs text-neutral-400 mt-1">Select a service to pull credentials from inventory</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Select Service
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full bg-[#080808] border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="roblox">Roblox</option>
                    <option value="fortnite">Fortnite</option>
                    <option value="minecraft">Minecraft</option>
                    <option value="spotify">Spotify</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 text-sm shadow-lg shadow-red-600/20 active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Account'}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                  {error}
                </div>
              )}

              {account && (
                <div className="mt-4 p-4 bg-[#080808] border border-neutral-800 rounded-lg font-mono text-xs">
                  <div className="flex justify-between items-center text-neutral-500 text-[10px] mb-2 uppercase tracking-wider">
                    <span>Generated Result</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(typeof account === 'string' ? account : JSON.stringify(account))}
                      className="hover:text-white transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="text-neutral-200 whitespace-pre-wrap break-all">
                    {typeof account === 'object' ? JSON.stringify(account, null, 2) : account}
                  </pre>
                </div>
              )}
            </div>
          </div>

        ) : (

          /* THEME EDITOR DASHBOARD VIEW (Default) */
          <div className="p-8 max-w-6xl w-full mx-auto space-y-6">
            
            {/* Header Title */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">themes</h1>
              <p className="text-xs text-neutral-400 mt-0.5">customize every aspect of your dashboard</p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Presets List */}
              <div className="col-span-12 lg:col-span-5 space-y-6">
                
                {/* Presets Card */}
                <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                      <span>🎨</span> presets
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">31 total</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Search presets"
                    className="w-full bg-[#080808] border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 mb-3"
                  />

                  <div className="space-y-2">
                    {[
                      { id: 'hellgen', name: 'hell gen', desc: 'default crimson & black', color: 'bg-red-600' },
                      { id: 'midnight', name: 'midnight', desc: 'deep indigo void', color: 'bg-indigo-600' },
                      { id: 'neongreen', name: 'neon green', desc: 'terminal hacker mode', color: 'bg-emerald-500' },
                      { id: 'ice', name: 'ice', desc: 'arctic blue frost', color: 'bg-sky-400' },
                      { id: 'purplehaze', name: 'purple haze', desc: 'deep violet atmosphere', color: 'bg-purple-600' },
                      { id: 'blood', name: 'blood', desc: 'deep crimson darkness', color: 'bg-red-800' },
                    ].map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => setActivePreset(preset.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${activePreset === preset.id ? 'border-red-600/60 bg-red-950/10' : 'border-neutral-800/80 bg-[#080808] hover:border-neutral-700'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${preset.color}`} />
                          <div>
                            <div className="text-xs font-bold text-neutral-200">{preset.name}</div>
                            <div className="text-[10px] text-neutral-500">{preset.desc}</div>
                          </div>
                        </div>
                        {activePreset === preset.id && <span className="text-xs text-red-500 font-bold">✓</span>}
                      </div>
                    ))}
                  </div>

                  {/* Pagination Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-900 text-[10px] text-neutral-500">
                    <button className="px-2.5 py-1 rounded bg-[#080808] border border-neutral-800 hover:text-neutral-300">‹ prev</button>
                    <span>page 1 of 6</span>
                    <button className="px-2.5 py-1 rounded bg-[#080808] border border-neutral-800 hover:text-neutral-300">next ›</button>
                  </div>
                </div>

                {/* Live Preview Panel */}
                <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl p-4">
                  <div className="text-xs font-semibold text-neutral-200 flex items-center gap-2 mb-3">
                    <span>👁</span> preview
                  </div>
                  <div className="bg-[#080808] border border-neutral-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-600" />
                      <span className="text-xs font-bold text-white">hellgen</span>
                    </div>
                    <p className="text-[10px] text-neutral-500">preview of your theme configuration</p>
                    <button className="w-full bg-red-600 text-white font-medium text-xs py-2 rounded-lg shadow-md shadow-red-600/20">
                      sample button
                    </button>
                    <input
                      disabled
                      placeholder="sample input field"
                      className="w-full bg-[#111111] border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-500"
                    />
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Color Property Editor */}
              <div className="col-span-12 lg:col-span-7 space-y-4">
                
                {/* Action Bar */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                  <div className="flex bg-[#0f0f0f] p-1 rounded-lg border border-neutral-800 text-xs font-medium">
                    <button className="bg-red-600 text-white px-3 py-1 rounded-md shadow">colors</button>
                    <button className="text-neutral-400 px-3 py-1 hover:text-white">fonts</button>
                    <button className="text-neutral-400 px-3 py-1 hover:text-white">effects</button>
                    <button className="text-neutral-400 px-3 py-1 hover:text-white">background</button>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <button className="px-2.5 py-1.5 rounded-lg border border-neutral-800 bg-[#0f0f0f] text-neutral-300 hover:bg-neutral-800">
                      save theme
                    </button>
                  </div>
                </div>

                {/* Sub-category Tabs */}
                <div className="flex gap-2 border-b border-neutral-900 pb-2 text-xs font-medium text-neutral-400">
                  <button className="text-red-500 border-b-2 border-red-500 pb-2 px-1">backgrounds</button>
                  <button className="hover:text-neutral-200 px-1">brand</button>
                  <button className="hover:text-neutral-200 px-1">surfaces</button>
                  <button className="hover:text-neutral-200 px-1">sidebar</button>
                </div>

                {/* Color Inputs Grid */}
                <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl p-4 space-y-3">
                  {[
                    { label: 'background', key: 'background' },
                    { label: 'text', key: 'text' },
                    { label: 'card surface', key: 'cardSurface' },
                    { label: 'sidebar / navbar', key: 'sidebar' },
                    { label: 'content area', key: 'contentArea' },
                  ].map((field) => (
                    <div key={field.key} className="flex items-center justify-between p-2.5 rounded-lg bg-[#080808] border border-neutral-800/60">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={colors[field.key]}
                          onChange={(e) => setColors({ ...colors, [field.key]: e.target.value })}
                          className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-medium text-neutral-300">{field.label}</span>
                      </div>
                      <span className="font-mono text-xs text-neutral-500 uppercase">{colors[field.key]}</span>
                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
