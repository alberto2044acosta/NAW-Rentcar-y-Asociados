// EN LA RUTA: src/lib/auth-check.ts
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

/**
 * verificarRol: consulta la BD y verifica si el usuario tiene uno de los roles permitidos
 * @param idUsuario - ID del usuario a verificar
 * @param rolesPermitidos - Array de roles permitidos (ej: ['usuario_interno', 'administrador'])
 * @returns true si el usuario existe y su tipo está en rolesPermitidos, false en caso contrario
 */
export async function verificarRol(idUsuario: number, rolesPermitidos: string[]): Promise<boolean> {
  try {
    if (!idUsuario || isNaN(idUsuario)) {
      console.warn("verificarRol: idUsuario inválido", idUsuario);
      return false;
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT tipo FROM usuarios WHERE id_usuario = ?",
      [idUsuario]
    );

    if ((rows as any[]).length === 0) {
      console.warn("verificarRol: usuario no encontrado", idUsuario);
      return false;
    }

    const usuario = (rows as any[])[0];
    const tieneRol = rolesPermitidos.includes(usuario.tipo);

    if (!tieneRol) {
      console.warn(
        `verificarRol: usuario ${idUsuario} con tipo '${usuario.tipo}' no tiene permisos. Roles requeridos: ${rolesPermitidos.join(", ")}`
      );
    }

    return tieneRol;
  } catch (error: any) {
    console.error("Error en verificarRol:", error.message);
    return false;
  }
}

/**
 * obtenerUsuario: obtiene los datos completos del usuario desde BD
 * @param idUsuario - ID del usuario
 * @returns objeto usuario o null si no existe
 */
export async function obtenerUsuario(idUsuario: number) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id_usuario, nombre, correo, tipo FROM usuarios WHERE id_usuario = ?",
      [idUsuario]
    );

    if ((rows as any[]).length === 0) return null;
    return (rows as any[])[0];
  } catch (error: any) {
    console.error("Error en obtenerUsuario:", error.message);
    return null;
  }
}