"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import Link from "next/link";
import {
  Card,
  Label,
  TextInput,
  Button,
  Checkbox,
  Alert,
  Spinner,
} from "flowbite-react";
import {
  EnvelopeIcon,
  LockClosedIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { loginWithGithub, loginWithGoogle } from "@/lib/actions/auth";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { FiHome } from "react-icons/fi";
import { UserIcon } from "lucide-react";

export default function SignUp() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [agree, setAgree] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const isFullnameValid = fullname.trim().length > 0;
  const isEmailValid = /^\S+@\S+\.\S+$/.test(email);
  const isPasswordValid = password.length >= 6;
  const isAddressValid = address.length > 0;
  const canSubmit =
    isEmailValid && isPasswordValid && isAddressValid && agree && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const data = await authService.signUp(fullname, email, password, address);
      if (data) router.push("/signin");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t("serverError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        {/* Back Home */}
        <div className="mb-4">
          <Link href="/" className="flex items-center gap-1">
            <FiHome size={14} /> {t("home")}
          </Link>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("signUp")}</h1>
        </div>

        {/* Error */}
        {errorMsg && <Alert color="failure">{errorMsg}</Alert>}

        {/* Social buttons */}
        <div className="flex flex-col gap-3 mt-4">
          <Button
            color="white"
            outline
            onClick={() => loginWithGoogle()}
            className="flex shadow items-center justify-center gap-2 border-gray-300 hover:bg-gray-100"
          >
            <FcGoogle size={20} /> {t("signInWithGoogle")}
          </Button>
          <Button
            color="dark"
            onClick={() => loginWithGithub()}
            className="flex items-center justify-center gap-2"
          >
            <FaGithub size={20} /> {t("signInWithGithub")}
          </Button>
        </div>

        {/* OR divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500">{t("or")}</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Normal signup form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fullname */}
          <div>
            <Label htmlFor="fullname" />
            <TextInput
              id="fullname"
              type="text"
              placeholder={t("fullnamePlaceholder")}
              icon={UserIcon}
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              color={
                !fullname ? undefined : isFullnameValid ? "success" : "failure"
              }
              required
            />
            {!isFullnameValid && fullname && (
              <p className="text-xs text-red-600 mt-1">{t("required")}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" />
            <TextInput
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              icon={EnvelopeIcon}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              color={!email ? undefined : isEmailValid ? "success" : "failure"}
              required
            />
            {!isEmailValid && email && (
              <p className="text-xs text-red-600 mt-1">{t("required")}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" />
            <TextInput
              id="password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              icon={LockClosedIcon}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              color={
                !password ? undefined : isPasswordValid ? "success" : "failure"
              }
              required
            />
            {!isPasswordValid && password && (
              <p className="text-xs text-red-600 mt-1">{t("required")}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address" />
            <TextInput
              id="address"
              type="text"
              placeholder={t("addressPlaceholder")}
              icon={MapPinIcon}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              color={
                !address ? undefined : isAddressValid ? "success" : "failure"
              }
              required
            />
            {!isAddressValid && address && (
              <p className="text-xs text-red-600 mt-1">{t("required")}</p>
            )}
          </div>

          {/* Agree */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="agree"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <Label htmlFor="agree">{t("agreeTerms")}</Label>
          </div>

          {/* Submit */}
          <Button
            color="green"
            type="submit"
            className="w-full"
            disabled={!canSubmit}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" /> {t("signingUp")}
              </span>
            ) : (
              t("signUp")
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-4">
          {t("alreadyAccount")}{" "}
          <Link href="/signin" className="text-blue-600 hover:underline">
            {t("signIn")}
          </Link>
        </p>
      </Card>
    </main>
  );
}
