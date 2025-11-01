"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleEnter = () => {
    router.push("/components/uno");
  };

  return (
    <div className="container" style={{ width: "320px" }}>
      <h1>NAW Rentcar y Asociados. S.R.L</h1>
      <h2>Inicio de Sesión</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Nombre:</label>
        <input type="text" placeholder="Ingresa tu nombre" />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>Contraseña:</label>
        <div style={{ display: "flex", marginTop: "5px" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Ingresa tu contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ marginLeft: "5px" }}
          >
            {showPassword ? "Ocultar" : "Ver"}
          </button>
        </div>
      </div>

      <button onClick={handleEnter} style={{ width: "100%", marginTop: "10px" }}>
        Entrar
      </button>
    </div>
  );
}
