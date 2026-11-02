"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ToastTone = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toastIcons: Record<ToastTone, string> = {
  success: "la-check",
  error: "la-times",
  warning: "la-exclamation",
  info: "la-info",
};

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const dismiss = useCallback(() => {
    setIsLeaving((current) => {
      if (current) return current;
      window.setTimeout(onDismiss, 180);
      return true;
    });
  }, [onDismiss]);

  useEffect(() => {
    const timeout = window.setTimeout(dismiss, 4500);
    return () => window.clearTimeout(timeout);
  }, [dismiss]);

  return (
    <div
      className={`site-toast site-toast--${toast.tone}${isLeaving ? " site-toast--leaving" : ""}`}
      role={toast.tone === "error" ? "alert" : "status"}
    >
      <span className="site-toast__icon" aria-hidden="true">
        <i className={`la ${toastIcons[toast.tone]}`} />
      </span>
      <p className="site-toast__message">{toast.message}</p>
      <button
        type="button"
        className="site-toast__dismiss"
        onClick={dismiss}
        aria-label="Dismiss notification"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }].slice(-4));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="site-toast-region" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}
