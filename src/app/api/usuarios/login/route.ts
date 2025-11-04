import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function POST(request: Request) {
  try {
    const { correo, contrasena } = await request.json();

    if (!correo || !contrasena) {
      return NextResponse.json(
        { error: "Correo y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const usuario = rows[0];

    // Verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!contrasenaValida) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // Verificar si está activo
    if (usuario.activo === 0) {
      return NextResponse.json(
        { error: "Usuario inactivo" },
        { status: 403 }
      );
    }

    // No enviar contraseña al cliente
    delete usuario.contrasena;

    return NextResponse.json({
      success: true,
      message: "Inicio de sesión exitoso",
      usuario,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
