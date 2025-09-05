"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { setUserLocale } from "@/actions/locale";

export default function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = async (lang: Locale) => {
    await setUserLocale(lang);

    const segments = pathname.split("/");
    segments[1] = lang;
    const newPath = segments.join("/");

    router.replace(newPath);
  };

  return (
    <div className="flex gap-2 items-center">
      {locales.map((lang) => (
        <button
          key={lang}
          onClick={() => handleChange(lang)}
          disabled={lang === currentLocale}
          className={`px-3 py-1 rounded ${
            lang === currentLocale ? "bg-gray-300" : "bg-blue-600 text-white"
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
