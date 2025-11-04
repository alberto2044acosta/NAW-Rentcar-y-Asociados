// /app/api/reglas-precio/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { validarCamposVacios } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const { tipo_vehiculo, temporada, porcentaje } = await req.json();

    const camposValidos = validarCamposVacios({ tipo_vehiculo, temporada, porcentaje });
    if (!camposValidos) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    await pool.query(
      "INSERT INTO reglas_precio (tipo_vehiculo, temporada, porcentaje) VALUES (?, ?, ?)",
      [tipo_vehiculo, temporada, porcentaje]
    );

    return NextResponse.json({ mensaje: "Regla de precio creada correctamente." });
  } catch (error: any) {
    console.error("Error al crear regla de precio:", error);
    return NextResponse.json(
      { error: "Error al crear la regla de precio." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [rows]: any = await pool.query("SELECT * FROM reglas_precio ORDER BY id_regla DESC");
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error al obtener reglas de precio:", error);
    return NextResponse.json(
      { error: "Error al obtener las reglas de precio." },
      { status: 500 }
    );
  }
}
