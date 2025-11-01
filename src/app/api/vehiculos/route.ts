import connection from '@/lib/db';

export async function GET() {
  const [rows] = await connection.query('SELECT * FROM vehiculos WHERE disponible = 1');
  return new Response(JSON.stringify(rows), { status: 200 });
}