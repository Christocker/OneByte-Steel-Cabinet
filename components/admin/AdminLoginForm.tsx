"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: unknown };

      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : "Unable to sign in.");
        return;
      }

      window.location.assign("/admin");
    } catch {
      setError("Unable to reach the sign-in service. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-beige px-6 py-12 text-navy sm:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src="/images/logo/onebyte-logo.jpg"
            alt="OneByte Steel Cabinets logo"
            width={80}
            height={80}
            priority
            className="mx-auto h-20 w-20 rounded-2xl shadow-xl shadow-navy/20"
          />
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-navy/60">
            OneByte Steel Cabinets
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            Admin sign in
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-navy/65">
            Sign in to keep cabinet availability current for customers.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-3xl border-2 border-beige-deep bg-beige-soft p-6 shadow-2xl shadow-navy/15 sm:p-8"
        >
          <div className="space-y-5">
            <div>
              <label htmlFor="admin-username" className="text-sm font-semibold text-navy">
                Username
              </label>
              <input
                id="admin-username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
                maxLength={100}
                className="mt-2 h-12 w-full rounded-xl border-2 border-beige-deep bg-beige px-4 text-navy outline-none transition-colors placeholder:text-navy/35 focus:border-navy"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="text-sm font-semibold text-navy">
                Password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                maxLength={512}
                className="mt-2 h-12 w-full rounded-xl border-2 border-beige-deep bg-beige px-4 text-navy outline-none transition-colors placeholder:text-navy/35 focus:border-navy"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-5 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-navy px-5 font-semibold text-white transition-all duration-300 hover:bg-navy-light hover:shadow-lg hover:shadow-navy/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-sm font-semibold text-navy/65 transition-colors hover:text-navy"
        >
          Return to public website
        </Link>
      </div>
    </main>
  );
}
