// ...existing code...
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

/**
 * verificarRol: consulta la BD por id_usuario y verifica si su tipo está en rolesPermitidos.
 * Uso: en endpoints server-side donde pases un user_id (por ahora simple header/body).
 */
export async function verificarRol(id_usuario: number, rolesPermitidos: string[]) {
  if (!id_usuario) return false;
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT tipo FROM usuarios WHERE id_usuario = ?",
    [id_usuario]
  );
  if ((rows as any[]).length === 0) return false;
  const tipo = (rows as any[])[0].tipo as string;
  return rolesPermitidos.includes(tipo);
}