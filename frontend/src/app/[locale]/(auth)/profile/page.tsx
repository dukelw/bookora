"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "use-intl";
import { Card } from "flowbite-react";
import ProfileForm from "@/app/components/user/Profile";
import ChangePasswordPage from "@/app/components/user/ChangePassword";

export default function ProfilePageWithTabs() {
  const t = useTranslations("user");
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [tabHeight, setTabHeight] = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (profileRef.current) {
      setTabHeight(profileRef.current.offsetHeight);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-8">
      <Card className="w-full max-w-4xl p-4">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`px-4 py-2 -mb-px font-semibold ${
              activeTab === "profile"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            {t("info")}
          </button>
          <button
            className={`px-4 py-2 -mb-px font-semibold ${
              activeTab === "password"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("password")}
          >
            {t("changePassword")}
          </button>
        </div>
        <div className="transition-all" style={{ minHeight: tabHeight }} >
          {activeTab === "profile" && (
            <div ref={profileRef}>
              <ProfileForm />
            </div>
          )}
          {activeTab === "password" && <ChangePasswordPage />}
        </div>
      </Card>
    </main>
  );
}