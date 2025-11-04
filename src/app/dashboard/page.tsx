'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    const tipoUsuario = localStorage.getItem('tipoUsuario');
    const nombreUsuario = localStorage.getItem('nombreUsuario');

    if (!tipoUsuario || !nombreUsuario) {
      router.push('/'); // redirige al login si no hay sesión
      return;
    }

    setTipo(tipoUsuario);
    setNombre(nombreUsuario);
  }, [router]);

  const irA = (ruta: string) => {
    router.push(ruta);
  };

  const cerrarSesion = () => {
    localStorage.clear();
    router.push('/');
  };

  if (!tipo) {
    return <p className="text-center mt-10">Cargando información del usuario...</p>;
  }

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-4">Bienvenido, {nombre}</h1>
      <h2 className="text-lg mb-6 text-gray-700">Tipo: {tipo}</h2>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {tipo === 'cliente' && (
          <>
            <button onClick={() => irA('/reservas')} className="btn">Reservar</button>
            <button onClick={() => irA('/mis-reservas')} className="btn">Mis Reservas</button>
            <button onClick={() => irA('/pagos')} className="btn">Pagos</button>
            <button onClick={() => irA('/historial')} className="btn">Historial</button>
          </>
        )}

        {tipo === 'empleado' && (
          <>
            <button onClick={() => irA('/vehiculos')} className="btn">Vehículos</button>
            <button onClick={() => irA('/reservas')} className="btn">Reservas</button>
            <button onClick={() => irA('/devoluciones')} className="btn">Devoluciones</button>
            <button onClick={() => irA('/pagos')} className="btn">Pagos</button>
          </>
        )}

        {tipo === 'administrador' && (
          <>
            <button onClick={() => irA('/usuarios')} className="btn">Usuarios</button>
            <button onClick={() => irA('/reglas-precio')} className="btn">Reglas de Precio</button>
            <button onClick={() => irA('/auditoria')} className="btn">Auditoría</button>
            <button onClick={() => irA('/vehiculos')} className="btn">Vehículos</button>
          </>
        )}
      </div>

      <button onClick={cerrarSesion} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
        Cerrar sesión
      </button>

      <style jsx>{`
        .btn {
          background-color: #2563eb;
          color: white;
          padding: 12px;
          border-radius: 10px;
          min-width: 140px;
          text-align: center;
          transition: 0.2s;
        }
        .btn:hover {
          background-color: #1d4ed8;
        }
      `}</style>
    </main>
  );
}
