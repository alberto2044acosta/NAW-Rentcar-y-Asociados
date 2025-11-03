import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         id_vehiculo AS id,
         marca,
         modelo,
         anio,
         precio_por_dia AS precio_diario
       FROM vehiculos
       WHERE disponible = 1
       ORDER BY id_vehiculo DESC`
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Error en GET /api/vehiculos:", err);
    return NextResponse.json({ error: "Error al obtener los vehículos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { marca, modelo, anio, placa, precio_diario } = body;

    if (!marca || !modelo || !anio || !placa || !precio_diario) {
      return NextResponse.json(
        { error: "Faltan campos. Requiere marca, modelo, anio, placa y precio_diario" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO vehiculos (marca, modelo, anio, placa, precio_por_dia, disponible)
      VALUES (?, ?, ?, ?, ?, 1)
    `;

    const [result] = await pool.execute<ResultSetHeader>(sql, [
      marca,
      modelo,
      anio,
      placa,
      precio_diario,
    ]);

    const insertId = (result as ResultSetHeader).insertId;

    const [selectedRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         id_vehiculo AS id,
         marca,
         modelo,
         anio,
         precio_por_dia AS precio_diario
       FROM vehiculos
       WHERE id_vehiculo = ?`,
      [insertId]
    );

    return NextResponse.json(selectedRows[0], { status: 201 });
  } catch (err: any) {
    console.error("Error en POST /api/vehiculos:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
