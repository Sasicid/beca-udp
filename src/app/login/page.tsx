"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const demo = !process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);
    setCargando(true);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.signInWithPassword({ email, password: clave });
    setCargando(false);
    if (error) {
      setMensaje("Correo o contraseña incorrectos. Revisa los datos e intenta de nuevo.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function enlaceMagico() {
    if (!email) {
      setMensaje("Escribe tu correo para enviarte el enlace de acceso.");
      return;
    }
    setMensaje(null);
    setCargando(true);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setCargando(false);
    setMensaje(
      error
        ? "No se pudo enviar el enlace. Intenta de nuevo en unos minutos."
        : "Enlace enviado: revisa tu correo y ábrelo desde este dispositivo.",
    );
  }

  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-sm flex-col justify-center gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-udp">Beca Medicina de Urgencia</h1>
        <p className="mt-1 text-atenuado">Universidad Diego Portales</p>
      </header>

      {demo ? (
        <div className="rounded-xl border border-borde bg-surface p-5 text-sm leading-relaxed">
          <p className="font-semibold">Modo demostración</p>
          <p className="mt-1 text-atenuado">
            Supabase aún no está configurado, así que la app corre con datos de ejemplo y
            sin login. Para activar cuentas reales, define las variables en{" "}
            <code>.env.local</code> (ver README).
          </p>
          <a
            href="/"
            className="mt-4 flex min-h-11 items-center justify-center rounded-lg bg-udp font-semibold text-white"
          >
            Entrar a la demo
          </a>
        </div>
      ) : (
        <form onSubmit={entrar} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Correo
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11 rounded-lg border border-borde bg-surface px-3 text-base"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="min-h-11 rounded-lg border border-borde bg-surface px-3 text-base"
            />
          </label>
          <button
            type="submit"
            disabled={cargando}
            className="mt-1 min-h-11 rounded-lg bg-udp font-semibold text-white disabled:opacity-60"
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={enlaceMagico}
            disabled={cargando}
            className="min-h-11 rounded-lg border border-borde bg-surface font-medium disabled:opacity-60"
          >
            Enviarme un enlace de acceso al correo
          </button>
          {mensaje && (
            <p role="status" className="rounded-lg bg-udp-suave p-3 text-sm">
              {mensaje}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
