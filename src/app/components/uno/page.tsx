"use client";

import { useRouter } from "next/navigation";

export default function UnoMenu() {
  const router = useRouter();

  return (
    <div className="container" style={{ width: "360px", textAlign: "center" }}>
      <h1>NAW Rentcar — Menú</h1>

      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        <button onClick={() => router.push("/components/dos")} style={{ padding: "10px 12px" }}>
          Ver vehículos
        </button>

        <button onClick={() => router.push("/components/tres")} style={{ padding: "10px 12px" }}>
          Agregar vehículo
        </button>
      </div>
    </div>
  );
}
