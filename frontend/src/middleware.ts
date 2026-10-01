import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas exclusivas para invitados. Si el usuario ya está autenticado, va a "/"
const AUTH_ROUTES = ["/login", "/register"];

// Rutas estrictamente protegidas en el servidor
const PROTECTED_ROUTES: string[] = [
  // Ejemplos: "/admin", "/dashboard", "/settings/security"
];

// Nombres de cookies de sesión soportados
const SESSION_COOKIE_NAMES = [
  "session",
  "session_token",
  "access_token",
  "auth_token",
  "token",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ---------------------------------------------------------------------------
  // 1. APLICAR CABECERAS DE SEGURIDAD (Security Headers)
  // ---------------------------------------------------------------------------
  response.headers.set("X-Frame-Options", "DENY"); // Previene Clickjacking
  response.headers.set("X-Content-Type-Options", "nosniff"); // Previene MIME-sniffing
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)"
  );

  // Forzar HTTPS en producción (HSTS)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // ---------------------------------------------------------------------------
  // 2. COMPROBACIÓN DE SESIÓN Y AUTENTICACIÓN
  // ---------------------------------------------------------------------------
  const isAuthenticated = SESSION_COOKIE_NAMES.some(
    (cookieName) => Boolean(request.cookies.get(cookieName)?.value)
  );

  // Redirección si usuario AUTENTICADO intenta acceder a /login o /register
  if (AUTH_ROUTES.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirección si usuario NO AUTENTICADO intenta acceder a rutas protegidas
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);

    // Sanitización contra vulnerabilidades de Open Redirect
    const safeCallback = pathname.startsWith("/") && !pathname.startsWith("//") 
      ? pathname 
      : "/";
      
    loginUrl.searchParams.set("callbackUrl", safeCallback);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Excluir recursos estáticos, imágenes, favicon y llamadas internas del framework:
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};