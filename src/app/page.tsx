'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!correo || !contrasena) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al iniciar sesión.');
        return;
      }

      // Guarda los datos del usuario por separado
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      localStorage.setItem('nombreUsuario', data.usuario.nombre);
      localStorage.setItem('tipoUsuario', data.usuario.tipo);

      alert(`Bienvenido, ${data.usuario.nombre}`);
      router.push('/dashboard');
    } catch (error) {
      alert('Error de conexión con el servidor.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-80"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">Iniciar Sesión</h2>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="border w-full p-2 rounded mb-3"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          className="border w-full p-2 rounded mb-4"
        />

        <button
          type="submit"
          disabled={loading}
          className={`${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white w-full p-2 rounded`}
        >
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>

        <p className="text-center mt-4">
          ¿No tienes cuenta?{' '}
          <a href="/registro" className="text-blue-600 hover:underline">
            Regístrate aquí
          </a>
        </p>
      </form>
    </main>
  );
}
