"use client";
import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/auth-guard";

interface Empleado {
  id_usuario: number;
  nombre: string;
  correo: string;
  tipo: string;
  activo: boolean;
  fecha_registro: string;
}

export default function RegistrarEmpleadoPage() {
  const { user } = useRequireAuth(["administrador"]);
  const [form, setForm] = useState({ nombre: "", correo: "", contrasena: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "ok"; text: string } | null>(null);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  useEffect(() => {
    if (user) {
      cargarEmpleados();
    }
  }, [user]);

  async function cargarEmpleados() {
    try {
      const res = await fetch("/api/usuarios/registrar-empleado");
      const data = await res.json();
      if (res.ok && data.success) {
        setEmpleados(data.empleados);
      }
    } catch (err) {
      console.error("Error cargando empleados:", err);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      if (!user) {
        setMsg({ type: "error", text: "Sesión no válida" });
        return;
      }

      const res = await fetch("/api/usuarios/registrar-empleado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          correo: form.correo,
          contrasena: form.contrasena,
          admin_id: user.id_usuario,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMsg({ type: "ok", text: "Empleado registrado correctamente" });
        setForm({ nombre: "", correo: "", contrasena: "" });
        await cargarEmpleados();
      } else {
        setMsg({ type: "error", text: data.error || "Error al registrar empleado" });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Error de conexión con el servidor" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // mientras verifica permisos

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Registrar Empleado</h1>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold">Nuevo Empleado</h2>

          <div>
            <label className="block font-semibold mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Correo</label>
            <input
              type="email"
              name="correo"
              placeholder="correo@ejemplo.com"
              value={form.correo}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Contraseña</label>
            <input
              type="password"
              name="contrasena"
              placeholder="Mínimo 6 caracteres"
              value={form.contrasena}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded w-full font-semibold"
          >
            {loading ? "Registrando..." : "Registrar Empleado"}
          </button>

          {msg && (
            <p className={msg.type === "error" ? "text-red-600 mt-3" : "text-green-600 mt-3"}>
              {msg.text}
            </p>
          )}
        </form>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Empleados Registrados</h2>
        {empleados.length === 0 ? (
          <p className="text-gray-500">No hay empleados registrados aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2 text-left">ID</th>
                  <th className="border p-2 text-left">Nombre</th>
                  <th className="border p-2 text-left">Correo</th>
                  <th className="border p-2 text-left">Tipo</th>
                  <th className="border p-2 text-left">Activo</th>
                  <th className="border p-2 text-left">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((emp) => (
                  <tr key={emp.id_usuario} className="hover:bg-gray-100">
                    <td className="border p-2">{emp.id_usuario}</td>
                    <td className="border p-2">{emp.nombre}</td>
                    <td className="border p-2">{emp.correo}</td>
                    <td className="border p-2">
                      <span className="bg-blue-200 px-2 py-1 rounded text-sm">
                        {emp.tipo === "usuario_interno" ? "Empleado" : emp.tipo}
                      </span>
                    </td>
                    <td className="border p-2">
                      <span className={emp.activo ? "text-green-600" : "text-red-600"}>
                        {emp.activo ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="border p-2 text-sm">
                      {new Date(emp.fecha_registro).toLocaleDateString("es-ES")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}