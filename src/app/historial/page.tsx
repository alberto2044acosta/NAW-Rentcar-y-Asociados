'use client';

import { useEffect, useState } from 'react';

export default function HistorialPage() {
  const [reservas, setReservas] = useState([]);
  const [pagos, setPagos] = useState([]);

  useEffect(() => {
    const cargarTodo = async () => {
      const r1 = await fetch('/api/reservas');
      const r2 = await fetch('/api/pagos');
      setReservas(await r1.json());
      setPagos(await r2.json());
    };
    cargarTodo();
  }, []);

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Historial General</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Reservas</h2>
        <table className="table-auto w-full bg-white rounded shadow">
          <thead className="bg-gray-200">
            <tr>
              <th>ID</th>
              <th>Vehículo</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r: any) => (
              <tr key={r.id} className="text-center border-t">
                <td>{r.id}</td>
                <td>{r.id_vehiculo}</td>
                <td>{r.fecha_inicio}</td>
                <td>{r.fecha_fin}</td>
                <td>{r.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Pagos</h2>
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
            {pagos.map((p: any) => (
              <tr key={p.id} className="text-center border-t">
                <td>{p.id}</td>
                <td>{p.id_alquiler}</td>
                <td>{p.metodo}</td>
                <td>${p.monto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
