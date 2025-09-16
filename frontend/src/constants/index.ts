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
  { label: "categories", path: "/categories" },
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
    ],
  },
  { label: "userManagement", path: "/dashboard/user" },
  { label: "orderManagement", path: "/dashboard/order" },
  { label: "discountManagement", path: "/dashboard/discount" },
];
