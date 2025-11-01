import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET() {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, marca, modelo, anio, precio_diario FROM vehiculos WHERE disponible = 1 ORDER BY id DESC"
  );
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { marca, modelo, anio, placa, precio_diario } = body;

    if (!marca || !modelo || !anio || !placa || !precio_diario) {
      return NextResponse.json(
        { error: "Faltan campos. Requiere marca, modelo, anio, placa, precio_diario" },
        { status: 400 }
      );
    }

    const sql =
      "INSERT INTO vehiculos (marca, modelo, anio, placa, precio_diario, disponible) VALUES (?, ?, ?, ?, ?, 1)";

    const [result] = await pool.execute<ResultSetHeader>(sql, [
      marca,
      modelo,
      anio,
      placa,
      precio_diario,
    ]);
    const insertId = result.insertId;

    const [selectedRows] = await pool.query<RowDataPacket[]>(
      "SELECT id, marca, modelo, anio, precio_diario FROM vehiculos WHERE id = ?",
      [insertId]
    );

    return NextResponse.json(selectedRows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
