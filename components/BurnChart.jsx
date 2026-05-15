'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatXen, formatUsd, formatEth, formatNumber, formatMonthLabel } from '../lib/format';
import DayModal from './DayModal';

const RANGES = [
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: null },
];

const METRICS = [
  { label: 'XEN Burned', key: 'burned',   format: (v) => formatXen(v) + ' XEN',    color: '#a3e635', defaultType: 'area' },
  { label: 'Gas (ETH)',  key: 'gas',      format: (v) => formatEth(v),              color: '#34d399', defaultType: 'area' },
  { label: 'Tx Count',  key: 'txCount',  format: (v) => formatNumber(v) + ' txs',  color: '#fb923c', defaultType: 'bar'  },
  { label: 'USD Value', key: 'usdValue', format: (v) => formatUsd(v),              color: '#a78bfa', defaultType: 'area' },
];

const CHART_TYPES = [
  { label: 'Area', key: 'area' },
  { label: 'Bar',  key: 'bar'  },
  { label: 'Line', key: 'line' },
];

const CURVES = [
  { label: 'Smooth', key: 'monotone' },
  { label: 'Step',   key: 'step'     },
  { label: 'Linear', key: 'linear'   },
];

// â”€â”€â”€ Tooltip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function RichTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden w-64 pointer-events-none">
      <div className="px-4 py-2.5 border-b border-[#1e1e1e] flex items-center justify-between">
        <span className="text-zinc-400 text-xs font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-zinc-600 text-[10px]">{d.txCount} txs</span>
          <span className="text-lime-400/60 text-[10px]">click to explore â†’</span>
        </div>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            <span className="text-zinc-500 text-xs">XEN Burned</span>
          </div>
          <div className="text-right">
            <span className="text-lime-400 text-xs font-semibold">{formatXen(d.burned)} XEN</span>
            {d.usdValue > 0 && <p className="text-zinc-600 text-[10px] mt-0.5">{formatUsd(d.usdValue)}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-zinc-500 text-xs">Gas Spent</span>
          </div>
          <div className="text-right">
            <span className="text-emerald-400 text-xs font-semibold">{d.gas > 0 ? formatEth(d.gas) : 'â€”'}</span>
            {d.gasFeeUsd > 0 && <p className="text-zinc-600 text-[10px] mt-0.5">{formatUsd(d.gasFeeUsd)}</p>}
          </div>
        </div>
        {(d.ethPrice || d.xenPrice) && (
          <div className="flex items-center justify-between pt-2 border-t border-[#1e1e1e]">
            {d.ethPrice && (
              <div>
                <p className="text-zinc-600 text-[10px]">ETH Price</p>
                <p className="text-zinc-300 text-xs font-medium">{formatUsd(d.ethPrice)}</p>
              </div>
            )}
            {d.xenPrice && (
              <div className="text-right">
                <p className="text-zinc-600 text-[10px]">XEN Price</p>
                <p className="text-zinc-300 text-xs font-medium">
                  ${d.xenPrice < 0.0001 ? d.xenPrice.toExponential(2) : d.xenPrice.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ Small toggle pill group â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PillGroup({ options, value, onChange, accent }) {
  return (
    <div className="flex bg-[#1a1a1a] rounded-lg p-0.5 gap-0.5">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          style={value === o.key && accent ? { background: accent, color: '#000' } : {}}
          className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all whitespace-nowrap ${
            value === o.key && !accent
              ? 'bg-[#2a2a2a] text-white'
              : value !== o.key
              ? 'text-zinc-600 hover:text-zinc-400'
              : ''
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function BurnChart({ daily, title = 'Burn History', compact = false }) {
  const [range,      setRange]      = useState(null);
  const [metric,     setMetric]     = useState('burned');
  const [chartType,  setChartType]  = useState('auto');   // auto | area | bar | line
  const [scale,      setScale]      = useState('linear'); // linear | log
  const [curve,      setCurve]      = useState('monotone'); // monotone | step | linear
  const [modalDate,  setModalDate]  = useState(null);

  const activeMetric  = METRICS.find((m) => m.key === metric);
  const effectiveType = chartType === 'auto' ? (activeMetric?.defaultType ?? 'area') : chartType;

  // When switching to log scale, clamp zeros â†’ null so recharts skips them
  const chartData = useMemo(() => {
    let data = (daily ?? []).filter((d) => d.date);
    if (range) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - range);
      data = data.filter((d) => new Date(d.date + 'T00:00:00Z') >= cutoff);
    }
    return data.map((d) => {
      const burned   = parseFloat(d.tokens_burned) || 0;
      const gas      = parseFloat(d.gas_fee_eth)   || 0;
      const txCount  = d.tx_count                  || 0;
      const usdValue = d.usd_value                 || 0;
      // For log scale, 0 is invalid â€” return null so the point is skipped
      const logSafe  = (v) => (scale === 'log' ? (v > 0 ? v : null) : v);
      return {
        date:      d.date,
        burned:    logSafe(burned),
        gas:       logSafe(gas),
        txCount:   logSafe(txCount),
        usdValue:  logSafe(usdValue),
        // keep originals in payload for tooltip
        _burned:   burned,
        _gas:      gas,
        _txCount:  txCount,
        _usdValue: usdValue,
        gasFeeUsd: d.gas_fee_usd   || 0,
        ethPrice:  d.eth_price_usd || null,
        xenPrice:  d.price_usd     || null,
      };
    });
  }, [daily, range, scale]);

  const formatYAxis = (value) => {
    if (value == null || value === 0) return '';
    if (metric === 'burned')   return formatXen(value);
    if (metric === 'gas')      return value < 1 ? value.toFixed(2) : value.toFixed(1);
    if (metric === 'txCount')  return formatNumber(value);
    if (metric === 'usdValue') return formatUsd(value);
    return value;
  };

  const handleClick = (payload) => {
    const date = payload?.activePayload?.[0]?.payload?.date;
    if (date) setModalDate(date);
  };

  const chartHeight = compact ? 200 : 300;
  const color       = activeMetric?.color ?? '#a3e635';

  const yAxisProps = {
    tickFormatter: formatYAxis,
    tick:          { fill: '#52525b', fontSize: 10 },
    axisLine:      false,
    tickLine:      false,
    width:         60,
    scale:         scale,
    ...(scale === 'log'
      ? { domain: ['auto', 'auto'], allowDataOverflow: true }
      : {}),
  };

  const xAxisProps = {
    dataKey:      'date',
    tickFormatter: formatMonthLabel,
    tick:         { fill: '#52525b', fontSize: 10 },
    axisLine:     false,
    tickLine:     false,
    minTickGap:   60,
  };

  const grid = <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" vertical={false} />;

  const renderChart = () => {
    const sharedProps = {
      data:    chartData,
      margin:  { top: 5, right: 5, left: 0, bottom: 5 },
      onClick: handleClick,
    };

    if (effectiveType === 'bar') {
      return (
        <BarChart {...sharedProps}>
          {grid}
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<RichTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey={metric} fill={color} radius={[2, 2, 0, 0]} maxBarSize={14} />
        </BarChart>
      );
    }

    if (effectiveType === 'line') {
      return (
        <LineChart {...sharedProps}>
          {grid}
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<RichTooltip />} />
          <Line
            type={curve}
            dataKey={metric}
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: '#080808', strokeWidth: 2 }}
            connectNulls={scale === 'log'}
          />
        </LineChart>
      );
    }

    // area (default)
    return (
      <AreaChart {...sharedProps}>
        <defs>
          <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>
        {grid}
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<RichTooltip />} />
        <Area
          type={curve}
          dataKey={metric}
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#grad-${metric})`}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: '#080808', strokeWidth: 2 }}
          connectNulls={scale === 'log'}
        />
      </AreaChart>
    );
  };

  return (
    <>
      <div>
        {/* â”€â”€ Row 1: metrics + ranges â”€â”€ */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium mb-1">Activity</p>
            <h3 className="text-white font-semibold text-base">{title}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-[#1a1a1a] rounded-lg p-0.5 gap-0.5">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMetric(m.key)}
                  style={metric === m.key ? { background: m.color, color: '#000' } : {}}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    metric !== m.key ? 'text-zinc-500 hover:text-zinc-300' : ''
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <PillGroup options={RANGES.map(r => ({ key: String(r.days), label: r.label }))}
              value={String(range)}
              onChange={(k) => setRange(k === 'null' ? null : Number(k))}
            />
          </div>
        </div>

        {/* â”€â”€ Row 2: chart options (hidden in compact mode) â”€â”€ */}
        {!compact && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-zinc-700 text-[10px] uppercase tracking-wider mr-1">Chart</span>

            {/* Chart type */}
            <PillGroup
              options={[{ key: 'auto', label: 'Auto' }, ...CHART_TYPES]}
              value={chartType}
              onChange={setChartType}
            />

            {/* Curve â€” only for area/line */}
            {effectiveType !== 'bar' && (
              <PillGroup options={CURVES} value={curve} onChange={setCurve} />
            )}

            {/* Scale */}
            <div className="flex bg-[#1a1a1a] rounded-lg p-0.5 gap-0.5 ml-auto">
              {[{ key: 'linear', label: 'Linear' }, { key: 'log', label: 'Log' }].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setScale(s.key)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                    scale === s.key
                      ? 'bg-lime-400/20 text-lime-400 border border-lime-400/30'
                      : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <p className="w-full text-right text-zinc-700 text-[10px]">
              Click any point to see who burned that day
            </p>
          </div>
        )}

        {scale === 'log' && (
          <p className="text-amber-600/70 text-[10px] mb-2 text-right">
            Log scale â€” days with 0 activity are hidden
          </p>
        )}

        <div style={{ cursor: 'pointer' }}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {modalDate && (
        <DayModal date={modalDate} onClose={() => setModalDate(null)} />
      )}
    </>
  );
}
