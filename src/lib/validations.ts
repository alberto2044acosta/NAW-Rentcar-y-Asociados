// Utilidades de validación simples y reutilizables

export function validarCamposVacios(obj: Record<string, any>): boolean {
  // Retorna false si algún campo obligatorio es null/undefined/empty string
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    // permitir 0 numérico; considerar vacío: undefined, null, ''
    if (val === undefined || val === null) return false;
    if (typeof val === "string" && val.trim() === "") return false;
  }
  return true;
}

export function validarCorreo(correo: string) {
  if (!correo || typeof correo !== "string") throw new Error("Correo inválido");
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(correo)) {
    throw new Error("Formato de correo inválido");
  }
}

export function validarContrasena(contrasena: string) {
  if (!contrasena || typeof contrasena !== "string") throw new Error("Contraseña inválida");
  // Reglas mínimas: 6 caracteres. Ajusta según necesites.
  if (contrasena.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }
}

export function validarTipoRegistroPublico(tipo?: string | null) {
  // En registro público no se permite solicitar tipo distinto a 'cliente'
  if (tipo && tipo !== "cliente") {
    throw new Error("No está permitido registrarse como empleado o administrador desde el registro público.");
  }
}