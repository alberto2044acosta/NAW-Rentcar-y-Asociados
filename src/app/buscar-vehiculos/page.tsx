"use client";
import React, { useState } from "react";

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

export default function BuscarVehiculosPage() {
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [tipo, setTipo] = useState<string>("");
  const [precioMax, setPrecioMax] = useState<string>("");
  const [resultados, setResultados] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Buscar vehículos</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Fecha inicio</label>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Fecha fin</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Tipo</label>
            <input type="text" value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Sedan, SUV..." className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Precio máximo ($)</label>
            <input type="number" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} className="border p-2 rounded w-full" />
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <button onClick={buscar} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold disabled:bg-gray-400">
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

      <section>
        <h2 className="text-xl font-semibold mb-3">Resultados</h2>
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
                    <div className="text-lg font-bold">${v.precio_por_dia.toFixed(2)}</div>
                    <div className="text-sm text-green-600">Disponible</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold">Ver detalles</button>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold">Reservar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}