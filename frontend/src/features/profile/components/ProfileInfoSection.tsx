"use client";

import { useRef } from "react";
import Image from "next/image";
import { Upload, Loader2 } from "lucide-react";

interface ProfileInfoSectionProps {
  avatarUrl: string;
  username: string;
  firstName: string;
  lastName: string;
  isUploadingAvatar?: boolean;
  onFileSelect: (file: File) => void;
  onRemoveAvatar: () => void;
  onUsernameChange: (val: string) => void;
  onFirstNameChange: (val: string) => void;
  onLastNameChange: (val: string) => void;
}

export function ProfileInfoSection({
  avatarUrl,
  username,
  firstName,
  lastName,
  isUploadingAvatar = false,
  onFileSelect,
  onRemoveAvatar,
  onUsernameChange,
  onFirstNameChange,
  onLastNameChange,
}: ProfileInfoSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200/60 space-y-6">
      <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">
        Perfil
      </h3>

      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={username}
              width={80}
              height={80}
              unoptimized
              className="w-20 h-20 rounded-full object-cover shadow-sm border-2 border-zinc-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-xl">
              {firstName.charAt(0)}
            </div>
          )}
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <span className="text-[11px] text-zinc-400 font-medium">Usuario</span>
            <input
              type="text"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              className="text-xl font-extrabold text-zinc-900 leading-tight bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-zinc-900 focus:outline-none transition-colors w-full"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-[5px] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingAvatar ? "Subiendo..." : "Subir Imagen"}</span>
            </button>

            <button
              type="button"
              onClick={onRemoveAvatar}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161616] hover:bg-zinc-800 text-white rounded-[5px] text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Quitar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-800 block">
            Nombre Completo
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-[5px] px-3.5 py-2 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-400 transition-colors shadow-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-800 block">
            Apellido Completo
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-[5px] px-3.5 py-2 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-400 transition-colors shadow-xs"
          />
        </div>
      </div>
    </section>
  );
}