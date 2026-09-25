'use client';
import { useState } from 'react';

export default function Home() {
  const [service, setService] = useState('roblox');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    <div className="min-h-screen bg-[#0d0d11] text-gray-100 flex flex-col items-center justify-center p-4">
      {/* Background Accent glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <main className="w-full max-w-lg bg-[#16161e] border border-gray-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-semibold rounded-full mb-3 uppercase tracking-wider">
            v1.0 Operational
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Peely<span className="text-yellow-400">Gen</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Instant account generation powered by Upstash & Supabase.
          </p>
        </div>

        {/* Generator Controls */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Select Service
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full bg-[#0d0d11] border border-gray-700/80 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-yellow-400 transition-colors"
            >
              <option value="roblox">Roblox</option>
              <option value="minecraft">Minecraft</option>
              <option value="spotify">Spotify</option>
              <option value="fortnite">Fortnite</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-yellow-400/10 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </span>
            ) : (
              'Generate Account'
            )}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <span className="font-semibold">Error: </span>
            {error}
          </div>
        )}

        {/* Result Output Card */}
        {account && (
          <div className="mt-6 p-5 bg-[#0d0d11] border border-yellow-500/30 rounded-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                Generated Result
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(typeof account === 'string' ? account : JSON.stringify(account))}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="text-sm font-mono text-gray-200 whitespace-pre-wrap break-all bg-black/40 p-3 rounded-lg border border-gray-800">
              {typeof account === 'object' ? JSON.stringify(account, null, 2) : account}
            </pre>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 text-xs text-gray-500">
        &copy; {new Date().getFullYear()} PeelyGen • All rights reserved
      </footer>
    </div>
  );
}
