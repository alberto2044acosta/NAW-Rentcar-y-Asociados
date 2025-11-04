import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { validarCamposVacios } from "@/lib/validations";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

// ✅ Registrar pago
export async function POST(req: Request) {
  try {
    const { id_alquiler, metodo, monto } = await req.json();
    validarCamposVacios({ id_alquiler, metodo, monto });

    if (Number(monto) <= 0) throw new Error("El monto debe ser positivo");

    const [alquiler] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM alquileres WHERE id = ?",
      [id_alquiler]
    );

    if (alquiler.length === 0)
      throw new Error("El alquiler no existe o es inválido");

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO pagos (id_alquiler, metodo, monto, fecha_pago) VALUES (?, ?, ?, NOW())",
      [id_alquiler, metodo, monto]
    );

    return NextResponse.json({
      exito: true,
      mensaje: "Pago registrado correctamente",
      id_pago: result.insertId,
    });
  } catch (error: any) {
    return NextResponse.json({ exito: false, mensaje: error.message });
  }
}

// ✅ Listar pagos por usuario
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_usuario = searchParams.get("id_usuario");

    if (!id_usuario) throw new Error("Debe indicar el ID del usuario");

    const [pagos] = await pool.query<RowDataPacket[]>(
      `SELECT p.id, p.metodo, p.monto, p.fecha_pago, a.id_reserva
       FROM pagos p
       JOIN alquileres a ON a.id = p.id_alquiler
       JOIN reservas r ON r.id = a.id_reserva
       WHERE r.id_usuario = ?
       ORDER BY p.fecha_pago DESC`,
      [id_usuario]
    );

    return NextResponse.json({ exito: true, pagos });
  } catch (error: any) {
    return NextResponse.json({ exito: false, mensaje: error.message });
  }
}
