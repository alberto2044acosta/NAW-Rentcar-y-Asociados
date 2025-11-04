import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import type { ResultSetHeader } from "mysql2";

export async function POST(req: Request) {
  try {
    const { nombre, correo, contrasena, tipo } = await req.json();

    // Validar campos
    if (!nombre || !correo || !contrasena) {
      return NextResponse.json({ success: false, message: "Faltan datos" });
    }

    // Verificar si ya existe el usuario
    const [rows] = await pool.query("SELECT id_usuario FROM usuarios WHERE correo = ?", [correo]);
    if ((rows as any[]).length > 0) {
      return NextResponse.json({ success: false, message: "El correo ya está registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar en BD
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO usuarios (nombre, correo, contrasena, tipo) VALUES (?, ?, ?, ?)",
      [nombre, correo, hashedPassword, tipo || "cliente"]
    );

    return NextResponse.json({
      success: true,
      message: "Usuario registrado exitosamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error interno del servidor" });
  }
}
