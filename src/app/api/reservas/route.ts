import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { validarFechas, validarCamposVacios } from "@/lib/validations";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

// ✅ Crear reserva
export async function POST(req: Request) {
  try {
    const { id_usuario, id_vehiculo, fecha_inicio, fecha_fin } = await req.json();
    validarCamposVacios({ id_usuario, id_vehiculo, fecha_inicio, fecha_fin });
    validarFechas(fecha_inicio, fecha_fin);

    // Verificar disponibilidad
    const [vehiculos] = await pool.query<RowDataPacket[]>(
      "SELECT disponible FROM vehiculos WHERE id = ?",
      [id_vehiculo]
    );

    if (vehiculos.length === 0)
      return NextResponse.json({ exito: false, mensaje: "Vehículo no encontrado" });

    if (vehiculos[0].disponible === 0)
      return NextResponse.json({ exito: false, mensaje: "Vehículo no disponible" });

    // Insertar reserva
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO reservas (id_usuario, id_vehiculo, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?, 'pendiente')",
      [id_usuario, id_vehiculo, fecha_inicio, fecha_fin]
    );

    return NextResponse.json({
      exito: true,
      mensaje: "Reserva creada correctamente",
      id_reserva: result.insertId,
    });
  } catch (error: any) {
    return NextResponse.json({ exito: false, mensaje: error.message });
  }
}

// ✅ Cancelar reserva
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const accion = url.pathname.split("/").pop(); // detectar subruta (cancelar o confirmar)
    const { id_reserva } = await req.json();

    if (!id_reserva) throw new Error("Debe indicar el ID de la reserva");

    if (accion === "cancelar") {
      await pool.query("UPDATE reservas SET estado = 'cancelada' WHERE id = ?", [id_reserva]);
      return NextResponse.json({ exito: true, mensaje: "Reserva cancelada" });
    }

    if (accion === "confirmar") {
      // Confirmar reserva y crear alquiler
      const [reserva] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM reservas WHERE id = ? AND estado = 'pendiente'",
        [id_reserva]
      );

      if (reserva.length === 0)
        return NextResponse.json({ exito: false, mensaje: "Reserva no encontrada o ya confirmada" });

      await pool.query("UPDATE reservas SET estado = 'confirmada' WHERE id = ?", [id_reserva]);
      await pool.query(
        "INSERT INTO alquileres (id_reserva, id_vehiculo, fecha_entrega, kilometraje_inicial) VALUES (?, ?, NOW(), 0)",
        [id_reserva, reserva[0].id_vehiculo]
      );
      await pool.query("UPDATE vehiculos SET disponible = 0 WHERE id = ?", [reserva[0].id_vehiculo]);

      return NextResponse.json({ exito: true, mensaje: "Reserva confirmada y alquiler creado" });
    }

    return NextResponse.json({ exito: false, mensaje: "Acción no válida" });
  } catch (error: any) {
    return NextResponse.json({ exito: false, mensaje: error.message });
  }
}

// ✅ Listar reservas por usuario
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_usuario = searchParams.get("id_usuario");

    if (!id_usuario) throw new Error("Debe indicar el ID del usuario");

    const [reservas] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM reservas WHERE id_usuario = ? ORDER BY fecha_inicio DESC",
      [id_usuario]
    );

    return NextResponse.json({ exito: true, reservas });
  } catch (error: any) {
    return NextResponse.json({ exito: false, mensaje: error.message });
  }
}
