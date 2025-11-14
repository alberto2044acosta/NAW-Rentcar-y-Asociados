import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { validarCamposVacios, validarCorreo } from "@/lib/validations";
import type { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const { correo, contrasena } = await req.json();

    const ok = validarCamposVacios({ correo, contrasena });
    if (!ok) {
      return NextResponse.json({ error: "Correo y contraseña son requeridos" }, { status: 400 });
    }

    validarCorreo(correo);

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id_usuario, nombre, correo, contrasena, tipo, activo FROM usuarios WHERE correo = ?",
      [correo]
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const user = (rows as any[])[0];

    if (!user.activo) {
      return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 });
    }

    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // Respuesta simple con info de sesión (sin implementación de cookies/JWT en este paso)
    return NextResponse.json({
      success: true,
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      correo: user.correo,
      tipo: user.tipo,
    });
  } catch (error: any) {
    console.error("Error en /api/auth/login:", error);
    return NextResponse.json({ error: error.message || "Error en login" }, { status: 500 });
  }
}