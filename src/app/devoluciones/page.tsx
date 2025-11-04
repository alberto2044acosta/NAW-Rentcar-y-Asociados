'use client';

import { useState, useEffect } from 'react';

export default function DevolucionesPage() {
  const [devoluciones, setDevoluciones] = useState<any[]>([]);
  const [form, setForm] = useState({ id_alquiler: '', fecha_devolucion: '', observaciones: '', usuario: '' });

  const obtenerDevoluciones = async () => {
    const res = await fetch('/api/devoluciones');
    const data = await res.json();
    setDevoluciones(data);
  };

  const registrarDevolucion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id_alquiler || !form.fecha_devolucion || !form.usuario) {
      alert('Por favor, completa los campos obligatorios.');
      return;
    }

    const res = await fetch('/api/devoluciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.mensaje || data.error);
    obtenerDevoluciones();
  };

  useEffect(() => {
    obtenerDevoluciones();
  }, []);

  return (
    <main className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Registrar Devolución</h2>

      <form onSubmit={registrarDevolucion} className="bg-white p-4 rounded shadow mb-6">
        <input
          placeholder="ID Alquiler"
          value={form.id_alquiler}
          onChange={(e) => setForm({ ...form, id_alquiler: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <input
          type="date"
          value={form.fecha_devolucion}
          onChange={(e) => setForm({ ...form, fecha_devolucion: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <input
          placeholder="Usuario"
          value={form.usuario}
          onChange={(e) => setForm({ ...form, usuario: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <input
          placeholder="Observaciones (opcional)"
          value={form.observaciones}
          onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Registrar
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-2">Historial de Devoluciones</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>ID</th>
            <th>Alquiler</th>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {devoluciones.map((d) => (
            <tr key={d.id_devolucion} className="border-t text-center">
              <td>{d.id_devolucion}</td>
              <td>{d.id_alquiler}</td>
              <td>{d.fecha_devolucion}</td>
              <td>{d.usuario}</td>
              <td>{d.observaciones}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

