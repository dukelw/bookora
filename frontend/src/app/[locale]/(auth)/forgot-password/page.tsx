"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import { useRouter } from "next/navigation";
import { Card, Label, TextInput, Button, Spinner } from "flowbite-react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEmailValid = /^\S+@\S+\.\S+$/.test(email);
  const canSubmit = isEmailValid && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await authService.requestResetPassword(email);
      toast.success(t("resetLinkSent"));
      router.push("/signin");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t("serverError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("forgotPassword")}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t("forgotPasswordDesc")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email">{t("email")}</Label>
            <TextInput
              id="email"
              type="email"
              placeholder="you@example.com"
              icon={EnvelopeIcon}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              color={!email ? undefined : isEmailValid ? "success" : "failure"}
              required
            />
          </div>

          {/* Submit */}
          <Button
            color="green"
            type="submit"
            disabled={!canSubmit}
            className="w-full"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" /> {t("sending")}
              </span>
            ) : (
              t("sendResetLink")
            )}
          </Button>
        </form>
      </Card>
    </main>
  );
}
