export async function fetchGlobalStats() {
  const res = await fetch('/api/burns/stats', { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchWalletStats(address) {
  const res = await fetch(`/api/burns/daily?address=${address}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchDayBurns(date) {
  const res = await fetch(`/api/burns/day?date=${date}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
