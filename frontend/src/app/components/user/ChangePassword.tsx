"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import { Label, TextInput, Button, Spinner } from "flowbite-react";
import {
  FaRedoAlt,
  FaSave,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";

export default function ChangePassword() {
  const t = useTranslations("user");

  // States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Show/hide password
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validate conditions
  const conditions = {
    length: newPassword.length >= 6,
    upper: /[A-Z]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    match: newPassword === confirmPassword,
    oldFilled: oldPassword.length > 0,
    confirmFilled: confirmPassword.length > 0,
  };

  const canSubmit = Object.values(conditions).every(Boolean) && !submitting;

  // Handle submit
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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("changePassword")}</h1>
      </div>

      {/* Old Password */}
      <div className="relative">
        <Label htmlFor="oldPassword">{t("oldPassword")}</Label>
        <TextInput
          id="oldPassword"
          type={showOld ? "text" : "password"}
          placeholder="••••••••"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <span
          className="absolute right-3 top-10 cursor-pointer"
          onClick={() => setShowOld(!showOld)}
        >
          {showOld ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      {/* New Password */}
      <div className="relative">
        <Label htmlFor="newPassword">{t("newPassword")}</Label>
        <TextInput
          id="newPassword"
          type={showNew ? "text" : "password"}
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <span
          className="absolute right-3 top-10 cursor-pointer"
          onClick={() => setShowNew(!showNew)}
        >
          {showNew ? <FaEyeSlash /> : <FaEye />}
        </span>

        {/* Live validation checklist */}
        <ul className="text-sm mt-2 space-y-1">
          <li
            className={
              conditions.length
                ? "text-green-600 flex items-center gap-1"
                : "text-red-600 flex items-center gap-1"
            }
          >
            {conditions.length ? <FaCheck /> : <FaTimes />} Ít nhất 6 ký tự
          </li>
          <li
            className={
              conditions.upper
                ? "text-green-600 flex items-center gap-1"
                : "text-red-600 flex items-center gap-1"
            }
          >
            {conditions.upper ? <FaCheck /> : <FaTimes />} Chữ hoa ít nhất 1 ký
            tự
          </li>
          <li
            className={
              conditions.special
                ? "text-green-600 flex items-center gap-1"
                : "text-red-600 flex items-center gap-1"
            }
          >
            {conditions.special ? <FaCheck /> : <FaTimes />} Chứa ký tự đặc biệt
          </li>
        </ul>
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <TextInput
          id="confirmPassword"
          type={showConfirm ? "text" : "password"}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          color={
            confirmPassword
              ? conditions.match
                ? "success"
                : "failure"
              : undefined
          }
        />
        <span
          className="absolute right-3 top-10 cursor-pointer"
          onClick={() => setShowConfirm(!showConfirm)}
        >
          {showConfirm ? <FaEyeSlash /> : <FaEye />}
        </span>

        {/* Match password */}
        {confirmPassword && (
          <p
            className={`text-sm mt-2 ${
              conditions.match ? "text-green-600" : "text-red-600"
            } flex items-center gap-1`}
          >
            {conditions.match ? <FaCheck /> : <FaTimes />}{" "}
            {conditions.match ? "Mật khẩu khớp" : "Mật khẩu không khớp"}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-4">
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
          Reset
        </Button>

        <Button
          color="green"
          type="submit"
          disabled={!canSubmit}
          className="flex-1 flex justify-center items-center gap-2"
        >
          {submitting ? <Spinner size="sm" /> : <FaSave />}
          Save
        </Button>
      </div>
    </form>
  );
}
