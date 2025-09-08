"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { setUserLocale } from "@/actions/locale";
import { Dropdown, DropdownItem } from "flowbite-react";
import { FaGlobe } from "react-icons/fa";

const localeLabels: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

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
    <Dropdown
      inline
      arrowIcon={false}
      label={
        <span className="flex items-center gap-2 text-sm font-mediu hover:text-cyan transition-colors">
          <FaGlobe />
          {currentLocale.toUpperCase()}
        </span>
      }
    >
      {locales.map((lang) => (
        <DropdownItem
          key={lang}
          onClick={() => handleChange(lang)}
          className={`${
            lang === currentLocale
              ? "font-bold text-cyan"
              : "hover:text-cyan transition-colors"
          }`}
        >
          {localeLabels[lang as Locale]}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
