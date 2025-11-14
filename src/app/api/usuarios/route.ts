// ...existing code...
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import {
  validarCorreo,
  validarContrasena,
  validarCamposVacios,
  validarTipoRegistroPublico,
} from "@/lib/validations";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

// POST /api/usuarios -> registro público (siempre crea tipo = 'cliente')
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, correo, contrasena, tipo } = body;

    const ok = validarCamposVacios({ nombre, correo, contrasena });
    if (!ok) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben completarse." },
        { status: 400 }
      );
    }

    validarCorreo(correo);
    validarContrasena(contrasena);
    validarTipoRegistroPublico(tipo);

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

    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const tipoFinal = "cliente";

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO usuarios (nombre, correo, contrasena, tipo, activo) VALUES (?, ?, ?, ?, 1)",
      [nombre, correo, hashedPassword, tipoFinal]
    );

    return NextResponse.json({
      success: true,
      message: "Usuario registrado correctamente",
      id_usuario: (result as ResultSetHeader).insertId,
      tipo: tipoFinal,
    });
  } catch (error: any) {
    console.error("Error al registrar usuario:", error);
    return NextResponse.json(
      { error: error.message || "Error al registrar usuario" },
      { status: 500 }
    );
  }
}

// PUT /api/usuarios -> actualizar usuario
export async function PUT(req: Request) {
  try {
    const { id_usuario, nombre, correo, contrasena, tipo, activo } =
      await req.json();

    const ok = validarCamposVacios({ id_usuario });
    if (!ok) {
      return NextResponse.json({ error: "id_usuario es obligatorio" }, { status: 400 });
    }

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