// ✅ Valida que el correo tenga un formato correcto
export function validarCorreo(correo: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(correo)) {
    throw new Error("El formato del correo es inválido");
  }
  return true;
}

// ✅ Valida que la contraseña tenga al menos 6 caracteres
export function validarContrasena(contrasena: string): boolean {
  if (!contrasena || contrasena.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }
  return true;
}

// ✅ Valida que no haya campos vacíos en un objeto
export function validarCamposVacios(campos: Record<string, any>): boolean {
  for (const [key, value] of Object.entries(campos)) {
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      throw new Error(`El campo '${key}' no puede estar vacío`);
    }
  }
  return true;
}

// ✅ Valida que la fecha de inicio sea anterior a la de fin
export function validarFechas(inicio: string, fin: string): boolean {
  const fechaInicio = new Date(inicio);
  const fechaFin = new Date(fin);

  if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
    throw new Error("Las fechas proporcionadas no son válidas");
  }

  if (fechaInicio >= fechaFin) {
    throw new Error("La fecha de inicio debe ser anterior a la de fin");
  }

  return true;
}
