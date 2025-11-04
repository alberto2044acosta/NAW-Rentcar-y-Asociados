'use client';

import { useState, useEffect } from 'react';

interface Reserva {
  id: number;
  id_usuario: number;
  id_vehiculo: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [nueva, setNueva] = useState({
    id_usuario: '',
    id_vehiculo: '',
    fecha_inicio: '',
    fecha_fin: '',
  });

  const cargarReservas = async () => {
    const res = await fetch('/api/reservas');
    const data = await res.json();
    setReservas(data);
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  const crearReserva = async () => {
    if (!nueva.id_usuario || !nueva.id_vehiculo || !nueva.fecha_inicio || !nueva.fecha_fin) {
      alert('Completa todos los campos.');
      return;
    }

    const res = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nueva),
    });
    const data = await res.json();
    alert(data.mensaje || data.error);
    cargarReservas();
  };

  const cancelarReserva = async (id: number) => {
    const res = await fetch('/api/reservas/cancelar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    alert(data.mensaje || data.error);
    cargarReservas();
  };

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Gestión de Reservas</h1>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Crear nueva reserva</h2>
        <div className="grid grid-cols-2 gap-2 max-w-md">
          <input placeholder="ID Usuario" value={nueva.id_usuario}
            onChange={e => setNueva({ ...nueva, id_usuario: e.target.value })} className="border p-2 rounded" />
          <input placeholder="ID Vehículo" value={nueva.id_vehiculo}
            onChange={e => setNueva({ ...nueva, id_vehiculo: e.target.value })} className="border p-2 rounded" />
          <input type="date" value={nueva.fecha_inicio}
            onChange={e => setNueva({ ...nueva, fecha_inicio: e.target.value })} className="border p-2 rounded" />
          <input type="date" value={nueva.fecha_fin}
            onChange={e => setNueva({ ...nueva, fecha_fin: e.target.value })} className="border p-2 rounded" />
        </div>
        <button onClick={crearReserva} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded">Crear</button>
      </div>

      <h2 className="font-semibold mb-3">Reservas registradas</h2>
      <table className="table-auto w-full bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th>ID</th>
            <th>Vehículo</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map(r => (
            <tr key={r.id} className="text-center border-t">
              <td>{r.id}</td>
              <td>{r.id_vehiculo}</td>
              <td>{r.fecha_inicio}</td>
              <td>{r.fecha_fin}</td>
              <td>{r.estado}</td>
              <td>
                {r.estado !== 'cancelada' && (
                  <button onClick={() => cancelarReserva(r.id)} className="bg-red-600 text-white px-3 py-1 rounded">
                    Cancelar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
