// ...existing code...
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { guardarFoto } from "@/lib/file-upload";
import { verificarRol } from "@/lib/auth-check";
import fs from "fs/promises";
import path from "path";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

/**
 * POST /api/vehiculos/fotos
 * FormData: archivo (File), id_vehiculo, usuario_id
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const archivo = form.get("archivo") as any;
    const idVehiculoRaw = form.get("id_vehiculo");
    const usuarioIdRaw = form.get("usuario_id");

    const id_vehiculo = idVehiculoRaw ? Number(idVehiculoRaw.toString()) : null;
    const usuario_id = usuarioIdRaw ? Number(usuarioIdRaw.toString()) : null;

    if (!archivo || !id_vehiculo || !usuario_id) {
      return NextResponse.json({ error: "archivo, id_vehiculo y usuario_id son requeridos" }, { status: 400 });
    }

    // Permisos: solo empleado/admin
    const autorizado = await verificarRol(usuario_id, ["usuario_interno", "administrador"]);
    if (!autorizado) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Validar que el vehículo exista
    const [vehRows] = await pool.query<RowDataPacket[]>("SELECT id_vehiculo FROM vehiculos WHERE id_vehiculo = ?", [id_vehiculo]);
    if ((vehRows as any[]).length === 0) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
    }

    // Validar tipo mime / extensión permitida
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const mimeType = archivo.type || "";
    // algunos entornos pueden no establecer type; validar por nombre también
    const nameLower = (archivo.name || "").toString().toLowerCase();
    const extAllowed = ["jpg", "jpeg", "png", "webp"];
    const ext = nameLower.split(".").pop() || "";

    if (!allowed.includes(mimeType) && !extAllowed.includes(ext)) {
      return NextResponse.json({ error: "Formato no permitido. Use jpg, png o webp." }, { status: 400 });
    }

    // Guardar archivo en disco y registrar en BD
    const url = await guardarFoto(archivo, id_vehiculo);

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO fotos_vehiculos (id_vehiculo, url_foto, descripcion) VALUES (?, ?, ?)",
      [id_vehiculo, url, ""]
    );

    return NextResponse.json({
      success: true,
      id_foto: (result as ResultSetHeader).insertId,
      url,
    });
  } catch (error: any) {
    console.error("Error POST /api/vehiculos/fotos:", error);
    return NextResponse.json({ error: error.message || "Error al subir foto" }, { status: 500 });
  }
}

/**
 * GET /api/vehiculos/fotos?vehiculo=ID
 * Devuelve las fotos para un vehículo
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const veh = url.searchParams.get("vehiculo");
    if (!veh) {
      return NextResponse.json({ error: "Parámetro vehiculo requerido" }, { status: 400 });
    }
    const id_vehiculo = Number(veh);
    if (isNaN(id_vehiculo)) return NextResponse.json({ error: "vehiculo inválido" }, { status: 400 });

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id_foto, id_vehiculo, url_foto, descripcion FROM fotos_vehiculos WHERE id_vehiculo = ? ORDER BY id_foto DESC",
      [id_vehiculo]
    );

    return NextResponse.json({ success: true, fotos: rows });
  } catch (error: any) {
    console.error("Error GET /api/vehiculos/fotos:", error);
    return NextResponse.json({ error: error.message || "Error al obtener fotos" }, { status: 500 });
  }
}

/**
 * DELETE /api/vehiculos/fotos
 * Body JSON: { id_foto, usuario_id }
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id_foto, usuario_id } = body || {};

    if (!id_foto || !usuario_id) {
      return NextResponse.json({ error: "id_foto y usuario_id son requeridos" }, { status: 400 });
    }

    // permisos
    const autorizado = await verificarRol(usuario_id, ["usuario_interno", "administrador"]);
    if (!autorizado) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // obtener registro
    const [rows] = await pool.query<RowDataPacket[]>("SELECT url_foto, id_vehiculo FROM fotos_vehiculos WHERE id_foto = ?", [id_foto]);
    if ((rows as any[]).length === 0) {
      return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
    }

    const foto = (rows as any[])[0];
    const urlFoto: string = foto.url_foto;
    // eliminar archivo del filesystem
    const filePath = path.join(process.cwd(), "public", urlFoto.replace(/^\//, ""));
    try {
      await fs.unlink(filePath);
    } catch (err) {
      // si no existe el archivo, continuamos y eliminamos registro de BD
      console.warn("No se pudo eliminar archivo (podría no existir):", filePath, err);
    }

    // eliminar registro BD
    const [del] = await pool.query<ResultSetHeader>("DELETE FROM fotos_vehiculos WHERE id_foto = ?", [id_foto]);
    if ((del as ResultSetHeader).affectedRows === 0) {
      return NextResponse.json({ error: "No se pudo eliminar registro" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Foto eliminada" });
  } catch (error: any) {
    console.error("Error DELETE /api/vehiculos/fotos:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar foto" }, { status: 500 });
  }
}