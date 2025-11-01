"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Tres() {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState<number | "">("");
  const [placa, setPlaca] = useState("");
  const [precioDiario, setPrecioDiario] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!marca || !modelo || !anio || !placa || !precioDiario) {
      setError("Completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marca,
          modelo,
          anio,
          placa,
          precio_diario: Number(precioDiario),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err?.error || "Error al crear");
        setLoading(false);
        return;
      }

      // creado con éxito: volver a la lista
      router.push("/components/dos");
    } catch (err) {
      console.error(err);
      setError("Error de red");
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ width: "420px" }}>
      <h1>Agregar vehículo</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Marca" />
        <input value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Modelo" />
        <input
          value={anio}
          onChange={(e) => setAnio(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="Año (ej. 2021)"
          type="number"
        />
        <input value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="Placa" />
        <input
          value={precioDiario}
          onChange={(e) => setPrecioDiario(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="Precio diario"
          type="number"
          step="0.01"
        />

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={loading} style={{ flex: 1 }}>
            {loading ? "Guardando..." : "Guardar vehículo"}
          </button>
          <button type="button" onClick={() => router.push("/components/dos")} style={{ flex: 1 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
