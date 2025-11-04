'use client';

import { useState } from 'react';

interface Factura {
  id_alquiler: number;
  cliente: string;
  vehiculo: string;
  monto_total: number;
  fecha: string;
}

export default function FacturasPage() {
  const [idAlquiler, setIdAlquiler] = useState('');
  const [factura, setFactura] = useState<Factura | null>(null);

  const buscarFactura = async () => {
    if (!idAlquiler) {
      alert('Introduce un ID de alquiler.');
      return;
    }

    const res = await fetch(`/api/facturas/${idAlquiler}`);
    const data = await res.json();

    if (res.ok) setFactura(data);
    else alert(data.error);
  };

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Consulta de Facturas</h1>

      <div className="flex gap-2 mb-6">
        <input
          placeholder="ID Alquiler"
          className="border p-2 rounded"
          value={idAlquiler}
          onChange={(e) => setIdAlquiler(e.target.value)}
        />
        <button onClick={buscarFactura} className="bg-blue-600 text-white px-4 py-2 rounded">
          Buscar
        </button>
      </div>

      {factura && (
        <div className="bg-white shadow p-4 rounded w-96">
          <h2 className="font-semibold mb-2">Factura #{factura.id_alquiler}</h2>
          <p><strong>Cliente:</strong> {factura.cliente}</p>
          <p><strong>Vehículo:</strong> {factura.vehiculo}</p>
          <p><strong>Monto Total:</strong> ${factura.monto_total}</p>
          <p><strong>Fecha:</strong> {factura.fecha}</p>
        </div>
      )}
    </main>
  );
}
