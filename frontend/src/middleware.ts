import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { locales, defaultLocale } from "@/i18n/config";
import { UserRole } from "./enums";

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "testkey";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- 1️⃣ Xử lý locale ---
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  // --- 2️⃣ Xử lý bảo vệ route ---
  // Các route cần đăng nhập
  const protectedPaths = ["/profile"];
  // Các route yêu cầu role ADMIN
  const adminPaths = ["/dashboard"];

  // Bỏ locale ra khỏi path (vd: /en/dashboard -> /dashboard)
  const pathWithoutLocale = pathname.replace(/^\/(en|vi)/, "");

  // Nếu không thuộc route bảo vệ thì cho qua luôn
  if (
    !protectedPaths.some((p) => pathWithoutLocale.startsWith(p)) &&
    !adminPaths.some((p) => pathWithoutLocale.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // --- 3️⃣ Kiểm tra JWT ---
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}/signin`, request.url)
    );
  }

  try {
    console.log("Token", token);
    console.log("JWT Secret", JWT_SECRET);
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    console.log("Payload", payload);

    // --- 4️⃣ Kiểm tra quyền admin ---
    if (
      adminPaths.some((p) => pathWithoutLocale.startsWith(p)) &&
      payload.role !== UserRole.ADMIN
    ) {
      return NextResponse.redirect(
        new URL(`/${defaultLocale}/not-found`, request.url)
      );
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Invalid JWT:", err);
    return NextResponse.redirect(
      new URL(`/${defaultLocale}/signin`, request.url)
    );
  }
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|assets|.*\\..*|auth-callback|auth-success).*)",
  ],
};
