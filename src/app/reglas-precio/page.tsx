'use client';

import { useState, useEffect } from 'react';

export default function ReglasPrecioPage() {
  const [reglas, setReglas] = useState<any[]>([]);
  const [form, setForm] = useState({ tipo_vehiculo: '', temporada: '', porcentaje: '' });

  const obtenerReglas = async () => {
    const res = await fetch('/api/reglas-precio');
    const data = await res.json();
    setReglas(data);
  };

  const crearRegla = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tipo_vehiculo || !form.temporada || !form.porcentaje) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    const res = await fetch('/api/reglas-precio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.mensaje || data.error);
    obtenerReglas();
  };

  useEffect(() => {
    obtenerReglas();
  }, []);

  return (
    <main className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Reglas de Precio</h2>

      <form onSubmit={crearRegla} className="bg-white p-4 rounded shadow mb-6">
        <input
          placeholder="Tipo de vehículo"
          value={form.tipo_vehiculo}
          onChange={(e) => setForm({ ...form, tipo_vehiculo: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <input
          placeholder="Temporada"
          value={form.temporada}
          onChange={(e) => setForm({ ...form, temporada: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <input
          type="number"
          placeholder="Porcentaje"
          value={form.porcentaje}
          onChange={(e) => setForm({ ...form, porcentaje: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Crear Regla
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-2">Listado de Reglas</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>ID</th>
            <th>Tipo Vehículo</th>
            <th>Temporada</th>
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          {reglas.map((r) => (
            <tr key={r.id_regla} className="border-t text-center">
              <td>{r.id_regla}</td>
              <td>{r.tipo_vehiculo}</td>
              <td>{r.temporada}</td>
              <td>{r.porcentaje}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
