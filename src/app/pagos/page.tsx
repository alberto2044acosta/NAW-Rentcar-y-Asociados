'use client';

import { useState, useEffect } from 'react';

interface Pago {
  id: number;
  id_alquiler: number;
  metodo: string;
  monto: number;
}

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [nuevo, setNuevo] = useState({ id_alquiler: '', metodo: '', monto: '' });

  const cargarPagos = async () => {
    const res = await fetch('/api/pagos');
    const data = await res.json();
    setPagos(data);
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  const registrarPago = async () => {
    if (!nuevo.id_alquiler || !nuevo.metodo || !nuevo.monto) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    const res = await fetch('/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevo),
    });
    const data = await res.json();
    alert(data.mensaje || data.error);
    cargarPagos();
  };

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Registro de Pagos</h1>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Registrar nuevo pago</h2>
        <div className="grid grid-cols-3 gap-2 max-w-lg">
          <input placeholder="ID Alquiler" className="border p-2 rounded"
            value={nuevo.id_alquiler} onChange={e => setNuevo({ ...nuevo, id_alquiler: e.target.value })} />
          <input placeholder="Método" className="border p-2 rounded"
            value={nuevo.metodo} onChange={e => setNuevo({ ...nuevo, metodo: e.target.value })} />
          <input placeholder="Monto" type="number" className="border p-2 rounded"
            value={nuevo.monto} onChange={e => setNuevo({ ...nuevo, monto: e.target.value })} />
        </div>
        <button onClick={registrarPago} className="mt-3 bg-green-600 text-white px-4 py-2 rounded">Registrar</button>
      </section>

      <h2 className="font-semibold mb-3">Pagos registrados</h2>
      <table className="table-auto w-full bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th>ID</th>
            <th>Alquiler</th>
            <th>Método</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          {pagos.map(p => (
            <tr key={p.id} className="text-center border-t">
              <td>{p.id}</td>
              <td>{p.id_alquiler}</td>
              <td>{p.metodo}</td>
              <td>${p.monto}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
