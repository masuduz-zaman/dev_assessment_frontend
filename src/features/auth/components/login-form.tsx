"use client";

import { Eye, EyeOff, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { getErrorMessage, getFieldErrors } from "@/lib/http";
import { roleHome } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { DemoAccounts } from "./demo-accounts";
import { GoogleButton } from "./google-button";

export function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirect = (role: string) =>
    router.push(next && next.startsWith("/") ? next : roleHome(role));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      redirect(user.role);
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle(idToken: string) {
    try {
      const result = await loginWithGoogle({ idToken });
      if (result.requiresApproval || !result.user)
        return toast.info(
          "Your company is awaiting approval by a Super Admin.",
        );
      toast.success("Signed in with Google");
      redirect(result.user.role);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Welcome back
      </h1>
      <p className="mb-8 mt-2 text-slate-500">
        Sign in to continue to your workspace.
      </p>

      <GoogleButton onCredential={onGoogle} text="signin_with" />
      <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> or with email{" "}
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          error={errors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@company.com"
        />
        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={form.password}
            error={errors.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-[38px] text-slate-500 hover:text-slate-800"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        <Button
          type="submit"
          size="lg"
          loading={busy}
          icon={<LogIn className="h-4 w-4" />}
          className="w-full"
        >
          Sign in
        </Button>
      </form>

      <DemoAccounts
        onPick={(email, password) => setForm({ email, password })}
      />

      <p className="mt-8 text-center text-sm text-slate-500">
        New to DevAssess?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand-600 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
