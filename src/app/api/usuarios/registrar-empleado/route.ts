import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { validarCorreo, validarContrasena, validarCamposVacios } from "@/lib/validations";
import { verificarRol } from "@/lib/auth-check";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const { nombre, correo, contrasena, admin_id } = await req.json();

    // Validar campos obligatorios
    const ok = validarCamposVacios({ nombre, correo, contrasena, admin_id });
    if (!ok) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben completarse." },
        { status: 400 }
      );
    }

    // Validar formato correo y contraseña
    validarCorreo(correo);
    validarContrasena(contrasena);

    // Verificar que admin_id pertenece a un administrador
    const esAdmin = await verificarRol(admin_id, ["administrador"]);
    if (!esAdmin) {
      return NextResponse.json(
        { error: "No autorizado. Solo administradores pueden crear empleados." },
        { status: 403 }
      );
    }

    // Verificar que correo no exista ya
    const [existe] = await pool.query<RowDataPacket[]>(
      "SELECT id_usuario FROM usuarios WHERE correo = ?",
      [correo]
    );

    if ((existe as any[]).length > 0) {
      return NextResponse.json(
        { error: "El correo ya está registrado" },
        { status: 400 }
      );
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear usuario con tipo = 'usuario_interno' (empleado)
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO usuarios (nombre, correo, contrasena, tipo, activo) VALUES (?, ?, ?, ?, 1)",
      [nombre, correo, hashedPassword, "usuario_interno"]
    );

    return NextResponse.json({
      success: true,
      message: "Empleado registrado correctamente",
      id_usuario: (result as ResultSetHeader).insertId,
      nombre,
      correo,
      tipo: "usuario_interno",
    });
  } catch (error: any) {
    console.error("Error al registrar empleado:", error);
    return NextResponse.json(
      { error: error.message || "Error al registrar empleado" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id_usuario, nombre, correo, tipo, activo, fecha_registro FROM usuarios WHERE tipo = 'usuario_interno' ORDER BY fecha_registro DESC"
    );

    return NextResponse.json({
      success: true,
      empleados: rows,
    });
  } catch (error: any) {
    console.error("Error al obtener empleados:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener empleados" },
      { status: 500 }
    );
  }
}