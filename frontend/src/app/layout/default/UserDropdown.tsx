"use client";

import { Dropdown, DropdownDivider, DropdownItem } from "flowbite-react";
import { FaUser } from "react-icons/fa";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { useTranslations } from "use-intl";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { UserRole } from "@/enums";

const UserDropdown = () => {
  const t = useTranslations("navbar");
  const { user, setUser, setTokens } = useAuthStore();

  const { setCart } = useCartStore();
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setCart(null);
    setTokens(null);
    router.push("/signin");
  };

  return (
    <Dropdown
      arrowIcon={false}
      inline
      label={<FaUser className="cursor-pointer text-lg" />}
    >
      {!user ? (
        <>
          <DropdownItem onClick={() => router.push("/signin")}>
            {t("signIn")}
          </DropdownItem>
          <DropdownItem onClick={() => router.push("/signup")}>
            {t("signUp")}
          </DropdownItem>
        </>
      ) : (
        <>
          {user.role === UserRole.ADMIN && (
            <DropdownItem onClick={() => router.push("/dashboard")}>
              {t("dashboard")}
            </DropdownItem>
          )}
          <DropdownItem onClick={() => router.push("/profile")}>
            {t("profile")}
          </DropdownItem>
          <DropdownItem onClick={() => router.push("/orders")}>
            {t("orderHistory")}
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem onClick={handleLogout}>{t("logout")}</DropdownItem>
        </>
      )}
    </Dropdown>
  );
};

export default UserDropdown;
