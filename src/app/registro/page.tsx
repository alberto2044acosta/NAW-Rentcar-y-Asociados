// /app/registro/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: "", correo: "", contrasena: "", tipo: "cliente" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        router.push("/");
      } else {
        alert(data.error || "Error al registrar usuario");
      }
    } catch (err) {
      alert("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Registro de Usuario</h2>

        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={form.nombre}
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
          required
        />
        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          value={form.correo}
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
          required
        />
        <input
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          value={form.contrasena}
          onChange={handleChange}
          className="border p-2 w-full mb-2 rounded"
          required
        />

        <select
          name="tipo"
          value={form.tipo}
          onChange={handleChange}
          className="border p-2 w-full mb-4 rounded"
        >
          <option value="cliente">Cliente</option>
          <option value="usuario_interno">Empleado</option>
          <option value="administrador">Administrador</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded w-full"
        >
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
}
