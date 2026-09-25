import type { Metadata } from 'next';
import { Cinzel, Montserrat, Nunito, Poppins, Roboto_Mono } from "next/font/google";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import './globals.css';

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: 'FamTree',
  description: 'El mejor lugar para descansar',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${cinzel.variable} ${montserrat.variable} ${nunito.variable} ${poppins.variable} ${robotoMono.variable}`}
    >
      <body className="bg-zinc-950 text-white min-h-screen antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}