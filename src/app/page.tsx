"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error en login");
        return;
      }

      if (data.success) {
        // Guardado simple en localStorage; se reemplazará por sesión segura en otro prompt
        localStorage.setItem("user", JSON.stringify({
          id_usuario: data.id_usuario,
          nombre: data.nombre,
          correo: data.correo,
          tipo: data.tipo
        }));
        router.push("/dashboard");
      } else {
        setError(data.error || "Credenciales inválidas");
      }
    } catch (err:any) {
      setError(err.message || "Error de red");
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Iniciar sesión</h1>

        <label className="block mb-2">
          Correo
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="border w-full p-2 rounded mt-1"
            required
          />
        </label>

        <label className="block mb-4">
          Contraseña
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className="border w-full p-2 rounded mt-1"
            required
          />
        </label>

        <button className="bg-blue-600 text-white p-2 rounded w-full" type="submit">
          Entrar
        </button>

        {error && <p className="text-red-600 mt-3">{error}</p>}
      </form>
    </main>
  );
}