"use client";

import { useEffect, useState } from "react";

interface Vehiculo {
  id: number;
  marca: string;
  modelo: string;
  anio: number;
  precio_diario: number;
}

export default function Dashboard() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

  useEffect(() => {
    async function fetchVehiculos() {
      const res = await fetch("/api/vehiculos");
      const data: Vehiculo[] = await res.json();
      setVehiculos(data);
    }
    fetchVehiculos();
  }, []);

  return (
    <div>
      <h1>Vehículos disponibles</h1>
      <ul>
        {vehiculos.map((v) => (
          <li key={v.id}>
            {v.marca} {v.modelo} - {v.anio} (${v.precio_diario}/día)
          </li>
        ))}
      </ul>
    </div>
  );
}
