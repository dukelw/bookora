"use client";

import { Drawer, Button } from "flowbite-react";
import Link from "next/link";
import { useTranslations } from "use-intl";

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { path: string; label: string }[];
  locale: string;
}

const MenuDrawer = ({ isOpen, onClose, navItems, locale }: MenuDrawerProps) => {
  const t = useTranslations("navbar");

  return (
    <Drawer position="left" open={isOpen} onClose={onClose}>
      <div className="flex flex-col p-6 h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Menu</h2>
        </div>

        <nav className="flex flex-col gap-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={`/${locale}${item.path}`}
              onClick={onClose}
              className="text-lg hover:text-cyan transition-colors"
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>
      </div>
    </Drawer>
  );
};

export default MenuDrawer;
