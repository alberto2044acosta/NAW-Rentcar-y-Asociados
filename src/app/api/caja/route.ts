// /app/api/caja/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { validarCamposVacios } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const { tipo, monto, descripcion, usuario } = await req.json();

    const camposValidos = validarCamposVacios({ tipo, monto, descripcion, usuario });
    if (!camposValidos) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    if (monto <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser mayor que 0." },
        { status: 400 }
      );
    }

    await pool.query(
      "INSERT INTO transacciones_caja (tipo, monto, descripcion, usuario, fecha) VALUES (?, ?, ?, ?, NOW())",
      [tipo, monto, descripcion, usuario]
    );

    return NextResponse.json({ mensaje: "Transacción registrada correctamente." });
  } catch (error: any) {
    console.error("Error al registrar transacción:", error);
    return NextResponse.json(
      { error: "Error al registrar la transacción." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM transacciones_caja ORDER BY fecha DESC"
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error al obtener transacciones:", error);
    return NextResponse.json(
      { error: "Error al obtener las transacciones." },
      { status: 500 }
    );
  }
}
