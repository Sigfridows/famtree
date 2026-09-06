import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD:front-end/next.config.ts
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pinimg.com', // Permite imágenes de Pinterest
      },
      // Si usas otro servidor o dominio de imágenes en el futuro, agrégalo aquí
    ],
=======
  turbopack: {
    root: process.cwd(),
>>>>>>> 2a6e74a097ed276ed8d57f44f9c8e62f8e5d5566:frontend/next.config.ts
  },
};

export default nextConfig;