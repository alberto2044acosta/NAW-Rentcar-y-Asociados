// ...existing code...
"use client";
import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/auth-guard";
import FotoUploader from "./components/FotoUploader";

interface Vehiculo {
  id_vehiculo: number;
  marca: string;
  modelo: string;
  anio: number;
  placa: string;
  tipo: string | null;
  precio_por_dia: number;
  disponible: boolean;
}

export default function VehiculosPage() {
  const { user } = useRequireAuth(["usuario_interno", "administrador"]);
  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    anio: new Date().getFullYear(),
    placa: "",
    tipo: "",
    precio_por_dia: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "ok"; text: string } | null>(null);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [editando, setEditando] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      cargarVehiculos();
    }
  }, [user]);

  async function cargarVehiculos() {
    try {
      const res = await fetch("/api/vehiculos");
      const data = await res.json();
      if (res.ok && data.success) {
        // Convertir precio_por_dia a número
        const vehiculosConPrecioNumerico = (data.vehiculos || []).map((veh: any) => ({
          ...veh,
          precio_por_dia: parseFloat(veh.precio_por_dia),
        }));
        setVehiculos(vehiculosConPrecioNumerico);
      }
    } catch (err) {
      console.error("Error cargando vehículos:", err);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      const payload = {
        marca: form.marca,
        modelo: form.modelo,
        anio: parseInt(form.anio as any, 10),
        placa: form.placa,
        tipo: form.tipo || null,
        precio_por_dia: parseFloat(form.precio_por_dia as any),
        usuario_id: user.id_usuario,
      };

      const res = await fetch("/api/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMsg({ type: "ok", text: "Vehículo registrado correctamente" });
        setForm({
          marca: "",
          modelo: "",
          anio: new Date().getFullYear(),
          placa: "",
          tipo: "",
          precio_por_dia: "",
        });
        await cargarVehiculos();
      } else {
        setMsg({ type: "error", text: data.error || "Error al registrar vehículo" });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Error de conexión con el servidor" });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id_vehiculo: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este vehículo?")) return;

    try {
      if (!user) {
        setMsg({ type: "error", text: "Sesión no válida" });
        return;
      }

      const res = await fetch(`/api/vehiculos/${id_vehiculo}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: user.id_usuario }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMsg({ type: "ok", text: "Vehículo eliminado correctamente" });
        await cargarVehiculos();
        if (editando === id_vehiculo) setEditando(null);
      } else {
        setMsg({ type: "error", text: data.error || "Error al eliminar vehículo" });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Error de conexión con el servidor" });
    }
  };

  if (!user) return null; // mientras verifica permisos

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gestión de Vehículos</h1>

      {/* Formulario de creación */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold">Nuevo Vehículo</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Marca</label>
              <input
                type="text"
                name="marca"
                placeholder="Toyota, Honda, etc."
                value={form.marca}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Modelo</label>
              <input
                type="text"
                name="modelo"
                placeholder="Corolla, Civic, etc."
                value={form.modelo}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Año</label>
              <input
                type="number"
                name="anio"
                value={form.anio}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Placa</label>
              <input
                type="text"
                name="placa"
                placeholder="ABC-123"
                value={form.placa}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Tipo</label>
              <input
                type="text"
                name="tipo"
                placeholder="Sedan, SUV, Camioneta, etc."
                value={form.tipo}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Precio por día ($)</label>
              <input
                type="number"
                name="precio_por_dia"
                placeholder="0.00"
                step="0.01"
                value={form.precio_por_dia}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded w-full font-semibold"
          >
            {loading ? "Registrando..." : "Registrar Vehículo"}
          </button>

          {msg && (
            <p className={msg.type === "error" ? "text-red-600 mt-3" : "text-green-600 mt-3"}>
              {msg.text}
            </p>
          )}
        </form>
      </div>

      {/* Tabla de vehículos */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Vehículos Registrados</h2>
        {vehiculos.length === 0 ? (
          <p className="text-gray-500">No hay vehículos registrados aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2 text-left">ID</th>
                  <th className="border p-2 text-left">Marca</th>
                  <th className="border p-2 text-left">Modelo</th>
                  <th className="border p-2 text-left">Año</th>
                  <th className="border p-2 text-left">Placa</th>
                  <th className="border p-2 text-left">Tipo</th>
                  <th className="border p-2 text-left">Precio/día</th>
                  <th className="border p-2 text-left">Disponible</th>
                  <th className="border p-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map((veh) => (
                  <tr key={veh.id_vehiculo} className="hover:bg-gray-100">
                    <td className="border p-2">{veh.id_vehiculo}</td>
                    <td className="border p-2">{veh.marca}</td>
                    <td className="border p-2">{veh.modelo}</td>
                    <td className="border p-2">{veh.anio}</td>
                    <td className="border p-2 font-semibold">{veh.placa}</td>
                    <td className="border p-2">{veh.tipo || "—"}</td>
                    <td className="border p-2">${veh.precio_por_dia.toFixed(2)}</td>
                    <td className="border p-2">
                      <span className={veh.disponible ? "text-green-600" : "text-red-600"}>
                        {veh.disponible ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="border p-2 space-x-2">
                      <button
                        onClick={() => setEditando(veh.id_vehiculo)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Fotos
                      </button>
                      <button
                        onClick={() => handleEliminar(veh.id_vehiculo)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sección de fotos: aparece cuando editando tiene id */}
      {editando && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Fotos del vehículo {editando}</h2>
            <button onClick={() => setEditando(null)} className="text-sm text-gray-600">Cerrar</button>
          </div>
          <FotoUploader id_vehiculo={editando} />
        </div>
      )}
    </main>
  );
}