'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchDayBurns } from '../lib/api';
import { formatXen, formatUsd, formatEth, formatNumber, shortAddress } from '../lib/format';

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
    </div>
  );
}

function Row({ b, i, xenPrice, ethPrice }) {
  const gasEth = parseFloat(b.gas_fee_eth) || 0;
  return (
    <div className={`grid grid-cols-12 gap-1 px-3 py-2 rounded-lg transition-colors hover:bg-white/[0.04] ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
      {/* rank */}
      <span className="col-span-1 text-zinc-600 text-xs self-center">{i + 1}</span>

      {/* address + tx link */}
      <div className="col-span-3 self-center">
        <a
          href={`https://etherscan.io/address/${b.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] text-zinc-400 hover:text-lime-400 transition-colors"
        >
          {shortAddress(b.address)}
        </a>
      </div>

      {/* XEN burned */}
      <div className="col-span-3 text-right self-center">
        <p className="text-xs text-white font-medium">{formatXen(b.tokens_burned)}<span className="text-zinc-600 ml-0.5 text-[10px]">XEN</span></p>
        {b.usd_value != null && (
          <p className="text-zinc-600 text-[10px]">{formatUsd(b.usd_value)}</p>
        )}
      </div>

      {/* gas */}
      <div className="col-span-3 text-right self-center">
        {gasEth > 0 ? (
          <>
            <p className="text-xs text-emerald-400">{gasEth.toFixed(5)}<span className="text-zinc-600 ml-0.5 text-[10px]">ETH</span></p>
            {b.gas_fee_usd != null && (
              <p className="text-zinc-600 text-[10px]">{formatUsd(b.gas_fee_usd)}</p>
            )}
          </>
        ) : (
          <span className="text-zinc-700 text-xs">—</span>
        )}
      </div>

      {/* tx link */}
      <div className="col-span-2 text-right self-center">
        <a
          href={`https://etherscan.io/tx/${b.tx_hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-700 hover:text-zinc-400 text-[10px] font-mono transition-colors"
          title={b.tx_hash}
        >
          ↗ tx
        </a>
      </div>
    </div>
  );
}

export default function DayModal({ date, onClose }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    setError(null);
    setData(null);
    fetchDayBurns(date)
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [date]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const burns    = data?.burns ?? [];
  const filtered = search.trim()
    ? burns.filter((b) => b.address.toLowerCase().includes(search.trim().toLowerCase()))
    : burns;

  // summary stats
  const totalXen    = burns.reduce((s, b) => s + parseFloat(b.tokens_burned || 0), 0);
  const totalUsd    = burns.reduce((s, b) => s + (b.usd_value ?? 0), 0);
  const totalGasEth = burns.reduce((s, b) => s + parseFloat(b.gas_fee_eth || 0), 0);
  const totalGasUsd = burns.reduce((s, b) => s + (b.gas_fee_usd ?? 0), 0);

  const fmt = (d) => {
    if (!d) return '';
    const dt = new Date(d + 'T00:00:00Z');
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  };

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* blur bg */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#111] border border-[#2a2a2a] shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-[#1e1e1e] shrink-0">
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium mb-1">Daily Burns</p>
            <h2 className="text-white font-bold text-lg">{fmt(date)}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-white transition-colors text-xl leading-none mt-0.5 ml-4"
          >
            ✕
          </button>
        </div>

        {/* ── Summary row ── */}
        {!loading && data && (
          <div className="grid grid-cols-4 gap-3 px-5 py-3 border-b border-[#1e1e1e] shrink-0">
            <div>
              <p className="text-zinc-600 text-[10px] uppercase tracking-widest">Wallets</p>
              <p className="text-white text-sm font-semibold mt-0.5">{formatNumber(burns.length)}</p>
            </div>
            <div>
              <p className="text-zinc-600 text-[10px] uppercase tracking-widest">XEN Burned</p>
              <p className="text-lime-400 text-sm font-semibold mt-0.5">{formatXen(totalXen)}</p>
              {totalUsd > 0 && <p className="text-zinc-600 text-[10px]">{formatUsd(totalUsd)}</p>}
            </div>
            <div>
              <p className="text-zinc-600 text-[10px] uppercase tracking-widest">Gas Spent</p>
              <p className="text-emerald-400 text-sm font-semibold mt-0.5">{totalGasEth > 0 ? totalGasEth.toFixed(4) + ' ETH' : '—'}</p>
              {totalGasUsd > 0 && <p className="text-zinc-600 text-[10px]">{formatUsd(totalGasUsd)}</p>}
            </div>
            <div>
              <p className="text-zinc-600 text-[10px] uppercase tracking-widest">Prices</p>
              {data.eth_price_usd && <p className="text-zinc-300 text-[11px] mt-0.5">ETH {formatUsd(data.eth_price_usd)}</p>}
              {data.xen_price_usd && <p className="text-zinc-500 text-[10px]">XEN ${data.xen_price_usd < 0.0001 ? data.xen_price_usd.toExponential(2) : data.xen_price_usd.toFixed(6)}</p>}
            </div>
          </div>
        )}

        {/* ── Search ── */}
        {!loading && burns.length > 0 && (
          <div className="px-5 py-2.5 border-b border-[#1e1e1e] shrink-0">
            <input
              type="text"
              placeholder="Filter by address…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-lime-400/40 transition-colors"
            />
          </div>
        )}

        {/* ── List ── */}
        <div className="flex-1 overflow-y-auto">
          {loading && <Spinner />}
          {error && (
            <div className="px-5 py-8 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {!loading && !error && (
            <>
              {filtered.length === 0 && (
                <p className="text-zinc-600 text-sm text-center py-10">
                  {search ? 'No matching addresses' : 'No burns recorded for this day'}
                </p>
              )}
              {filtered.length > 0 && (
                <div className="px-2 py-2">
                  {/* table header */}
                  <div className="grid grid-cols-12 gap-1 px-3 pb-1.5 border-b border-[#1e1e1e] mb-1">
                    <span className="col-span-1 text-zinc-700 text-[10px]">#</span>
                    <span className="col-span-3 text-zinc-700 text-[10px]">Address</span>
                    <span className="col-span-3 text-zinc-700 text-[10px] text-right">XEN Burned</span>
                    <span className="col-span-3 text-zinc-700 text-[10px] text-right">Gas</span>
                    <span className="col-span-2 text-zinc-700 text-[10px] text-right">Tx</span>
                  </div>
                  {filtered.map((b, i) => (
                    <Row key={b.tx_hash} b={b} i={i} xenPrice={data?.xen_price_usd} ethPrice={data?.eth_price_usd} />
                  ))}
                  {search && filtered.length < burns.length && (
                    <p className="text-zinc-700 text-xs text-center py-2">{filtered.length} / {burns.length} shown</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
