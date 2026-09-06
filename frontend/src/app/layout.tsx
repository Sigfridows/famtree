import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "FamTree",
  description: "Plataforma para explorar y comparar centros de atención para adultos mayores.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
