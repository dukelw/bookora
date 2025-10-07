export interface NavItem {
  label: string;
  path: string;
}

export interface SidebarItem {
  label: string;
  path: string;
  subItems?: NavItem[];
}

export const navItems: NavItem[] = [
  { label: "home", path: "/" },
  { label: "categories", path: "/category" },
  { label: "bestsellers", path: "/bestsellers" },
  { label: "newarrivals", path: "/new-arrivals" },
  { label: "authors", path: "/authors" },
  { label: "blogs", path: "/blogs" },
  { label: "contact", path: "/contact" },
];

export const DASHBOARD_SIDEBAR_ITEMS: SidebarItem[] = [
  { label: "statistic", path: "/dashboard/statistic" },
  {
    label: "productManagement",
    path: "/dashboard/book",
    subItems: [
      { label: "categoryManagement", path: "/dashboard/category" },
      { label: "book", path: "/dashboard/book" },
      { label: "inventory", path: "/dashboard/inventory" },
    ],
  },
  { label: "userManagement", path: "/dashboard/user" },
  { label: "orderManagement", path: "/dashboard/order" },
  { label: "discountManagement", path: "/dashboard/discount" },
  { label: "footerImageManagement", path: "/dashboard/footer-image" },
];

export const FALLBACK_BOOK =
  "https://res.cloudinary.com/dukelewis-workspace/image/upload/v1758102566/uploads/mhlq9eezqw8fqrtyovco.png";

export const MAX_LIMIT = 1000000000;

export const PAYMENT_OPTIONS = [
  {
    value: "cod",
    label: "payWithCod",
    icon: "/images/payment/cod.png",
  },
  { value: "momo", label: "payWithMomo", icon: "/images/payment/momo.png" },
  { value: "vnpay", label: "payWithVNPay", icon: "/images/payment/vnpay.jpg" },
];
