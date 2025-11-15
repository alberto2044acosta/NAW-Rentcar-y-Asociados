export function validarAno(ano: number): boolean {
  const anoActual = new Date().getFullYear();
  return ano >= 1980 && ano <= anoActual;
}

export function validarPrecio(precio: number): boolean {
  return precio > 0;
}

export function validarPlaca(placa: string): boolean {
  // Placa debe ser no vacía, sin espacios extras
  return !!(placa && placa.trim().length > 0);
}