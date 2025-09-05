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
  UserIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { loginWithGithub, loginWithGoogle } from "@/lib/actions/auth";

export default function SignUp() {
  const t = useTranslations("auth"); // cần key: signup, email, password, address, signUp, alreadyAccount, signIn, required, signingUp, serverError
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [agree, setAgree] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

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
      const data = await authService.signUp(email, password, address);
      console.log(data);

      if (data) {
        router.push("/signin");
      } else {
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t("serverError"));
    } finally {
      setSubmitting(false);
    }
  }

  function handleOAuth(provider: "google" | "github") {
    // TODO: gọi API OAuth tương ứng
    alert(`Sign up with ${provider}`);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("signUp")}</h1>
        </div>

        {errorMsg && (
          <Alert color="failure" className="mt-2">
            {errorMsg}
          </Alert>
        )}

        {/* OAuth buttons */}
        <div className="flex flex-col gap-2 mt-4">
          <Button
            color="gray"
            onClick={() => {
              loginWithGoogle();
            }}
          >
            Sign up with Google
          </Button>
          <Button
            color="dark"
            onClick={() => {
              loginWithGithub();
            }}
          >
            Sign up with GitHub
          </Button>
        </div>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Normal signup form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email" />
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
              placeholder="••••••••"
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
              placeholder="Your address"
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
            <Label htmlFor="agree">I agree to terms</Label>
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
