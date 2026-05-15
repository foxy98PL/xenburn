const API_BASE = process.env.API_URL || 'http://localhost:3000';

export async function GET() {
  const res = await fetch(`${API_BASE}/burns/stats`, { cache: 'no-store' });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
