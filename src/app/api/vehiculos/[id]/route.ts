import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verificarRol } from "@/lib/auth-check";
import { validarCamposVacios } from "@/lib/validations";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id_vehiculo = parseInt(params.id, 10);
    if (isNaN(id_vehiculo)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { usuario_id } = await req.json();

    // Validar permisos: solo empleado o admin
    const esAutorizado = await verificarRol(usuario_id, ["usuario_interno", "administrador"]);
    if (!esAutorizado) {
      return NextResponse.json(
        { error: "No autorizado. Solo empleados y administradores pueden eliminar vehículos." },
        { status: 403 }
      );
    }

    // Verificar que no esté en alquileres activos
    const [alquileres] = await pool.query<RowDataPacket[]>(
      `SELECT a.id_alquiler FROM alquileres a
       JOIN reservas r ON a.id_reserva = r.id_reserva
       WHERE r.id_vehiculo = ? AND r.estado = 'confirmada'`,
      [id_vehiculo]
    );

    if ((alquileres as any[]).length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar. El vehículo está en alquileres activos." },
        { status: 400 }
      );
    }

    // Eliminar vehículo
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM vehiculos WHERE id_vehiculo = ?",
      [id_vehiculo]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Vehículo eliminado correctamente",
    });
  } catch (error: any) {
    console.error("Error al eliminar vehículo:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar vehículo" },
      { status: 500 }
    );
  }
}