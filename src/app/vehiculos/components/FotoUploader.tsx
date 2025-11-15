"use client";
import React, { useState, useRef, useEffect } from "react";

interface Foto {
  id_foto: number;
  id_vehiculo: number;
  url_foto: string;
  descripcion: string;
}

export default function FotoUploader({ id_vehiculo }: { id_vehiculo: number }) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    cargarFotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_vehiculo]);

  async function cargarFotos() {
    try {
      const res = await fetch(`/api/vehiculos/fotos?vehiculo=${id_vehiculo}`);
      const data = await res.json();
      if (res.ok && data.success) setFotos(data.fotos || []);
    } catch (err) {
      console.error("Error cargando fotos:", err);
    }
  }

  function onSelectFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    subirArchivo(files[0]);
  }

  async function subirArchivo(file: File) {
    setMsg(null);
    setUploading(true);
    try {
      // obtener usuario actual desde localStorage
      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;
      if (!user) {
        setMsg("No hay sesión válida");
        return;
      }

      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        setMsg("Formato no permitido. Use jpg, png o webp.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMsg("El archivo supera 5MB");
        return;
      }

      const fd = new FormData();
      fd.append("archivo", file);
      fd.append("id_vehiculo", String(id_vehiculo));
      fd.append("usuario_id", String(user.id_usuario));

      const res = await fetch("/api/vehiculos/fotos", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMsg("Foto subida correctamente");
        await cargarFotos();
      } else {
        setMsg(data.error || "Error subiendo foto");
      }
    } catch (err: any) {
      console.error(err);
      setMsg(err.message || "Error de red");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id_foto: number) {
    if (!confirm("Eliminar foto?")) return;
    try {
      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;
      if (!user) {
        setMsg("Sesión no válida");
        return;
      }

      const res = await fetch("/api/vehiculos/fotos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_foto, usuario_id: user.id_usuario }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg("Foto eliminada");
        await cargarFotos();
      } else {
        setMsg(data.error || "Error al eliminar foto");
      }
    } catch (err: any) {
      console.error(err);
      setMsg("Error de red");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onSelectFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Fotos del vehículo</h3>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-dashed border-2 border-gray-300 rounded p-6 text-center mb-4 cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <p className="mb-2">{uploading ? "Subiendo..." : "Arrastra una imagen o haz clic para seleccionar"}</p>
        <p className="text-sm text-gray-500">Formatos: jpg, png, webp. Máx 5MB.</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onSelectFiles(e.target.files)}
        />
      </div>

      {msg && <p className="text-sm text-red-600 mb-3">{msg}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {fotos.map((f) => (
          <div key={f.id_foto} className="border rounded overflow-hidden">
            <img src={f.url_foto} alt={f.descripcion || "foto vehiculo"} className="w-full h-40 object-cover" />
            <div className="p-2 flex justify-between items-center">
              <span className="text-sm text-gray-700">ID {f.id_foto}</span>
              <button onClick={() => handleDelete(f.id_foto)} className="text-sm text-red-600">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}