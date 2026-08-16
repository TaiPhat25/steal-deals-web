"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function RequireAuth({
  children,
  loginPath = "/login",
}: {
  children: React.ReactNode;
  loginPath?: string;
}) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace(loginPath);
    }
  }, [isAuthenticated, isInitialized, loginPath, router]);

  if (!isInitialized || !isAuthenticated) {
    return null;
  }

  return children;
}
