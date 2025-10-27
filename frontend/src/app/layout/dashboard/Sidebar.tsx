"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FaChartBar,
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaTag,
  FaChevronDown,
  FaChevronRight,
  FaFileImage,
  FaImage,
} from "react-icons/fa";
import { DASHBOARD_SIDEBAR_ITEMS } from "@/constants";
import { useTranslations } from "use-intl";
import { stripLocale } from "@/utils/local";
import { useState } from "react";

const ICONS: Record<string, React.ReactNode> = {
  "/dashboard/statistic": <FaChartBar />,
  "/dashboard/book": <FaBox />,
  "/dashboard/user": <FaUsers />,
  "/dashboard/order": <FaShoppingCart />,
  "/dashboard/discount": <FaTag />,
  "/dashboard/footer-image": <FaFileImage />,
  "/dashboard/collection": <FaImage />,
};

interface SidebarProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const t = useTranslations("sidebar");
  const pathname = stripLocale(usePathname());
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (path: string) => {
    setOpenItems((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  return (
    <div
      className={`bg-white shadow-md transition-all duration-300 ease-in-out min-h-screen flex flex-col flex-shrink-0
    ${isCollapsed ? "w-20" : "w-70"}`}
    >
      {/* Logo */}
      <div
        className={`flex items-center justify-center ${
          isCollapsed ? "p-4" : ""
        }`}
      >
        {isCollapsed ? (
          <Link href={"/"}>
            <Image
              src="/images/logo/logo.png"
              alt="Logo"
              width={40}
              height={40}
            />
          </Link>
        ) : null}
      </div>

      {/* Menu items */}
      <nav className="flex-1 px-2">
        {DASHBOARD_SIDEBAR_ITEMS.map((item) => {
          const isActive =
            isCollapsed &&
            !!item.subItems?.some(
              (sub) =>
                pathname === sub.path || pathname.startsWith(sub.path + "/")
            );
          const isOpen = openItems.includes(item.path);

          return (
            <div key={item.path}>
              {item.subItems ? (
                <button
                  onClick={() => toggleItem(item.path)}
                  className={`w-full flex items-center gap-3 p-3 my-2 rounded transition-colors font-light
                  ${isCollapsed ? "justify-center" : "justify-between"}
                  ${
                    isActive
                      ? "bg-cyan text-white font-semibold"
                      : "hover:bg-gray-100"
                  }
                `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-md">{ICONS[item.path]}</span>
                    {!isCollapsed && <span>{t(item.label)}</span>}
                  </div>
                  {!isCollapsed &&
                    (isOpen ? (
                      <FaChevronDown className="text-gray-500 text-sm" />
                      ) : (
                      <FaChevronRight className="text-gray-500 text-sm" />
                    ))}
                </button>
              ) : (
                // 🔽 Nếu không có con -> render Link
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 p-3 my-2 rounded transition-colors font-light ${
                    isCollapsed ? "justify-center" : ""
                  } ${isActive ? "bg-cyan text-white" : "hover:bg-gray-100"}`}
                >
                  <span className="text-md">{ICONS[item.path]}</span>
                  {!isCollapsed && <span>{t(item.label)}</span>}
                </Link>
              )}

              {/* 👇 render subItems nếu có và đang mở */}
              {!isCollapsed && item.subItems && isOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems.map((sub) => {
                    const isSubActive =
                      pathname === sub.path ||
                      pathname.startsWith(sub.path + "/");
                    return (
                      <Link
                        key={sub.path}
                        href={sub.path}
                        className={`block p-2 rounded text-sm cursor-pointer
                        ${
                          isSubActive
                            ? "bg-cyan text-white font-semibold"
                            : "text-gray-600 hover:bg-gray-100"
                        }
                      `}
                      >
                        {t(sub.label)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
