import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pinimg.com', // Permite imágenes de Pinterest
      },
      // Si usas otro servidor o dominio de imágenes en el futuro, agrégalo aquí
    ],
  }, // <-- Faltaba cerrar el objeto 'images' aquí
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;