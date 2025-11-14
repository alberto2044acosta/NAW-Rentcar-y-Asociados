// ...existing code...
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useRequireAuth(requiredRoles?: string[]) {
  const router = useRouter();
  const [user, setUser] = useState<null | { id_usuario:number; nombre:string; correo:string; tipo:string }>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) {
        router.replace("/");
        return;
      }
      const u = JSON.parse(raw);
      if (!u || !u.tipo) {
        router.replace("/");
        return;
      }
      if (requiredRoles && !requiredRoles.includes(u.tipo)) {
        // si no tiene el rol requerido, redirigir al dashboard del usuario
        router.replace("/dashboard");
        return;
      }
      setUser(u);
    } catch (e) {
      router.replace("/");
    }
  }, [router, requiredRoles]);

  return { user };
}