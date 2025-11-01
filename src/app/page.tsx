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
    <div>
      <h1>NAW Rentcar y Asociados. S.R.L</h1>
      <h2>Inicio de Sesión</h2>

      <div>
        <label>Nombre:</label>
        <input type="text" placeholder="Ingresa tu nombre" />
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>Contraseña:</label>
        <div style={{ display: "flex" }}>
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

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleEnter}>Entrar</button>
      </div>
    </div>
  );
}
