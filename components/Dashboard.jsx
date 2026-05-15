'use client';

import { useState, useEffect } from 'react';
import { fetchGlobalStats } from '../lib/api';
import { formatXen, formatUsd, formatEth, formatNumber } from '../lib/format';
import StatCard from './StatCard';
import BurnChart from './BurnChart';
import TopBurners from './TopBurners';
import WalletSearch from './WalletSearch';

const CACHE_KEY = 'xenburn_global_stats';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-12 md:col-span-5 row-span-2 rounded-2xl p-6 bg-[#111] border border-[#1e1e1e]">
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-14 w-48 mb-3" />
        <Skeleton className="h-3 w-16 mb-6" />
        <Skeleton className="h-px w-full mb-6" />
        <Skeleton className="h-8 w-32" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="col-span-6 md:col-span-4 rounded-2xl p-5 bg-[#111] border border-[#1e1e1e]">
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-7 w-28 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
      <div className="col-span-12 rounded-2xl p-6 bg-[#111] border border-[#1e1e1e]">
        <Skeleton className="h-4 w-32 mb-5" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="col-span-12 md:col-span-6 rounded-2xl p-6 bg-[#111] border border-[#1e1e1e]">
        <Skeleton className="h-4 w-24 mb-4" />
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-8 w-full mt-1" />)}
      </div>
      <div className="col-span-12 md:col-span-6 rounded-2xl p-6 bg-[#111] border border-[#1e1e1e]">
        <Skeleton className="h-4 w-20 mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setStats(cached);
      setLoading(false);
      setFromCache(true);
      return;
    }
    fetchGlobalStats()
      .then((data) => {
        writeCache(data);
        setStats(data);
        setLoading(false);
        setFromCache(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] p-4 md:p-6 max-w-[1400px] mx-auto">

      {/* ── Navbar ── */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-lime-400 flex items-center justify-center select-none">
            <span className="text-black font-black text-xs leading-none">𝕏</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">XenBurn</span>
          <span className="hidden md:block text-zinc-700 text-sm">/ Global Statistics</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${fromCache ? 'bg-amber-500' : 'bg-lime-400 pulse-lime'}`} />
          <span className="text-zinc-600 text-xs">{fromCache ? 'Cached' : 'Live'}</span>
          {fromCache && (
            <button
              onClick={() => { localStorage.removeItem(CACHE_KEY); window.location.reload(); }}
              className="text-zinc-700 hover:text-zinc-400 text-xs transition-colors ml-1"
              title="Refresh data"
            >
              ↻
            </button>
          )}
        </div>
      </header>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-2xl p-6 mb-4">
          <p className="text-red-400 font-medium">Failed to load data</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <p className="text-zinc-600 text-xs mt-2">Make sure the backend is running at {process.env.NEXT_PUBLIC_API_URL}</p>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && <LoadingGrid />}

      {/* ── Bento Grid ── */}
      {stats && !loading && (
        <div className="grid grid-cols-12 gap-3 auto-rows-auto">

          {/* ╔══════════════════╗ Hero — Total XEN Burned (spans 5 cols, 2 rows) */}
          <div className="col-span-12 md:col-span-5 md:row-span-2 relative overflow-hidden rounded-2xl p-6 bg-[#111] border border-[#1e1e1e] flex flex-col justify-between min-h-[180px]">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-400/6 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-lime-400/4 blur-3xl pointer-events-none" />
            <div className="relative">
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium mb-4">
                Total XEN Burned
              </p>
              <p className="text-lime-400 font-black leading-none lime-glow" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
                {formatXen(stats.total_tokens_burned)}
              </p>
              <p className="text-zinc-600 text-sm mt-1 font-mono">XEN</p>
            </div>
            <div className="relative mt-6 pt-5 border-t border-[#1e1e1e]">
              <p className="text-white text-2xl font-bold">{formatUsd(stats.total_usd_value)}</p>
              <p className="text-zinc-600 text-xs mt-1">estimated USD value burned</p>
              <div className="flex gap-4 mt-3">
                <div>
                  <p className="text-zinc-300 text-sm font-semibold">{formatNumber(stats.total_wallets)}</p>
                  <p className="text-zinc-700 text-xs">wallets</p>
                </div>
                <div>
                  <p className="text-zinc-300 text-sm font-semibold">{formatNumber(stats.total_tx_count)}</p>
                  <p className="text-zinc-700 text-xs">transactions</p>
                </div>
              </div>
            </div>
          </div>

          {/* ╔══════════════╗ Gas Spent */}
          <div className="col-span-6 md:col-span-4 relative overflow-hidden rounded-2xl p-5 bg-[#111] border border-[#1e1e1e]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/4 to-transparent pointer-events-none" />
            <div className="relative">
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium mb-2">Gas Spent</p>
              <p className="text-emerald-400 text-xl font-bold">{formatEth(stats.total_gas_fee_eth)}</p>
              <p className="text-zinc-600 text-xs mt-1">{formatUsd(stats.total_gas_fee_usd)} total fees</p>
            </div>
          </div>

          {/* ╔══════════╗ Avg per Wallet */}
          <div className="col-span-6 md:col-span-3 relative overflow-hidden rounded-2xl p-5 bg-[#111] border border-[#1e1e1e]">
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium mb-2">Avg / Wallet</p>
            <p className="text-white text-xl font-bold">
              {formatXen(parseFloat(stats.total_tokens_burned) / Math.max(stats.total_wallets, 1))}
            </p>
            <p className="text-zinc-600 text-xs mt-1">XEN per wallet</p>
          </div>

          {/* ╔══════════════╗ Avg Tx Size */}
          <div className="col-span-6 md:col-span-4 relative overflow-hidden rounded-2xl p-5 bg-[#111] border border-[#1e1e1e]">
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium mb-2">Avg Burn Size</p>
            <p className="text-white text-xl font-bold">
              {formatXen(parseFloat(stats.total_tokens_burned) / Math.max(stats.total_tx_count, 1))}
            </p>
            <p className="text-zinc-600 text-xs mt-1">XEN per transaction</p>
          </div>

          {/* ╔══════════╗ Avg Gas */}
          <div className="col-span-6 md:col-span-3 relative overflow-hidden rounded-2xl p-5 bg-[#111] border border-[#1e1e1e]">
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium mb-2">Avg Gas / Tx</p>
            <p className="text-white text-xl font-bold">
              {(parseFloat(stats.total_gas_fee_eth) / Math.max(stats.total_tx_count, 1)).toFixed(5)}
            </p>
            <p className="text-zinc-600 text-xs mt-1">ETH per tx</p>
          </div>

          {/* ╔═══════════════════════════════╗ Burn Chart (full width) */}
          <div className="col-span-12 rounded-2xl p-6 bg-[#111] border border-[#1e1e1e]">
            <BurnChart daily={stats.daily} title="Global Burn History" />
          </div>

          {/* ╔═════════════════╗ Top Burners */}
          <div className="col-span-12 md:col-span-6 rounded-2xl p-6 bg-[#111] border border-[#1e1e1e]">
            <TopBurners burners={stats.top_burners} />
          </div>

          {/* ╔═════════════════╗ Wallet Search */}
          <div className="col-span-12 md:col-span-6 rounded-2xl p-6 bg-[#111] border border-[#1e1e1e]">
            <WalletSearch />
          </div>

          {/* ╔═══════════════════════════════╗ Footer */}
          <div className="col-span-12 flex items-center justify-between pt-2 pb-4">
            <p className="text-zinc-700 text-xs">
              XenBurn · Data from Ethereum Mainnet via Alchemy
            </p>
            <p className="text-zinc-700 text-xs">
              {stats.total_tx_count?.toLocaleString()} verified burns · {stats.total_wallets?.toLocaleString()} wallets
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
