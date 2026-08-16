"use client";

import { useState, type SubmitEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AdminLoginMain() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await login({ email, password });
      router.replace("/admin");
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Unable to sign in. Please check your administrator credentials.",
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary-alpha-16 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-gray-500/20 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-8 text-center">
          <Image
            alt="StealDeal Admin logo"
            className="mx-auto mb-3 size-12"
            height={48}
            src="/dashboard/favicon0a4b.ico"
            unoptimized
            width={48}
          />
          <p className="text-xl font-bold tracking-wide text-primary">
            StealDeal Admin
          </p>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Admin sign in</h1>
          <p className="mt-2 text-sm text-light-secondary-text">
            Sign in to manage buyers, sellers, stores, and categories.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800" htmlFor="admin-login-email">
              Email address
            </label>
            <input
              autoComplete="username"
              className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="admin-login-email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800" htmlFor="admin-login-password">
              Password
            </label>
            <input
              autoComplete="current-password"
              className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="admin-login-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          {error && (
            <div aria-live="polite" className="rounded-lg bg-error-alpha-16 px-3 py-2 text-sm text-error-dark">
              {error}
            </div>
          )}

          <button
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
