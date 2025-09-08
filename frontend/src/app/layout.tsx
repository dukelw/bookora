import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getUserLocale } from "@/actions/locale";
import { locales } from "@/i18n/config";
import "@/app/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { ThemeInit } from "../../.flowbite-react/init";

export const metadata = {
  title: "Bookora | BookStore",
  description: "A dashboard build with Next.js",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getUserLocale();

  if (!locales.includes(locale as "en" | "vi")) {
    notFound();
  }

  const messages = (await import(`@/translations/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeInit />
          <ToastContainer />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
