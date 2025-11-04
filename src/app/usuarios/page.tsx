'use client';
import { useEffect, useState } from 'react';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [nuevo, setNuevo] = useState({ nombre: '', correo: '', contrasena: '', tipo: 'cliente' });

  useEffect(() => {
    fetch('/api/usuarios')
      .then((r) => r.json())
      .then(setUsuarios)
      .catch(() => alert('Error al cargar usuarios.'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevo),
    });
    const data = await res.json();
    alert(data.mensaje || data.error);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input placeholder="Nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} className="border p-2 rounded w-full" />
        <input placeholder="Correo" type="email" value={nuevo.correo} onChange={(e) => setNuevo({ ...nuevo, correo: e.target.value })} className="border p-2 rounded w-full" />
        <input placeholder="Contraseña" type="password" value={nuevo.contrasena} onChange={(e) => setNuevo({ ...nuevo, contrasena: e.target.value })} className="border p-2 rounded w-full" />
        <select value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })} className="border p-2 rounded w-full">
          <option value="cliente">Cliente</option>
          <option value="usuario_interno">Empleado</option>
          <option value="administrador">Administrador</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Registrar</button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Usuarios Registrados</h2>
      <ul className="border rounded p-4 bg-gray-50">
        {usuarios.map((u) => (
          <li key={u.id_usuario} className="border-b py-1">{u.nombre} — {u.tipo}</li>
        ))}
      </ul>
    </main>
  );
}
