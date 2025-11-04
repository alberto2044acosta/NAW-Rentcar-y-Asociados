// /app/api/auditoria/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { validarCamposVacios } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const { accion, usuario, fecha } = await req.json();

    // Si validarCamposVacios devuelve false, significa que hay campos vacíos
    const camposValidos = validarCamposVacios({ accion, usuario, fecha });
    if (!camposValidos) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    await pool.query(
      "INSERT INTO auditoria (accion, usuario, fecha) VALUES (?, ?, ?)",
      [accion, usuario, fecha]
    );

    return NextResponse.json({
      mensaje: "Registro de auditoría guardado exitosamente.",
    });
  } catch (error: any) {
    console.error("Error al guardar auditoría:", error);
    return NextResponse.json(
      { error: "Error al registrar la acción en auditoría." },
      { status: 500 }
    );
  }
}
