import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { validarCamposVacios } from "@/lib/validations";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

// ✅ GET — Listar todos los vehículos disponibles
export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, marca, modelo, anio, precio_diario, disponible FROM vehiculos WHERE disponible = 1 ORDER BY id DESC"
    );
    return NextResponse.json({ exito: true, vehiculos: rows });
  } catch (error: any) {
    console.error("Error al obtener vehículos:", error);
    return NextResponse.json({ exito: false, mensaje: "Error al obtener vehículos" }, { status: 500 });
  }
}

// ✅ POST — Registrar vehículo
export async function POST(request: Request) {
  try {
    const datos = await request.json();
    const { marca, modelo, anio, precio_diario, disponible } = datos;

    validarCamposVacios({ marca, modelo, anio, precio_diario });

    const [resultado] = await pool.query<ResultSetHeader>(
      "INSERT INTO vehiculos (marca, modelo, anio, precio_diario, disponible) VALUES (?, ?, ?, ?, ?)",
      [marca, modelo, anio, precio_diario, disponible ?? 1]
    );

    return NextResponse.json({
      exito: true,
      mensaje: "Vehículo registrado correctamente",
      id: resultado.insertId,
    });
  } catch (error: any) {
    console.error("Error al registrar vehículo:", error);
    return NextResponse.json(
      { exito: false, mensaje: error.message || "Error al registrar vehículo" },
      { status: 400 }
    );
  }
}

// ✅ PUT — Actualizar datos del vehículo
export async function PUT(request: Request) {
  try {
    const datos = await request.json();
    const { id, precio_diario, estado, disponible } = datos;

    validarCamposVacios({ id });

    const [resultado] = await pool.query<ResultSetHeader>(
      "UPDATE vehiculos SET precio_diario = ?, estado = ?, disponible = ? WHERE id = ?",
      [precio_diario ?? null, estado ?? null, disponible ?? 1, id]
    );

    if (resultado.affectedRows === 0) {
      return NextResponse.json({ exito: false, mensaje: "Vehículo no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      exito: true,
      mensaje: "Vehículo actualizado correctamente",
    });
  } catch (error: any) {
    console.error("Error al actualizar vehículo:", error);
    return NextResponse.json(
      { exito: false, mensaje: error.message || "Error al actualizar vehículo" },
      { status: 400 }
    );
  }
}

// ✅ POST /api/vehiculos/fotos — Agregar fotos
export async function POST_fotos(request: Request) {
  try {
    const datos = await request.json();
    const { id_vehiculo, url_foto } = datos;

    validarCamposVacios({ id_vehiculo, url_foto });

    const [resultado] = await pool.query<ResultSetHeader>(
      "INSERT INTO fotos_vehiculos (id_vehiculo, url_foto) VALUES (?, ?)",
      [id_vehiculo, url_foto]
    );

    return NextResponse.json({
      exito: true,
      mensaje: "Foto agregada correctamente",
      id: resultado.insertId,
    });
  } catch (error: any) {
    console.error("Error al agregar foto:", error);
    return NextResponse.json(
      { exito: false, mensaje: error.message || "Error al agregar foto" },
      { status: 400 }
    );
  }
}
