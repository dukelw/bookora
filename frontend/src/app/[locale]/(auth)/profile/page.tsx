"use client";

import AppFooter from "@/app/layout/default/Footer";
import AppNavbar from "@/app/layout/default/NavBar";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "use-intl";
import { Card, Spinner } from "flowbite-react";
import ProfileForm from "@/app/components/user/Profile";
import ChangePasswordPage from "@/app/components/user/ChangePassword";
import AddressManager from "@/app/components/user/AddressManager";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/utils/token";

export default function ProfilePageWithTabs() {
  const t = useTranslations("user");
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "addresses">("profile");
  const [tabHeight, setTabHeight] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      toast.error(t("loginRequired"));
      router.replace(`/signin?redirect=/profile`);
      return;
    }
    if (profileRef.current) {
      setTabHeight(profileRef.current.offsetHeight);
    }
    setCheckingAuth(false);
  }, [t, router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div>
      <AppNavbar />
      <main className="min-h-screen flex items-start justify-center px-4 py-8">
        <Card className="w-full max-w-6xl p-4">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`px-4 py-2 -mb-px font-semibold transition-colors ${
                activeTab === "profile"
                  ? "border-b-2 border-green-500 text-green-600 hover:text-green-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              {t("info")}
            </button>
            <button
              className={`px-4 py-2 -mb-px font-semibold transition-colors ${
                activeTab === "password"
                  ? "border-b-2 border-green-500 text-green-600 hover:text-green-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("password")}
            >
              {t("changePassword")}
            </button>
            <button
              className={`px-4 py-2 -mb-px font-semibold transition-colors ${
                activeTab === "addresses"
                  ? "border-b-2 border-green-500 text-green-600 hover:text-green-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("addresses")}
            >
              {t("addresses")}
            </button>
          </div>
          <div className="transition-all" style={{ minHeight: tabHeight }}>
            {activeTab === "profile" && (
              <div ref={profileRef}>
                <ProfileForm />
              </div>
            )}
            {activeTab === "password" && <ChangePasswordPage />}
            {activeTab === "addresses" && <AddressManager />}
          </div>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}