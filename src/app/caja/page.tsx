'use client';

import { useState, useEffect } from 'react';

export default function CajaPage() {
  const [transacciones, setTransacciones] = useState<any[]>([]);
  const [form, setForm] = useState({ tipo: '', monto: '', descripcion: '', usuario: '' });

  const obtenerTransacciones = async () => {
    const res = await fetch('/api/caja');
    const data = await res.json();
    setTransacciones(data);
  };

  const registrarTransaccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tipo || !form.monto || !form.descripcion || !form.usuario) {
      alert('Completa todos los campos.');
      return;
    }

    const res = await fetch('/api/caja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.mensaje || data.error);
    obtenerTransacciones();
  };

  useEffect(() => {
    obtenerTransacciones();
  }, []);

  return (
    <main className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Transacciones de Caja</h2>

      <form onSubmit={registrarTransaccion} className="bg-white p-4 rounded shadow mb-6">
        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          className="border p-2 mr-2 rounded"
        >
          <option value="">Seleccionar tipo</option>
          <option value="ingreso">Ingreso</option>
          <option value="egreso">Egreso</option>
        </select>
        <input
          type="number"
          placeholder="Monto"
          value={form.monto}
          onChange={(e) => setForm({ ...form, monto: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <input
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <input
          placeholder="Usuario"
          value={form.usuario}
          onChange={(e) => setForm({ ...form, usuario: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Registrar
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-2">Historial de Transacciones</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>ID</th>
            <th>Tipo</th>
            <th>Monto</th>
            <th>Descripción</th>
            <th>Usuario</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {transacciones.map((t) => (
            <tr key={t.id_transaccion} className="border-t text-center">
              <td>{t.id_transaccion}</td>
              <td>{t.tipo}</td>
              <td>{t.monto}</td>
              <td>{t.descripcion}</td>
              <td>{t.usuario}</td>
              <td>{t.fecha}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
