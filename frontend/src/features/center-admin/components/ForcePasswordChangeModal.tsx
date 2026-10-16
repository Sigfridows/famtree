"use client";

import { PasswordModal } from "@/features/profile/components/PasswordModal";

interface ForcePasswordChangeModalProps {
  isOpen: boolean;
  onPasswordChanged: (currentPassword: string, newPassword: string) => Promise<void>;
  onExit: () => Promise<void>;
}

/** Mandatory changes share the profile form, validation and independent eyes. */
export default function ForcePasswordChangeModal({isOpen, onPasswordChanged, onExit}: ForcePasswordChangeModalProps) {
  return <PasswordModal isOpen={isOpen} forced onPasswordChanged={onPasswordChanged} onExit={onExit} onClose={() => {}} onSuccess={() => {}} />;
}
