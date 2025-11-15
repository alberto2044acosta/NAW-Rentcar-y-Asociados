import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

/**
 * verificarDisponibilidad:
 * Comprueba si un vehículo está libre entre fechaInicio y fechaFin (inclusive).
 * Fecha formato esperado: 'YYYY-MM-DD'
 */
export async function verificarDisponibilidad(
  idVehiculo: number,
  fechaInicio: string,
  fechaFin: string
): Promise<boolean> {
  try {
    if (!idVehiculo || !fechaInicio || !fechaFin) return false;

    // 1) Buscar reservas que se solapen (estado distinto a 'cancelada')
    const [resRows] = await pool.query<RowDataPacket[]>(
      `SELECT 1 FROM reservas
       WHERE id_vehiculo = ?
         AND estado != 'cancelada'
         AND NOT (fecha_fin < ? OR fecha_inicio > ?)
       LIMIT 1`,
      [idVehiculo, fechaInicio, fechaFin]
    );
    if ((resRows as any[]).length > 0) return false;

    // 2) Buscar alquileres que se solapen (mediante join con reservas para obtener id_vehiculo)
    // Nota: si fecha_devolucion es NULL, consideramos que está en curso y por tanto solapa.
    const [alqRows] = await pool.query<RowDataPacket[]>(
      `SELECT 1 FROM alquileres a
       JOIN reservas r ON a.id_reserva = r.id_reserva
       WHERE r.id_vehiculo = ?
         AND NOT (COALESCE(a.fecha_devolucion, ?) < ? OR a.fecha_entrega > ?)
       LIMIT 1`,
      [idVehiculo, fechaFin, fechaInicio, fechaFin]
    );
    if ((alqRows as any[]).length > 0) return false;

    return true;
  } catch (err: any) {
    console.error("Error verificarDisponibilidad:", err);
    // Si hay error, por seguridad consideramos no disponible
    return false;
  }
}