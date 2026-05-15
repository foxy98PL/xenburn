export function formatXen(value) {
  const num = parseFloat(value);
  if (isNaN(num) || num === 0) return '0';
  if (num >= 1e15) return (num / 1e15).toFixed(2) + ' Q';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9)  return (num / 1e9).toFixed(2)  + 'B';
  if (num >= 1e6)  return (num / 1e6).toFixed(2)  + 'M';
  if (num >= 1e3)  return (num / 1e3).toFixed(2)  + 'K';
  return num.toFixed(2);
}

export function formatUsd(value) {
  if (value == null || isNaN(value)) return '$—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatEth(value) {
  const num = parseFloat(value);
  if (isNaN(num) || num === 0) return '0 ETH';
  if (num >= 1000) return num.toFixed(2) + ' ETH';
  return num.toFixed(4) + ' ETH';
}

export function formatNumber(value) {
  if (value == null) return '0';
  return new Intl.NumberFormat('en-US').format(value);
}

export function shortAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

export function formatMonthLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}
