import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas exclusivas para invitados. Si hay sesión iniciada, se redirige a "/"
const authRoutes = ["/login", "/register"];

// Rutas estrictamente PRIVADAS bloqueadas a nivel de servidor.
// (Dejamos el arreglo vacío o solo con rutas administrativas para que /profile 
// pueda cargar libremente y mostrar la tarjeta de invitado cuando corresponda).
const protectedRoutes: string[] = [
  // Ej: "/admin", "/dashboard"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Comprobar la existencia de la cookie de sesión
  const sessionToken =
    request.cookies.get("session")?.value ||
    request.cookies.get("session_token")?.value ||
    request.cookies.get("access_token")?.value ||
    request.cookies.get("auth_token")?.value ||
    request.cookies.get("token")?.value;

  const isAuthenticated = Boolean(sessionToken);

  // 1. Si un usuario AUTENTICADO intenta ir a /login o /register, lo enviamos al Inicio "/"
  if (authRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Si un INVITADO intenta entrar a una ruta estrictamente protegida por servidor
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Permitir el paso normal para cualquier otra ruta (incluyendo "/", "/catalog", "/profile", etc.)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};