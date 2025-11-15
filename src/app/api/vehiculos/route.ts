import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { validarCamposVacios } from "@/lib/validations";
import { validarAno, validarPrecio, validarPlaca } from "@/lib/vehiculos-validations";
import { verificarRol } from "@/lib/auth-check";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const { marca, modelo, anio, placa, tipo, precio_por_dia, usuario_id } = await req.json();

    // Validar campos obligatorios
    const ok = validarCamposVacios({ marca, modelo, anio, placa, precio_por_dia, usuario_id });
    if (!ok) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben completarse." },
        { status: 400 }
      );
    }

    // Validar permisos: solo empleado o admin
    const esAutorizado = await verificarRol(usuario_id, ["usuario_interno", "administrador"]);
    if (!esAutorizado) {
      return NextResponse.json(
        { error: "No autorizado. Solo empleados y administradores pueden crear vehículos." },
        { status: 403 }
      );
    }

    // Validar año
    if (!validarAno(anio)) {
      return NextResponse.json(
        { error: "El año debe estar entre 1980 y el año actual." },
        { status: 400 }
      );
    }

    // Validar precio
    if (!validarPrecio(precio_por_dia)) {
      return NextResponse.json(
        { error: "El precio debe ser mayor a 0." },
        { status: 400 }
      );
    }

    // Validar placa
    if (!validarPlaca(placa)) {
      return NextResponse.json(
        { error: "La placa es inválida." },
        { status: 400 }
      );
    }

    // Verificar que la placa sea única
    const [existePlaca] = await pool.query<RowDataPacket[]>(
      "SELECT id_vehiculo FROM vehiculos WHERE placa = ?",
      [placa.trim()]
    );

    if ((existePlaca as any[]).length > 0) {
      return NextResponse.json(
        { error: "La placa ya existe en el sistema." },
        { status: 400 }
      );
    }

    // Insertar vehículo
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO vehiculos (marca, modelo, anio, placa, tipo, precio_por_dia, disponible) VALUES (?, ?, ?, ?, ?, ?, 1)",
      [marca, modelo, anio, placa.trim(), tipo || null, precio_por_dia]
    );

    return NextResponse.json({
      success: true,
      message: "Vehículo registrado correctamente",
      id_vehiculo: (result as ResultSetHeader).insertId,
      marca,
      modelo,
      anio,
      placa,
      tipo,
      precio_por_dia,
      disponible: true,
    });
  } catch (error: any) {
    console.error("Error al registrar vehículo:", error);
    return NextResponse.json(
      { error: error.message || "Error al registrar vehículo" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id_vehiculo, marca, modelo, anio, placa, tipo, precio_por_dia, disponible FROM vehiculos ORDER BY id_vehiculo DESC"
    );

    return NextResponse.json({
      success: true,
      vehiculos: rows,
    });
  } catch (error: any) {
    console.error("Error al obtener vehículos:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener vehículos" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id_vehiculo, marca, modelo, anio, placa, tipo, precio_por_dia, usuario_id, disponible } = await req.json();

    // Validar campos obligatorios
    const ok = validarCamposVacios({ id_vehiculo, usuario_id });
    if (!ok) {
      return NextResponse.json(
        { error: "id_vehiculo y usuario_id son obligatorios." },
        { status: 400 }
      );
    }

    // Validar permisos: solo empleado o admin
    const esAutorizado = await verificarRol(usuario_id, ["usuario_interno", "administrador"]);
    if (!esAutorizado) {
      return NextResponse.json(
        { error: "No autorizado. Solo empleados y administradores pueden editar vehículos." },
        { status: 403 }
      );
    }

    // Validaciones opcionales (si se envían)
    if (anio !== undefined && !validarAno(anio)) {
      return NextResponse.json(
        { error: "El año debe estar entre 1980 y el año actual." },
        { status: 400 }
      );
    }

    if (precio_por_dia !== undefined && !validarPrecio(precio_por_dia)) {
      return NextResponse.json(
        { error: "El precio debe ser mayor a 0." },
        { status: 400 }
      );
    }

    // Si cambias placa, verificar que sea única
    if (placa !== undefined && !validarPlaca(placa)) {
      return NextResponse.json(
        { error: "La placa es inválida." },
        { status: 400 }
      );
    }

    if (placa !== undefined) {
      const [existePlaca] = await pool.query<RowDataPacket[]>(
        "SELECT id_vehiculo FROM vehiculos WHERE placa = ? AND id_vehiculo != ?",
        [placa.trim(), id_vehiculo]
      );

      if ((existePlaca as any[]).length > 0) {
        return NextResponse.json(
          { error: "La placa ya existe en el sistema." },
          { status: 400 }
        );
      }
    }

    // Actualizar vehículo
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE vehiculos 
       SET marca = COALESCE(?, marca),
           modelo = COALESCE(?, modelo),
           anio = COALESCE(?, anio),
           placa = COALESCE(?, placa),
           tipo = COALESCE(?, tipo),
           precio_por_dia = COALESCE(?, precio_por_dia),
           disponible = COALESCE(?, disponible)
       WHERE id_vehiculo = ?`,
      [marca, modelo, anio, placa ? placa.trim() : null, tipo, precio_por_dia, disponible, id_vehiculo]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Vehículo actualizado correctamente",
    });
  } catch (error: any) {
    console.error("Error al actualizar vehículo:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar vehículo" },
      { status: 500 }
    );
  }
}