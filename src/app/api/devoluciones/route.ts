// /app/api/devoluciones/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { validarCamposVacios } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const { id_alquiler, fecha_devolucion, observaciones, usuario } = await req.json();

    const camposValidos = validarCamposVacios({ id_alquiler, fecha_devolucion, usuario });
    if (!camposValidos) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben estar completos." },
        { status: 400 }
      );
    }

    // Marcar el alquiler como devuelto
    await pool.query(
      "UPDATE alquileres SET estado = 'devuelto', fecha_devolucion = ? WHERE id_alquiler = ?",
      [fecha_devolucion, id_alquiler]
    );

    // Registrar la devolución
    await pool.query(
      "INSERT INTO devoluciones (id_alquiler, fecha_devolucion, observaciones, usuario) VALUES (?, ?, ?, ?)",
      [id_alquiler, fecha_devolucion, observaciones || '', usuario]
    );

    return NextResponse.json({ mensaje: "Devolución registrada correctamente." });
  } catch (error: any) {
    console.error("Error al registrar devolución:", error);
    return NextResponse.json(
      { error: "Error al registrar la devolución." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [rows]: any = await pool.query(
      `SELECT d.id_devolucion, a.id_alquiler, d.fecha_devolucion, d.observaciones, d.usuario 
       FROM devoluciones d 
       JOIN alquileres a ON d.id_alquiler = a.id_alquiler
       ORDER BY d.fecha_devolucion DESC`
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error al obtener devoluciones:", error);
    return NextResponse.json(
      { error: "Error al obtener las devoluciones." },
      { status: 500 }
    );
  }
}
