"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
} from "flowbite-react";
import Link from "next/link";
import {
  FaTwitter,
  FaPinterest,
  FaFacebook,
  FaInstagram,
  FaShoppingCart,
  FaBars,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaHeart,
} from "react-icons/fa";
import LanguageSwitcher from "../../components/header/LanguageSwitcher";
import Image from "next/image";
import SearchBar from "@/app/components/header/Search";
import { usePathname } from "next/navigation";
import { navItems } from "@/constants";
import UserDropdown from "./UserDropdown";
import { useTranslations } from "use-intl";

const AppNavbar = () => {
  const wishlistCount = 2;
  const cartCount = 3;

  const pathname = usePathname();
  const t = useTranslations("navbar");

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] || "en";
  const currentPath = "/" + (segments[1] ?? "");

  return (
    <div className="w-full">
      {/* Top bar */}
      <div className="bg-black text-white text-sm flex justify-between items-center px-4 py-1">
        <div className="flex gap-4 items-center">
          {/* Email */}
          <a
            href="mailto:setsail@qode.com"
            className="flex items-center gap-1 hover:text-cyan transition-colors"
          >
            <FaEnvelope className="text-cyan mr-2" />
            bookora@gmail.com
          </a>

          {/* Phone */}
          <a
            href="tel:0324782904"
            className="flex items-center gap-1 hover:text-cyan transition-colors"
          >
            <FaPhone className="text-cyan mr-2" />0 324 782 904
          </a>

          {/* Address */}
          <a
            href="https://www.google.com/maps/place/Broadway+%26+Morris+St,+New+York"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-cyan transition-colors"
          >
            <FaMapMarkerAlt className="text-cyan mr-2" />
            Broadway and Morris St, New York
          </a>
        </div>

        <div className="flex items-center gap-4">
          {/* Social icons */}
          <div className="flex gap-3">
            <Link href="https://twitter.com" target="_blank">
              <FaTwitter className="cursor-pointer hover:text-cyan transition-colors" />
            </Link>
            <Link href="https://pinterest.com" target="_blank">
              <FaPinterest className="cursor-pointer hover:text-cyan transition-colors" />
            </Link>
            <Link href="https://facebook.com" target="_blank">
              <FaFacebook className="cursor-pointer hover:text-cyan transition-colors" />
            </Link>
            <Link href="https://instagram.com" target="_blank">
              <FaInstagram className="cursor-pointer hover:text-cyan transition-colors" />
            </Link>
          </div>

          {/* Language dropdown */}
          <LanguageSwitcher />

          {/* User dropdown */}
          <UserDropdown />
        </div>
      </div>

      {/* Main navbar */}
      <Navbar fluid className="bg-white shadow-md shadow-gray-200/60 px-4">
        {/* Logo */}
        <NavbarBrand href="/">
          <Image
            src="/images/logo/rectangle-logo.png"
            alt="Setsail Logo"
            width={240}
            height={60}
            className="h-15 w-auto"
          />
        </NavbarBrand>

        <div className="flex items-center">
          <SearchBar />
        </div>
        {/* Menu items */}
        <NavbarCollapse>
          {navItems.map((item) => {
            const isActive =
              (item.path === "/" && currentPath === "/") ||
              (item.path !== "/" && currentPath.startsWith(item.path));

            return (
              <NavbarLink
                key={item.path}
                href={`/${locale}${item.path}`}
                active={isActive}
                className={
                  isActive ? "navbar-link-active" : "hover-cyan-underline"
                }
              >
                {t(item.label)}
              </NavbarLink>
            );
          })}
        </NavbarCollapse>

        {/* Right icons */}
        <div className="flex items-center gap-6">
          {/* Wishlist with badge */}
          <div className="relative cursor-pointer">
            <FaHeart className="text-xl hover:text-cyan transition-colors" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {wishlistCount}
              </span>
            )}
          </div>

          {/* Cart with badge */}
          <div className="relative cursor-pointer mr-2">
            <FaShoppingCart className="text-xl hover:text-cyan transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </div>

          <FaBars className="text-xl cursor-pointer hover:text-cyan transition-colors md:hidden" />
        </div>
      </Navbar>
    </div>
  );
};

export default AppNavbar;
