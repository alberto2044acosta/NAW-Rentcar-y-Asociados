export const runtime = "nodejs";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verificarDisponibilidad } from "@/lib/availability";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

/**
 * POST /api/reservas
 * Body: { id_vehiculo, id_usuario, fecha_inicio, fecha_fin, observaciones }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_vehiculo, id_usuario, fecha_inicio, fecha_fin, observaciones } = body;

    // Validaciones básicas
    if (!id_vehiculo || !id_usuario || !fecha_inicio || !fecha_fin) {
      return NextResponse.json(
        { error: "Campos requeridos: id_vehiculo, id_usuario, fecha_inicio, fecha_fin" },
        { status: 400 }
      );
    }

    // Validar que usuario exista y esté activo
    const [usuarioRows] = await pool.query<RowDataPacket[]>(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND activo = 1",
      [id_usuario]
    );
    if ((usuarioRows as any[]).length === 0) {
      return NextResponse.json({ error: "Usuario no existe o está inactivo" }, { status: 400 });
    }

    // Validar que vehículo exista
    const [vehiculoRows] = await pool.query<RowDataPacket[]>(
      "SELECT id_vehiculo FROM vehiculos WHERE id_vehiculo = ?",
      [id_vehiculo]
    );
    if ((vehiculoRows as any[]).length === 0) {
      return NextResponse.json({ error: "Vehículo no existe" }, { status: 400 });
    }

    // Validar fechas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);

    if (inicio < hoy) {
      return NextResponse.json({ error: "Fecha inicio debe ser futura" }, { status: 400 });
    }
    if (fin <= inicio) {
      return NextResponse.json({ error: "Fecha fin debe ser mayor a fecha inicio" }, { status: 400 });
    }

    // Verificar disponibilidad
    const disponible = await verificarDisponibilidad(id_vehiculo, fecha_inicio, fecha_fin);
    if (!disponible) {
      return NextResponse.json({ error: "Vehículo no disponible en esas fechas" }, { status: 409 });
    }

    // Insertar reserva
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO reservas (id_usuario, id_vehiculo, fecha_inicio, fecha_fin, estado, observaciones, fecha_creacion)
       VALUES (?, ?, ?, ?, 'pendiente', ?, NOW())`,
      [id_usuario, id_vehiculo, fecha_inicio, fecha_fin, observaciones || null]
    );

    return NextResponse.json({
      success: true,
      id_reserva: (result as ResultSetHeader).insertId,
      message: "Reserva creada correctamente",
    });
  } catch (error: any) {
    console.error("Error POST /api/reservas:", error);
    return NextResponse.json({ error: error.message || "Error al crear reserva" }, { status: 500 });
  }
}

/**
 * GET /api/reservas
 * Query params opcionales:
 *  - id_usuario (filtrar por usuario)
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id_usuario = url.searchParams.get("id_usuario");

    let sql = `SELECT r.id_reserva, r.id_usuario, r.id_vehiculo, r.fecha_inicio, r.fecha_fin, 
                      r.estado, r.observaciones, r.fecha_creacion,
                      v.marca, v.modelo, v.anio, v.placa, v.tipo, v.precio_por_dia
               FROM reservas r
               JOIN vehiculos v ON r.id_vehiculo = v.id_vehiculo`;
    const params: any[] = [];

    if (id_usuario) {
      sql += " WHERE r.id_usuario = ?";
      params.push(id_usuario);
    }

    sql += " ORDER BY r.fecha_creacion DESC";

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);

    return NextResponse.json({ success: true, reservas: rows || [] });
  } catch (error: any) {
    console.error("Error GET /api/reservas:", error);
    return NextResponse.json({ error: error.message || "Error al obtener reservas" }, { status: 500 });
  }
}