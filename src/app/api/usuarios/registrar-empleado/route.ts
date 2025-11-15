// EN LA RUTA: src/app/api/usuarios/registrar-empleado/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verificarRol } from "@/lib/auth-check";
import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

/**
 * POST /api/usuarios/registrar-empleado
 * Requiere: administrador
 * Body: { nombre, correo, contrasena, usuario_id }
 */
export async function POST(req: Request) {
  try {
    const { nombre, correo, contrasena, usuario_id } = await req.json();

    // Validar usuario_id
    if (!usuario_id) {
      return NextResponse.json(
        { error: "usuario_id es requerido" },
        { status: 400 }
      );
    }

    // Verificar rol: solo administrador puede registrar empleados
    const esAdmin = await verificarRol(usuario_id, ["administrador"]);
    if (!esAdmin) {
      console.warn(`Intento no autorizado de registrar empleado por usuario ${usuario_id}`);
      return NextResponse.json(
        { error: "No autorizado. Solo administradores pueden registrar empleados." },
        { status: 403 }
      );
    }

    // Validaciones
    if (!nombre || !correo || !contrasena) {
      return NextResponse.json(
        { error: "nombre, correo y contrasena son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que correo no exista
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id_usuario FROM usuarios WHERE correo = ?",
      [correo]
    );
    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { error: "El correo ya está registrado" },
        { status: 400 }
      );
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar empleado con tipo 'usuario_interno'
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO usuarios (nombre, correo, contrasena, tipo) VALUES (?, ?, ?, ?)",
      [nombre, correo, hashedPassword, "usuario_interno"]
    );

    return NextResponse.json({
      success: true,
      id_usuario: (result as ResultSetHeader).insertId,
      message: "Empleado registrado correctamente",
    });
  } catch (error: any) {
    console.error("Error POST /api/usuarios/registrar-empleado:", error);
    return NextResponse.json(
      { error: error.message || "Error al registrar empleado" },
      { status: 500 }
    );
  }
}