'use client';
import { useState } from 'react';

export default function Home() {
  const [service, setService] = useState('roblox');
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Temporary test user ID
  const userId = 'user_12345';

  const handleGenerate = async () => {
    setLoading(true);
    setStatus('');
    setAccount('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, service })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setAccount(data.credentials);
      } else {
        setStatus(data.error);
      }
    } catch (err) {
      setLoading(false);
      setStatus('Failed to connect to backend server.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center text-indigo-400">Peely Gen</h1>
        
        <label className="block text-sm font-medium mb-2 text-slate-400">Select Service</label>
        <select 
          value={service} 
          onChange={(e) => setService(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white mb-4 focus:outline-none focus:border-indigo-500"
        >
          <option value="roblox">Roblox</option>
          <option value="spotify">Spotify</option>
          <option value="minecraft">Minecraft</option>
        </select>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 font-semibold py-3 rounded-lg transition duration-200"
        >
          {loading ? 'Generating...' : 'Generate Account'}
        </button>

        {status && (
          <p className="mt-4 text-center text-sm text-red-400 bg-red-950/50 p-3 rounded border border-red-900">
            {status}
          </p>
        )}

        {account && (
          <div className="mt-4 bg-slate-800 p-4 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Your Account Credentials:</p>
            <code className="text-sm font-mono text-green-400 select-all break-all">{account}</code>
          </div>
        )}
      </div>
    </div>
  );
}
