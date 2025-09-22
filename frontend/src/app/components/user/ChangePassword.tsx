"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import { useRouter } from "next/navigation";
import { Label, TextInput, Button, Spinner } from "flowbite-react";
import { FaRedoAlt, FaSave } from "react-icons/fa";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";

export default function ChangePassword() {
  const t = useTranslations("user");
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const canSubmit =
    oldPassword.length > 0 &&
    newPassword.length >= 6 &&
    hasUpperCase &&
    hasSpecialChar &&
    newPassword === confirmPassword &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      toast.success(t("passwordChanged"));
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t("serverError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
          <h1 className="text-2xl font-bold">{t("changePassword")}</h1>
        </div>
      <div>
        <Label htmlFor="oldPassword">{t("oldPassword")}</Label>
        <TextInput
          id="oldPassword"
          type="password"
          placeholder="••••••••"
          icon={LockClosedIcon}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="newPassword">{t("newPassword")}</Label>
        <TextInput
          id="newPassword"
          type="password"
          placeholder="••••••••"
          icon={LockClosedIcon}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <p className={`text-red-600 text-sm italic mt-2 ${
            hasUpperCase && hasSpecialChar && newPassword.length >= 6 ? "hidden" : ""
          }`}
        >
          {t("note")}
        </p>

      </div>

      <div>
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <TextInput
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          icon={LockClosedIcon}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          color={
            confirmPassword
              ? newPassword === confirmPassword
                ? "success"
                : "failure"
              : undefined
          }
        />
      </div>
<div className="flex gap-3 mt-4">
  {/* Nút Reset */}
  <Button
    color="red"
    type="button"
    onClick={() => {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }}
    className="flex-1 flex justify-center items-center gap-2"
  >
    <FaRedoAlt />
  </Button>

  {/* Nút Save/Update */}
  <Button
    color="green"
    type="submit"
    disabled={!canSubmit}
    className="flex-1 flex justify-center items-center gap-2"
  >
    {submitting ? <Spinner size="sm" /> : <FaSave />}
  </Button>
</div>

    </form>
  );
}