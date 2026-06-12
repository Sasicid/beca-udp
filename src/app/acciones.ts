"use server";

// Server Actions de los becados. La escritura del Coordinador (matriz, fichas,
// avisos) llega con el modo edición; aquí solo va lo que cualquier usuario
// autenticado puede hacer según las políticas RLS.
import { revalidatePath } from "next/cache";
import { supabaseConfigurado, supabaseServer } from "@/lib/supabase/server";

export async function marcarAvisoLeido(avisoId: string) {
  if (!supabaseConfigurado()) return; // demo: sin persistencia

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return;

  await sb.from("avisos_leidos").upsert({ aviso_id: avisoId, user_id: user.id });
  revalidatePath("/");
  revalidatePath("/mas/avisos");
}

export async function enviarPregunta(formData: FormData) {
  const pregunta = String(formData.get("pregunta") ?? "").trim();
  if (!pregunta) return;
  if (!supabaseConfigurado()) return; // demo: sin persistencia

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return;

  // Queda en la cola privada del Coordinador (estado pendiente, RLS lo exige).
  await sb.from("preguntas").insert({ pregunta, enviada_por: user.id, estado: "pendiente" });
  revalidatePath("/mas/qa");
}
