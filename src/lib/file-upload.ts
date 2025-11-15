import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "vehiculos");

export async function asegurarDirectorio() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export function obtenerExtension(nombre: string, tipoMime?: string) {
  const extFromName = nombre?.split(".").pop();
  if (extFromName) return extFromName.toLowerCase();
  if (tipoMime) {
    if (tipoMime.includes("jpeg") || tipoMime.includes("jpg")) return "jpg";
    if (tipoMime.includes("png")) return "png";
    if (tipoMime.includes("webp")) return "webp";
  }
  return "jpg";
}

export async function guardarFoto(file: any, idVehiculo: number) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("Archivo inválido");
  }

  const maxBytes = 5 * 1024 * 1024; // 5MB
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > maxBytes) {
    throw new Error("El archivo excede el tamaño máximo de 5MB");
  }

  const filename = (file.name || `veh_${Date.now()}`).toString();
  const ext = obtenerExtension(filename, file.type);
  const timestamp = Date.now();
  const safeName = `${idVehiculo}_${timestamp}.${ext}`;
  await asegurarDirectorio();
  const fullPath = path.join(UPLOAD_DIR, safeName);

  await fs.writeFile(fullPath, buffer);
  return `/uploads/vehiculos/${safeName}`;
}