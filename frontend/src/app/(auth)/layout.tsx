import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AsciiTree } from "@/components/design/asciiTree";
import treeImg from "@/assets/tree.png";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-screen w-screen max-h-screen bg-[#0e0e0e] text-white flex items-center justify-center p-6 lg:p-12 overflow-hidden relative">
      {/* Botón Saltar */}
      <div className="absolute top-6 right-8 z-30">
        <Link
          href="/"
          className="text-[14px] text-white font-light font-montserrat hover:text-white transition-colors inline-flex items-center"
        >
          Saltar
          <ChevronRight className="w-4 h-4 ml-1 text-white" />
        </Link>
      </div>

      {/* Grid Principal */}
      <div className="w-full h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center justify-center z-10 relative transform lg:translate-x-14">
        <div className="lg:col-span-5 w-full max-w-md z-20 mx-auto lg:mx-0">
          {children}
        </div>

        <div className="hidden lg:flex lg:col-span-7 h-full items-center justify-center relative z-10 -ml-12 lg:-ml-20 -mt-10 lg:-mt-14 pointer-events-none">
          <AsciiTree
            imageSrc={treeImg.src}
            dotSize={8}
            gap={3}
            className="w-full max-h-screen object-contain object-right transform scale-120 lg:scale-130 origin-right"
          />
        </div>
      </div>
    </main>
  );
}