"use client";
import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/auth-guard";

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

interface Reserva {
  id_reserva: number;
  id_vehiculo: number;
  marca: string;
  modelo: string;
  anio: number;
  placa: string;
  tipo: string | null;
  precio_por_dia: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  observaciones: string | null;
  fecha_creacion: string;
}

export default function ReservasPage() {
  const { user } = useRequireAuth(["cliente", "usuario_interno", "administrador"]);

  // Búsqueda
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [tipo, setTipo] = useState<string>("");
  const [precioMax, setPrecioMax] = useState<string>("");
  const [resultados, setResultados] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Modal de reserva
  const [mostrarModal, setMostrarModal] = useState(false);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null);
  const [fechaInicioReserva, setFechaInicioReserva] = useState<string>("");
  const [fechaFinReserva, setFechaFinReserva] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");
  const [loadingReserva, setLoadingReserva] = useState(false);

  // Mis reservas
  const [misReservas, setMisReservas] = useState<Reserva[]>([]);

  useEffect(() => {
    if (user) {
      cargarMisReservas();
    }
  }, [user]);

  async function buscar() {
    setMsg(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.set("fecha_inicio", fechaInicio);
      if (fechaFin) params.set("fecha_fin", fechaFin);
      if (tipo) params.set("tipo", tipo);
      if (precioMax) params.set("precio_max", precioMax);

      const url = `/api/vehiculos${params.toString() ? "?" + params.toString() : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        const vehs = (data.vehiculos || []).map((v: any) => ({
          ...v,
          precio_por_dia: parseFloat(v.precio_por_dia),
        }));
        setResultados(vehs);
        if (vehs.length === 0) setMsg("No hay vehículos disponibles para los filtros seleccionados.");
      } else {
        setMsg(data.error || "Error al buscar vehículos");
      }
    } catch (err: any) {
      console.error("Error buscar vehículos:", err);
      setMsg("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function cargarMisReservas() {
    try {
      if (!user) return;
      const res = await fetch(`/api/reservas?id_usuario=${user.id_usuario}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setMisReservas(data.reservas || []);
      }
    } catch (err) {
      console.error("Error cargando mis reservas:", err);
    }
  }

  async function abrirModalReserva(vehiculo: Vehiculo) {
    setVehiculoSeleccionado(vehiculo);
    setFechaInicioReserva(fechaInicio);
    setFechaFinReserva(fechaFin);
    setObservaciones("");
    setMostrarModal(true);
  }

  async function confirmarReserva() {
    if (!user || !vehiculoSeleccionado) return;
    if (!fechaInicioReserva || !fechaFinReserva) {
      alert("Selecciona fechas de inicio y fin");
      return;
    }

    setLoadingReserva(true);
    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_vehiculo: vehiculoSeleccionado.id_vehiculo,
          id_usuario: user.id_usuario,
          fecha_inicio: fechaInicioReserva,
          fecha_fin: fechaFinReserva,
          observaciones: observaciones || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("¡Reserva creada correctamente!");
        setMostrarModal(false);
        setVehiculoSeleccionado(null);
        await cargarMisReservas();
      } else {
        alert(data.error || "Error al crear reserva");
      }
    } catch (err: any) {
      console.error("Error confirmando reserva:", err);
      alert("Error de conexión");
    } finally {
      setLoadingReserva(false);
    }
  }

  if (!user) return null;

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Reservar vehículo</h1>

      {/* Buscador */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Buscar disponibilidad</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Fecha inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Fecha fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Tipo</label>
            <input
              type="text"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Sedan, SUV..."
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Precio máximo ($)</label>
            <input
              type="number"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <button
            onClick={buscar}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold disabled:bg-gray-400"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
          <button
            onClick={() => {
              setFechaInicio("");
              setFechaFin("");
              setTipo("");
              setPrecioMax("");
              setResultados([]);
              setMsg(null);
            }}
            className="bg-gray-200 px-4 py-2 rounded font-semibold"
          >
            Limpiar
          </button>
        </div>
        {msg && <p className="text-sm text-red-600 mt-3">{msg}</p>}
      </div>

      {/* Resultados */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Vehículos disponibles</h2>
        {resultados.length === 0 ? (
          <p className="text-gray-500">Sin resultados</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resultados.map((v) => (
              <div key={v.id_vehiculo} className="border rounded p-3 bg-white shadow">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-semibold">{v.marca} {v.modelo} ({v.anio})</h3>
                    <p className="text-sm text-gray-600">Placa: {v.placa} {v.tipo ? `· ${v.tipo}` : ""}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">${v.precio_por_dia.toFixed(2)}/día</div>
                    <div className="text-sm text-green-600">Disponible</div>
                  </div>
                </div>
                <button
                  onClick={() => abrirModalReserva(v)}
                  className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm font-semibold"
                >
                  Reservar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal de reserva */}
      {mostrarModal && vehiculoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirmar reserva</h2>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-semibold">Vehículo</label>
                <p className="text-sm">{vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo} ({vehiculoSeleccionado.anio})</p>
              </div>
              <div>
                <label className="block text-sm font-semibold">Placa</label>
                <p className="text-sm">{vehiculoSeleccionado.placa}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold">Precio/día</label>
                <p className="text-sm">${vehiculoSeleccionado.precio_por_dia.toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold">Fecha inicio</label>
                <input
                  type="date"
                  value={fechaInicioReserva}
                  onChange={(e) => setFechaInicioReserva(e.target.value)}
                  className="border p-2 rounded w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Fecha fin</label>
                <input
                  type="date"
                  value={fechaFinReserva}
                  onChange={(e) => setFechaFinReserva(e.target.value)}
                  className="border p-2 rounded w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">Observaciones (opcional)</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Notas especiales..."
                  className="border p-2 rounded w-full text-sm"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">Cliente</label>
                <p className="text-sm">{user.nombre} ({user.correo})</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setMostrarModal(false)}
                className="flex-1 bg-gray-200 px-4 py-2 rounded font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarReserva}
                disabled={loadingReserva}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded font-semibold disabled:bg-gray-400"
              >
                {loadingReserva ? "Confirmando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mis reservas */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Mis reservas</h2>
        {misReservas.length === 0 ? (
          <p className="text-gray-500">No tienes reservas aún</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2 text-left text-sm">ID</th>
                  <th className="border p-2 text-left text-sm">Vehículo</th>
                  <th className="border p-2 text-left text-sm">Fecha inicio</th>
                  <th className="border p-2 text-left text-sm">Fecha fin</th>
                  <th className="border p-2 text-left text-sm">Estado</th>
                  <th className="border p-2 text-left text-sm">Creada</th>
                </tr>
              </thead>
              <tbody>
                {misReservas.map((r) => (
                  <tr key={r.id_reserva} className="hover:bg-gray-100">
                    <td className="border p-2 text-sm">{r.id_reserva}</td>
                    <td className="border p-2 text-sm">{r.marca} {r.modelo} ({r.placa})</td>
                    <td className="border p-2 text-sm">{r.fecha_inicio}</td>
                    <td className="border p-2 text-sm">{r.fecha_fin}</td>
                    <td className="border p-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          r.estado === "pendiente"
                            ? "bg-yellow-200 text-yellow-800"
                            : r.estado === "confirmada"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {r.estado}
                      </span>
                    </td>
                    <td className="border p-2 text-sm">{new Date(r.fecha_creacion).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}