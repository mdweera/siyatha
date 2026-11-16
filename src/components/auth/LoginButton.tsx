"use client";

import { useAuthModal } from "@/components/auth/AuthModalProvider";

type LoginButtonProps = {
  children: React.ReactNode;
  className?: string;
  callbackUrl?: string;
};

export default function LoginButton({ children, className, callbackUrl = "/dashboard" }: LoginButtonProps) {
  const { openLogin } = useAuthModal();
  return (
    <button type="button" className={className} onClick={() => openLogin(callbackUrl)}>
      {children}
    </button>
  );
}
