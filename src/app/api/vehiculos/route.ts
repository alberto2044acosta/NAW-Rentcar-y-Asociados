// ...existing code...
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verificarRol } from "@/lib/auth-check";
import { verificarDisponibilidad } from "@/lib/availability";
import { validarAno, validarPrecio, validarPlaca } from "@/lib/vehiculos-validations";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

/**
 * GET /api/vehiculos
 * Query params opcionales:
 *  - fecha_inicio=YYYY-MM-DD
 *  - fecha_fin=YYYY-MM-DD
 *  - tipo
 *  - precio_max
 *
 * Si vienen fecha_inicio y fecha_fin, filtra vehículos que realmente estén libres en ese rango.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fecha_inicio = url.searchParams.get("fecha_inicio");
    const fecha_fin = url.searchParams.get("fecha_fin");
    const tipo = url.searchParams.get("tipo");
    const precioMaxRaw = url.searchParams.get("precio_max");
    const precio_max = precioMaxRaw ? Number(precioMaxRaw) : null;

    // Base query: sólo vehículos marcados como disponibles
    const params: any[] = [];
    let sql =
      "SELECT id_vehiculo, marca, modelo, anio, placa, tipo, precio_por_dia, disponible FROM vehiculos WHERE disponible = 1";

    if (tipo) {
      sql += " AND tipo = ?";
      params.push(tipo);
    }
    if (precio_max !== null && !isNaN(precio_max)) {
      sql += " AND precio_por_dia <= ?";
      params.push(precio_max);
    }

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    const vehiculos: any[] = (rows as any[]) || [];

    // Si no se especifican fechas, devolvemos la lista simple
    if (!fecha_inicio || !fecha_fin) {
      return NextResponse.json({ success: true, vehiculos });
    }

    // Si vienen fechas, verificar disponibilidad individualmente
    const checks = await Promise.all(
      vehiculos.map(async (v) => {
        try {
          const ok = await verificarDisponibilidad(v.id_vehiculo, fecha_inicio, fecha_fin);
          return ok ? v : null;
        } catch (err) {
          console.error("Error verificando disponibilidad para vehiculo", v.id_vehiculo, err);
          return null;
        }
      })
    );

    const disponibles = checks.filter(Boolean);

    return NextResponse.json({ success: true, vehiculos: disponibles });
  } catch (error: any) {
    console.error("Error GET /api/vehiculos:", error);
    return NextResponse.json({ error: error.message || "Error al obtener vehículos" }, { status: 500 });
  }
}

/**
 * POST /api/vehiculos
 * Requiere: usuario_interno o administrador
 * Body: { marca, modelo, anio, placa, tipo, precio_por_dia, usuario_id }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { marca, modelo, anio, placa, tipo, precio_por_dia, usuario_id } = body;

    // Validar que usuario_id está presente
    if (!usuario_id) {
      return NextResponse.json({ error: "usuario_id es requerido" }, { status: 400 });
    }

    // Verificar rol: solo usuario_interno o administrador
    const autorizado = await verificarRol(usuario_id, ["usuario_interno", "administrador"]);
    if (!autorizado) {
      console.warn(`Intento no autorizado de crear vehículo por usuario ${usuario_id}`);
      return NextResponse.json(
        { error: "No autorizado. Solo empleados y administradores pueden crear vehículos." },
        { status: 403 }
      );
    }

    // Validaciones
    if (!marca || !modelo || !anio || !placa || !precio_por_dia) {
      return NextResponse.json(
        { error: "Campos requeridos: marca, modelo, anio, placa, precio_por_dia" },
        { status: 400 }
      );
    }

    if (!validarAno(anio)) {
      return NextResponse.json({ error: "Año debe estar entre 1980 y el año actual" }, { status: 400 });
    }

    if (!validarPrecio(precio_por_dia)) {
      return NextResponse.json({ error: "Precio debe ser mayor a 0" }, { status: 400 });
    }

    if (!validarPlaca(placa)) {
      return NextResponse.json({ error: "Placa no válida" }, { status: 400 });
    }

    // Insertar vehículo
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO vehiculos (marca, modelo, anio, placa, tipo, precio_por_dia) VALUES (?, ?, ?, ?, ?, ?)",
      [marca, modelo, anio, placa, tipo || null, precio_por_dia]
    );

    return NextResponse.json({
      success: true,
      id_vehiculo: (result as ResultSetHeader).insertId,
      message: "Vehículo registrado correctamente",
    });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "La placa ya está registrada" }, { status: 400 });
    }
    console.error("Error POST /api/vehiculos:", error);
    return NextResponse.json({ error: error.message || "Error al crear vehículo" }, { status: 500 });
  }
}

/**
 * PUT /api/vehiculos
 * Requiere: usuario_interno o administrador
 * Body: { id_vehiculo, marca, modelo, anio, placa, tipo, precio_por_dia, usuario_id }
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id_vehiculo, marca, modelo, anio, placa, tipo, precio_por_dia, usuario_id } = body;

    // Validar que usuario_id está presente
    if (!usuario_id) {
      return NextResponse.json({ error: "usuario_id es requerido" }, { status: 400 });
    }

    // Verificar rol
    const autorizado = await verificarRol(usuario_id, ["usuario_interno", "administrador"]);
    if (!autorizado) {
      console.warn(`Intento no autorizado de actualizar vehículo por usuario ${usuario_id}`);
      return NextResponse.json(
        { error: "No autorizado. Solo empleados y administradores pueden actualizar vehículos." },
        { status: 403 }
      );
    }

    if (!id_vehiculo) {
      return NextResponse.json({ error: "id_vehiculo es requerido" }, { status: 400 });
    }

    // Validaciones (si se proporciona)
    if (anio && !validarAno(anio)) {
      return NextResponse.json({ error: "Año debe estar entre 1980 y el año actual" }, { status: 400 });
    }

    if (precio_por_dia && !validarPrecio(precio_por_dia)) {
      return NextResponse.json({ error: "Precio debe ser mayor a 0" }, { status: 400 });
    }

    if (placa && !validarPlaca(placa)) {
      return NextResponse.json({ error: "Placa no válida" }, { status: 400 });
    }

    // Actualizar vehículo
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE vehiculos SET marca = ?, modelo = ?, anio = ?, placa = ?, tipo = ?, precio_por_dia = ? WHERE id_vehiculo = ?",
      [marca, modelo, anio, placa, tipo || null, precio_por_dia, id_vehiculo]
    );

    if ((result as ResultSetHeader).affectedRows === 0) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Vehículo actualizado correctamente" });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "La placa ya está registrada" }, { status: 400 });
    }
    console.error("Error PUT /api/vehiculos:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar vehículo" }, { status: 500 });
  }
}
// ...existing code...