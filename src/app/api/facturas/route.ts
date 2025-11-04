// /app/api/facturas/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id_alquiler = url.pathname.split("/").pop();

    if (!id_alquiler) {
      return NextResponse.json({ error: "Debe especificar el id del alquiler." }, { status: 400 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        a.id_alquiler,
        u.nombre AS cliente,
        v.marca,
        v.modelo,
        a.fecha_inicio,
        a.fecha_fin,
        a.total
      FROM alquileres a
      INNER JOIN usuarios u ON a.id_usuario = u.id_usuario
      INNER JOIN vehiculos v ON a.id_vehiculo = v.id
      WHERE a.id_alquiler = ?`, 
      [id_alquiler]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "No se encontró el alquiler especificado." }, { status: 404 });
    }

    const factura = rows[0];

    return NextResponse.json({
      mensaje: "Factura generada exitosamente.",
      factura: {
        id_alquiler: factura.id_alquiler,
        cliente: factura.cliente,
        vehiculo: `${factura.marca} ${factura.modelo}`,
        fecha_inicio: factura.fecha_inicio,
        fecha_fin: factura.fecha_fin,
        total: factura.total,
      },
    });

  } catch (error: any) {
    console.error("Error al generar factura:", error);
    return NextResponse.json({ error: "Error al generar la factura." }, { status: 500 });
  }
}
