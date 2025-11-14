"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: "", correo: "", contrasena: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "ok"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), // NO enviamos campo tipo
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg({ type: "ok", text: "Registro exitoso. Ahora puedes iniciar sesión." });
        setTimeout(() => router.push("/"), 1000);
      } else {
        setMsg({ type: "error", text: data.error || "Error al registrar usuario" });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Error de conexión con el servidor." });
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
          className="border p-2 w-full mb-4 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded w-full"
        >
          {loading ? "Registrando..." : "Registrar"}
        </button>

        {msg && (
          <p className={msg.type === "error" ? "text-red-600 mt-3" : "text-green-600 mt-3"}>
            {msg.text}
          </p>
        )}
      </form>
    </div>
  );
}