const API_BASE = process.env.API_URL || 'http://localhost:3000';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const res = await fetch(`${API_BASE}/burns/day?date=${date}`, { cache: 'no-store' });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
