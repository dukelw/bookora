"use client";

import { Navbar, NavbarBrand } from "flowbite-react";
import {
  FaBars,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaSearch,
  FaBell,
  FaTwitter,
  FaPinterest,
  FaFacebook,
  FaInstagram,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Link from "next/link";
import LanguageSwitcher from "../../components/header/LanguageSwitcher";
import SearchModal from "@/app/components/header/SearchModal";
import MenuDrawer from "@/app/components/header/MenuDrawer";
import UserDropdown from "./UserDropdown";
import { usePathname } from "next/navigation";
import { useTranslations } from "use-intl";
import { useState } from "react";
import { navItems } from "@/constants";
import Image from "next/image";

interface AppNavbarProps {
  onToggleSidebar?: () => void; // toggle callback
  isCollapsed?: boolean;
}

const AppNavbar = ({ onToggleSidebar, isCollapsed }: AppNavbarProps) => {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] || "en";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 🔔 noti count
  const notificationCount = 5;

  return (
    <div className="w-full">
      {/* Top bar */}
      <div className="bg-black text-white text-sm flex flex-col sm:flex-row justify-between items-center px-4 py-1">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
          <a
            href="mailto:..."
            className="flex items-center gap-1 hover:text-cyan transition-colors"
          >
            <FaEnvelope className="text-cyan mr-2" /> bookora@gmail.com
          </a>
          <a
            href="tel:..."
            className="flex items-center gap-1 hover:text-cyan transition-colors"
          >
            <FaPhone className="text-cyan mr-2" /> 0 324 782 904
          </a>
          <a
            href="..."
            target="_blank"
            className="flex items-center gap-1 hover:text-cyan transition-colors"
          >
            <FaMapMarkerAlt className="text-cyan mr-2" /> Broadway and Morris
            St, NY
          </a>
        </div>

        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <div className="flex gap-3">
            <Link href="...">
              <FaTwitter className="cursor-pointer hover:text-cyan transition-colors" />
            </Link>
            <Link href="...">
              <FaPinterest className="cursor-pointer hover:text-cyan transition-colors" />
            </Link>
            <Link href="...">
              <FaFacebook className="cursor-pointer hover:text-cyan transition-colors" />
            </Link>
            <Link href="...">
              <FaInstagram className="cursor-pointer hover:text-cyan transition-colors" />
            </Link>
          </div>
          <LanguageSwitcher />
          <UserDropdown />
        </div>
      </div>

      {/* Main navbar */}
      <Navbar fluid className="bg-white shadow-md shadow-gray-200/60 px-4">
        <div className="flex items-center gap-3">
          {/* Logo - chỉ hiện khi sidebar chưa collapse */}
          {!isCollapsed && (
            <NavbarBrand href="/">
              <img
                src="/images/logo/rectangle-logo.png"
                alt="Setsail Logo"
                width="240"
                height="60"
                className="h-15 w-auto"
                loading="eager"
              />
            </NavbarBrand>
          )}

          {/* Nút toggle sidebar */}
          <button
            onClick={onToggleSidebar}
            className="p-2 cursor-pointer rounded hover:bg-gray-100"
          >
            {isCollapsed ? (
              <FaChevronRight size={20} />
            ) : (
              <FaChevronLeft size={20} />
            )}
          </button>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          {/* Search icon on mobile */}
          <div
            className="md:hidden relative cursor-pointer"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <FaSearch className="text-xl hover:text-cyan transition-colors" />
          </div>

          {/* 🔔 Notification */}
          <div className="relative cursor-pointer">
            <FaBell className="text-xl hover:text-cyan transition-colors" />
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {notificationCount}
              </span>
            )}
          </div>

          {/* Hamburger for drawer */}
          <div
            className="md:hidden cursor-pointer"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          >
            <FaBars className="text-xl hover:text-cyan transition-colors" />
          </div>
        </div>
      </Navbar>

      {/* Search modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Menu drawer */}
      <MenuDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navItems={navItems}
        locale={locale}
      />
    </div>
  );
};

export default AppNavbar;
