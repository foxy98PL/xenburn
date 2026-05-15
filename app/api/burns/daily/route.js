const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const res = await fetch(`${API_BASE}/burns/daily?address=${address}`, { cache: 'no-store' });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
