import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { validarCamposVacios } from "@/lib/validations";
import type { ResultSetHeader } from "mysql2";

export async function POST(request: Request) {
  try {
    const datos = await request.json();
    const { id_vehiculo, url_foto } = datos;

    validarCamposVacios({ id_vehiculo, url_foto });

    const [resultado] = await pool.query<ResultSetHeader>(
      "INSERT INTO fotos_vehiculos (id_vehiculo, url_foto) VALUES (?, ?)",
      [id_vehiculo, url_foto]
    );

    return NextResponse.json({
      exito: true,
      mensaje: "Foto agregada correctamente",
      id: resultado.insertId,
    });
  } catch (error: any) {
    console.error("Error al agregar foto:", error);
    return NextResponse.json(
      { exito: false, mensaje: error.message || "Error al agregar foto" },
      { status: 400 }
    );
  }
}
