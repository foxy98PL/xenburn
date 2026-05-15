const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchGlobalStats() {
  const res = await fetch(`${API_BASE}/burns/stats`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchWalletStats(address) {
  const res = await fetch(`${API_BASE}/burns/daily?address=${address}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchDayBurns(date) {
  const res = await fetch(`${API_BASE}/burns/day?date=${date}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
