"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/auth-guard";

export default function DashboardPage() {
  const { user } = useRequireAuth(); // exige login
  const router = useRouter();

  if (!user) return null;

  const go = (path: string) => router.push(path);
  const logout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600">Bienvenido, {user.nombre} ({user.tipo})</p>
        </div>
        <div className="space-x-2">
          <button onClick={() => go("/perfil")} className="px-3 py-1 bg-gray-200 rounded">Mi perfil</button>
          <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded">Cerrar sesión</button>
        </div>
      </div>

      {user.tipo === "cliente" && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Cliente</h2>
          <div className="grid gap-3 sm:grid-cols-2 max-w-xl">
            <button onClick={() => go("/buscar-vehiculos")} className="p-3 bg-blue-600 text-white rounded">Buscar vehículos</button>
            <button onClick={() => go("/reservas")} className="p-3 bg-green-600 text-white rounded">Reservar vehículo</button>
            <button onClick={() => go("/reservas/mis-reservas")} className="p-3 bg-indigo-600 text-white rounded">Mis reservas</button>
            <button onClick={() => go("/perfil/editar")} className="p-3 bg-gray-200 rounded">Editar perfil</button>
          </div>
        </section>
      )}

      {user.tipo === "usuario_interno" && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Empleado</h2>
          <div className="grid gap-3 sm:grid-cols-2 max-w-xl">
            <button onClick={() => go("/vehiculos")} className="p-3 bg-yellow-600 text-white rounded">Gestionar vehículos</button>
            <button onClick={() => go("/reservas")} className="p-3 bg-blue-600 text-white rounded">Ver reservas</button>
            <button onClick={() => go("/alquileres")} className="p-3 bg-green-600 text-white rounded">Registrar devoluciones</button>
            <button onClick={() => go("/pagos")} className="p-3 bg-indigo-600 text-white rounded">Registrar pagos / Caja</button>
          </div>
        </section>
      )}

      {user.tipo === "administrador" && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Administrador</h2>
          <div className="grid gap-3 sm:grid-cols-2 max-w-xl">
            <button onClick={() => go("/admin/registrar-empleado")} className="p-3 bg-red-600 text-white rounded">Registrar empleado</button>
            <button onClick={() => go("/vehiculos")} className="p-3 bg-yellow-600 text-white rounded">Gestionar vehículos</button>
            <button onClick={() => go("/buscar-vehiculos")} className="p-3 bg-blue-600 text-white rounded">Buscar vehículos</button>
            <button onClick={() => go("/reservas")} className="p-3 bg-green-600 text-white rounded">Reservas</button>
            <button onClick={() => go("/admin/reglas-precio")} className="p-3 bg-indigo-600 text-white rounded">Definir reglas de precio</button>
            <button onClick={() => go("/admin/auditoria")} className="p-3 bg-gray-200 rounded">Ver auditoría y caja</button>
          </div>
        </section>
      )}
    </main>
  );
}