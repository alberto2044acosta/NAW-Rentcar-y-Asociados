'use client';

import { useEffect, useState } from 'react';

interface Auditoria {
  id: number;
  accion: string;
  usuario: string;
  fecha: string;
}

export default function AuditoriaPage() {
  const [registros, setRegistros] = useState<Auditoria[]>([]);

  const cargarRegistros = async () => {
    const res = await fetch('/api/auditoria');
    const data = await res.json();
    setRegistros(data);
  };

  useEffect(() => {
    cargarRegistros();
  }, []);

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Registros de Auditoría</h1>

      <table className="table-auto w-full bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th>ID</th>
            <th>Acción</th>
            <th>Usuario</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {registros.map(r => (
            <tr key={r.id} className="text-center border-t">
              <td>{r.id}</td>
              <td>{r.accion}</td>
              <td>{r.usuario}</td>
              <td>{r.fecha}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
