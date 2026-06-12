// Refresco de sesión y protección de rutas (Next 16: `proxy` reemplaza a `middleware`).
// Sin Supabase configurado (modo demo) deja pasar todo.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const publica = pathname.startsWith("/login") || pathname.startsWith("/auth");
  if (!user && !publica) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/login";
    return NextResponse.redirect(destino);
  }

  return response;
}

export const config = {
  matcher: [
    // Todo menos estáticos y archivos del manifest/SW.
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|iconos/).*)",
  ],
};
