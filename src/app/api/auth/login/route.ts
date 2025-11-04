import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { correo, contrasena } = await req.json();

    if (!correo || !contrasena) {
      return NextResponse.json({ success: false, message: "Faltan datos" });
    }

    const [rows] = await pool.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);
    const usuarios = rows as any[];

    if (usuarios.length === 0) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" });
    }

    const usuario = usuarios[0];
    const passwordMatch = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!passwordMatch) {
      return NextResponse.json({ success: false, message: "Contraseña incorrecta" });
    }

    // No implementamos JWT o sesión todavía — eso es parte de roles y persistencia
    return NextResponse.json({
      success: true,
      message: "Inicio de sesión exitoso",
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        tipo: usuario.tipo,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error interno del servidor" });
  }
}
