'use client';

import { useState } from 'react';
import { fetchWalletStats } from '../lib/api';
import { formatXen, formatUsd, formatEth, formatNumber, shortAddress } from '../lib/format';
import BurnChart from './BurnChart';

const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function WalletStatCard({ label, value, sub, lime }) {
  return (
    <div className={`rounded-xl p-4 border ${lime ? 'bg-lime-400/5 border-lime-400/20' : 'bg-[#1a1a1a] border-[#252525]'}`}>
      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-lg font-bold ${lime ? 'text-lime-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-zinc-600 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

export default function WalletSearch() {
  const [input, setInput]   = useState('');
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const isValid = ETH_ADDRESS_RE.test(input.trim());

  async function handleSearch(e) {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError(null);
    setStats(null);
    try {
      const data = await fetchWalletStats(input.trim().toLowerCase());
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-5">
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium mb-1">Wallet</p>
        <h3 className="text-white font-semibold text-base">Lookup</h3>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="0x…"
          className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm font-mono placeholder-zinc-700 outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/20 transition-all"
        />
        <button
          type="submit"
          disabled={!isValid || loading}
          className="px-4 py-2.5 rounded-xl bg-lime-400 text-black text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-lime-300 transition-colors"
        >
          {loading ? '…' : 'Search'}
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-40 w-full" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {stats && !loading && (
        <div className="space-y-4">
          {/* Address */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-lime-400 pulse-lime" />
            <p className="text-zinc-400 font-mono text-xs">{stats.address}</p>
            <span className="text-zinc-700 text-xs">· block {stats.last_synced_block?.toLocaleString()}</span>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-2">
            <WalletStatCard lime label="XEN Burned" value={formatXen(stats.total_tokens_burned)} sub="XEN" />
            <WalletStatCard label="USD Value" value={formatUsd(stats.total_usd_value)} />
            <WalletStatCard label="Gas Spent" value={formatEth(stats.total_gas_fee_eth)} sub={formatUsd(stats.total_gas_fee_usd)} />
            <WalletStatCard label="Transactions" value={formatNumber(stats.total_tx_count)} sub="verified burns" />
          </div>

          {/* Mini chart */}
          {stats.daily?.length > 0 && (
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4">
              <BurnChart daily={stats.daily} title="Wallet Burn History" compact />
            </div>
          )}

          {/* Recent transactions */}
          {stats.daily?.length > 0 && (
            <div>
              <p className="text-zinc-600 text-xs uppercase tracking-wider mb-2">Recent Transactions</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {stats.daily
                  .flatMap((d) => d.transactions ?? [])
                  .slice(-20)
                  .reverse()
                  .map((tx) => (
                    <div
                      key={tx.tx_hash}
                      className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                    >
                      <span className="font-mono text-xs text-zinc-600">{shortAddress(tx.tx_hash)}</span>
                      <span className="text-xs text-white font-medium">
                        {formatXen(tx.tokens_burned)}
                        <span className="text-zinc-600 ml-1">XEN</span>
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
