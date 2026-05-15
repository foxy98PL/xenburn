'use client';

import { useState } from 'react';
import { formatXen, formatUsd, formatEth, formatNumber, shortAddress } from '../lib/format';

const PAGE_SIZE   = 25;
const RANK_COLORS = ['text-lime-400', 'text-zinc-300', 'text-amber-500'];
const RANK_BG     = ['bg-lime-400/10', 'bg-zinc-700/20', 'bg-amber-500/10'];

export default function TopBurners({ burners = [] }) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(burners.length / PAGE_SIZE));
  const pageStart  = page * PAGE_SIZE;
  const visible    = burners.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium mb-1">Leaderboard</p>
          <h3 className="text-white font-semibold text-base">Top Burners</h3>
        </div>
        {burners.length > 0 && (
          <span className="text-zinc-700 text-xs">{burners.length} wallets</span>
        )}
      </div>

      {burners.length === 0 && (
        <p className="text-zinc-700 text-sm text-center py-8">No data yet</p>
      )}

      <div className="space-y-0.5">
        {/* Header */}
        <div className="grid grid-cols-12 gap-1 px-3 pb-2 border-b border-[#1e1e1e]">
          <span className="col-span-1 text-zinc-600 text-[10px]">#</span>
          <span className="col-span-3 text-zinc-600 text-[10px]">Address</span>
          <span className="col-span-4 text-zinc-600 text-[10px] text-right">XEN Burned</span>
          <span className="col-span-2 text-zinc-600 text-[10px] text-right">USD</span>
          <span className="col-span-2 text-zinc-600 text-[10px] text-right">Txs</span>
        </div>

        {visible.map((b, idx) => {
          const globalRank = pageStart + idx;
          const gasEth     = parseFloat(b.gas_fee_eth) || 0;
          const rankColor  = RANK_COLORS[globalRank] ?? 'text-zinc-600';
          const rankBg     = RANK_BG[globalRank]     ?? '';

          return (
            <div
              key={b.address}
              className={`grid grid-cols-12 gap-1 px-3 py-2 rounded-xl transition-colors group
                hover:bg-white/[0.04] ${globalRank < 3 ? rankBg : ''}`}
            >
              {/* Rank */}
              <span className={`col-span-1 text-xs font-bold self-center ${rankColor}`}>
                {globalRank + 1}
              </span>

              {/* Address */}
              <div className="col-span-3 self-center">
                <a
                  href={`https://etherscan.io/address/${b.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-zinc-400 group-hover:text-lime-400 hover:text-lime-400 transition-colors"
                >
                  {shortAddress(b.address)}
                </a>
              </div>

              {/* XEN + gas sub-line */}
              <div className="col-span-4 text-right self-center">
                <p className={`text-xs font-semibold ${globalRank === 0 ? 'text-lime-400' : 'text-white'}`}>
                  {formatXen(b.tokens_burned)}
                  <span className="text-zinc-600 ml-0.5 text-[10px] font-normal">XEN</span>
                </p>
                {gasEth > 0 && (
                  <p className="text-zinc-600 text-[10px] mt-0.5">
                    ⛽ {gasEth.toFixed(4)} ETH
                  </p>
                )}
              </div>

              {/* USD value */}
              <div className="col-span-2 text-right self-center">
                <p className="text-xs text-zinc-400">
                  {b.usd_value != null ? formatUsd(b.usd_value) : <span className="text-zinc-700">—</span>}
                </p>
              </div>

              {/* Txs */}
              <div className="col-span-2 text-right self-center">
                <p className="text-xs text-zinc-500">{formatNumber(b.tx_count)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1e1e1e]">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-[#1a1a1a] hover:bg-[#222] disabled:hover:bg-[#1a1a1a]"
          >
            ← Prev
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-6 h-6 rounded text-[10px] font-medium transition-colors ${
                  i === page
                    ? 'bg-lime-400 text-black'
                    : 'text-zinc-600 hover:text-zinc-300 bg-[#1a1a1a] hover:bg-[#222]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-[#1a1a1a] hover:bg-[#222] disabled:hover:bg-[#1a1a1a]"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

