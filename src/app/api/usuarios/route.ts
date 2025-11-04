import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import {
  validarCorreo,
  validarContrasena,
  validarCamposVacios,
} from "@/lib/validations";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

// 🧩 POST /api/usuarios → Registrar usuario
export async function POST(req: Request) {
  try {
    const { nombre, correo, contrasena, tipo } = await req.json();

    validarCamposVacios({ nombre, correo, contrasena });
    validarCorreo(correo);
    validarContrasena(contrasena);

    // Verificar si ya existe el correo
    const [existe] = await pool.query<RowDataPacket[]>(
      "SELECT id_usuario FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (existe.length > 0) {
      return NextResponse.json(
        { error: "El correo ya está registrado" },
        { status: 400 }
      );
    }

    // 🔐 Encriptar la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Guardar usuario con la contraseña encriptada
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO usuarios (nombre, correo, contrasena, tipo) VALUES (?, ?, ?, ?)",
      [nombre, correo, hashedPassword, tipo || "cliente"]
    );

    return NextResponse.json({
      success: true,
      message: "Usuario registrado correctamente",
      id_usuario: result.insertId,
    });
  } catch (error: any) {
    console.error("Error al registrar usuario:", error);
    return NextResponse.json(
      { error: error.message || "Error al registrar usuario" },
      { status: 500 }
    );
  }
}

// 🧩 PUT /api/usuarios → Actualizar usuario
export async function PUT(req: Request) {
  try {
    const { id_usuario, nombre, correo, contrasena, tipo, activo } =
      await req.json();

    validarCamposVacios({ id_usuario });
    if (correo) validarCorreo(correo);
    if (contrasena) validarContrasena(contrasena);

    let hashedPassword = null;
    if (contrasena) {
      hashedPassword = await bcrypt.hash(contrasena, 10);
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE usuarios 
       SET nombre = COALESCE(?, nombre),
           correo = COALESCE(?, correo),
           contrasena = COALESCE(?, contrasena),
           tipo = COALESCE(?, tipo),
           activo = COALESCE(?, activo)
       WHERE id_usuario = ?`,
      [nombre, correo, hashedPassword, tipo, activo, id_usuario]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Usuario actualizado correctamente",
    });
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}
