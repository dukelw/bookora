export interface NavItem {
  label: string;
  path: string;
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
