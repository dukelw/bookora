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
  FaSearch,
} from "react-icons/fa";
import LanguageSwitcher from "../../components/header/LanguageSwitcher";
import Image from "next/image";
import SearchBar from "@/app/components/header/Search";
import { usePathname } from "next/navigation";
import { navItems } from "@/constants";
import UserDropdown from "./UserDropdown";
import { useTranslations } from "use-intl";
import { useEffect, useState } from "react";
import SearchModal from "@/app/components/header/SearchModal";
import MenuDrawer from "@/app/components/header/MenuDrawer";
import CartDropdown from "@/app/components/header/CartDropdown";
import { cartService } from "@/services/cartService";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { eventBus } from "@/utils/eventBus";

const AppNavbar = () => {
  const { user } = useAuthStore();
  const { cart, setCart } = useCartStore();
  const wishlistCount = 2;

  const pathname = usePathname();
  const t = useTranslations("navbar");

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] || "en";
  const currentPath = "/" + (segments[1] ?? "");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleGetCart = async () => {
    try {
      if (!user?._id) return;
      const res = await cartService.getCart(user._id);
      setCart(res);
    } catch (err: any) {
      console.error(
        "Không thể tải giỏ hàng:",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    if (user?._id) {
      handleGetCart();
    }
  }, [user]);

  useEffect(() => {
    eventBus.on("cart:refresh", handleGetCart);
    return () => eventBus.off("cart:refresh", handleGetCart);
  }, []);

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

        {/* Search bar */}
        <div className="hidden md:flex items-center ml-6">
          <SearchBar />
        </div>

        {/* Menu items */}
        <NavbarCollapse className="md:flex hidden">
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
                  isActive
                    ? "navbar-link-active"
                    : "hover-cyan-underline navbar-link"
                }
              >
                {t(item.label)}
              </NavbarLink>
            );
          })}
        </NavbarCollapse>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          {/* Search icon on mobile */}
          <div
            className="md:hidden relative cursor-pointer"
            onClick={toggleSearch}
          >
            <FaSearch className="text-xl hover:text-cyan transition-colors" />
          </div>

          {/* Wishlist */}
          <div className="relative cursor-pointer">
            <FaHeart className="text-xl hover:text-cyan transition-colors" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {wishlistCount}
              </span>
            )}
          </div>

          {/* Cart */}
          <div className="relative">
            <div
              className="relative cursor-pointer"
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              <FaShoppingCart className="text-xl hover:text-cyan transition-colors" />
              {(cart?.items?.length ?? 0) > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full select-none pointer-events-none">
                  {cart?.items?.length ?? 0}
                </span>
              )}
            </div>

            <CartDropdown
              cart={cart}
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
            />
          </div>

          {/* Hamburger for drawer */}
          <div className="md:hidden cursor-pointer" onClick={toggleDrawer}>
            <FaBars className="text-xl hover:text-cyan transition-colors" />
          </div>
        </div>
      </Navbar>

      {/* Search modal */}
      <SearchModal isOpen={isSearchOpen} onClose={toggleSearch} />

      {/* Menu drawer */}
      <MenuDrawer
        isOpen={isDrawerOpen}
        onClose={toggleDrawer}
        navItems={navItems}
        locale={locale}
      />
    </div>
  );
};

export default AppNavbar;
