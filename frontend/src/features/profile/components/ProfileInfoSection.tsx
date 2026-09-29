"use client";

import { useRef } from "react";
import Image from "next/image";
import { Upload, Loader2, User } from "lucide-react";

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
    <section className="bg-[#141414] rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-6 text-white font-montserrat">
      <h3 className="font-bold text-[11px] text-[#CCD999] uppercase tracking-wider">
        Perfil
      </h3>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="relative shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={username}
              width={88}
              height={88}
              unoptimized
              className="w-22 h-22 rounded-full object-cover shadow-md border-2 border-white/10"
            />
          ) : (
            <div className="w-22 h-22 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300 font-bold text-2xl">
              {firstName ? firstName.charAt(0) : <User className="w-8 h-8 text-zinc-500" />}
            </div>
          )}
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-xs">
              <Loader2 className="w-6 h-6 animate-spin text-[#CCD999]" />
            </div>
          )}
        </div>

        <div className="space-y-3 flex-1 w-full">
          <div>
            <span className="text-[10px] text-zinc-400 font-medium block uppercase tracking-wider">
              Nombre de Usuario
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              className="text-xl font-black text-white leading-tight bg-transparent border-b border-white/10 hover:border-white/30 focus:border-[#CCD999] focus:outline-none transition-colors w-full py-0.5"
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
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingAvatar ? "Subiendo..." : "Subir Imagen"}</span>
            </button>

            <button
              type="button"
              onClick={onRemoveAvatar}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-white/5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <span>Quitar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300 block">
            Nombre Completo
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            className="w-full bg-[#1c1c1c] border border-white/10 rounded-2xl px-4 py-2.5 text-xs font-semibold text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#CCD999] transition-all shadow-inner"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300 block">
            Apellido Completo
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            className="w-full bg-[#1c1c1c] border border-white/10 rounded-2xl px-4 py-2.5 text-xs font-semibold text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#CCD999] transition-all shadow-inner"
          />
        </div>
      </div>
    </section>
  );
}