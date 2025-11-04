'use client';

import { useEffect, useState } from 'react';

interface Vehiculo {
  id: number;
  marca: string;
  modelo: string;
  anio: number;
  precio_diario: number;
  disponible: number;
}

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [nuevo, setNuevo] = useState({
    marca: '',
    modelo: '',
    anio: '',
    precio_diario: '',
  });

  // Obtener vehículos
  const cargarVehiculos = async () => {
    const res = await fetch('/api/vehiculos');
    const data = await res.json();
    setVehiculos(data);
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  // Registrar vehículo
  const registrarVehiculo = async () => {
    if (!nuevo.marca || !nuevo.modelo || !nuevo.anio || !nuevo.precio_diario) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    const res = await fetch('/api/vehiculos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevo),
    });

    const data = await res.json();
    alert(data.mensaje || data.error);
    cargarVehiculos();
  };

  // Actualizar precio o estado
  const actualizarVehiculo = async (id: number, precio: number, disponible: boolean) => {
    const res = await fetch('/api/vehiculos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, precio_diario: precio, disponible }),
    });

    const data = await res.json();
    alert(data.mensaje || data.error);
    cargarVehiculos();
  };

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Gestión de Vehículos</h1>

      <section className="mb-6">
        <h2 className="text-xl mb-3 font-semibold">Registrar nuevo vehículo</h2>
        <div className="grid grid-cols-2 gap-2 max-w-md">
          <input placeholder="Marca" className="p-2 border rounded"
            value={nuevo.marca} onChange={e => setNuevo({ ...nuevo, marca: e.target.value })} />
          <input placeholder="Modelo" className="p-2 border rounded"
            value={nuevo.modelo} onChange={e => setNuevo({ ...nuevo, modelo: e.target.value })} />
          <input placeholder="Año" type="number" className="p-2 border rounded"
            value={nuevo.anio} onChange={e => setNuevo({ ...nuevo, anio: e.target.value })} />
          <input placeholder="Precio Diario" type="number" className="p-2 border rounded"
            value={nuevo.precio_diario} onChange={e => setNuevo({ ...nuevo, precio_diario: e.target.value })} />
        </div>
        <button
          onClick={registrarVehiculo}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Guardar Vehículo
        </button>
      </section>

      <section>
        <h2 className="text-xl mb-3 font-semibold">Vehículos Registrados</h2>
        <table className="table-auto w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Marca</th>
              <th className="p-2">Modelo</th>
              <th className="p-2">Año</th>
              <th className="p-2">Precio Diario</th>
              <th className="p-2">Disponible</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehiculos.map((v) => (
              <tr key={v.id} className="text-center border-t">
                <td>{v.marca}</td>
                <td>{v.modelo}</td>
                <td>{v.anio}</td>
                <td>${v.precio_diario}</td>
                <td>{v.disponible ? 'Sí' : 'No'}</td>
                <td>
                  <button
                    onClick={() => actualizarVehiculo(v.id, v.precio_diario, !v.disponible)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Cambiar Estado
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
