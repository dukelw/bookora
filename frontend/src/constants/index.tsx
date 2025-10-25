import {
  FaClock,
  FaTimesCircle,
  FaMoneyBillWave,
  FaBoxOpen,
  FaCheckCircle,
} from "react-icons/fa";

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

export const FALLBACK_BOOK = "/images/fallback/book.png";

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

export const REDIRECT_URL = `${process.env.NEXT_PUBLIC_CLIENT_URL}/payment/success`;

export const STATUS_MAP = {
  pending: {
    label: "pending",
    color: "warning",
    icon: <FaClock className="inline mr-1" />,
  },
  paid: {
    label: "paid",
    color: "success",
    icon: <FaMoneyBillWave className="inline mr-1" />,
  },
  shipped: {
    label: "shipped",
    color: "info",
    icon: <FaBoxOpen className="inline mr-1" />,
  },
  cancelled: {
    label: "cancelled",
    color: "failure",
    icon: <FaTimesCircle className="inline mr-1" />,
  },
  completed: {
    label: "completed",
    color: "success",
    icon: <FaCheckCircle className="inline mr-1" />,
  },
};

export const SHIPPING_FEE = 30000; // 30,000 VND