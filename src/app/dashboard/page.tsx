// ...existing code...
"use client";
import React from "react";
import { useRequireAuth } from "@/lib/auth-guard";

export default function DashboardPage() {
  const { user } = useRequireAuth(); // sin roles exige login

  if (!user) return null; // mientras verifica

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Bienvenido, {user.nombre} ({user.tipo})</p>

      {user.tipo === "cliente" && (
        <section>
          <h2 className="text-lg font-semibold">Cliente</h2>
          <ul className="list-disc ml-6">
            <li>Buscar vehículos y crear reservas</li>
            <li>Ver historial y pagos</li>
            <li>Editar perfil</li>
          </ul>
        </section>
      )}

      {user.tipo === "usuario_interno" && (
        <section>
          <h2 className="text-lg font-semibold">Empleado</h2>
          <ul className="list-disc ml-6">
            <li>Gestionar vehículos</li>
            <li>Confirmar reservas / registrar devoluciones</li>
            <li>Registrar pagos y caja</li>
          </ul>
        </section>
      )}

      {user.tipo === "administrador" && (
        <section>
          <h2 className="text-lg font-semibold">Administrador</h2>
          <ul className="list-disc ml-6">
            <li>Gestionar usuarios y empleados</li>
            <li>Definir reglas de precio</li>
            <li>Ver auditoría y caja</li>
          </ul>
        </section>
      )}
    </main>
  );
}