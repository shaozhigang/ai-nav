// Navigation configuration

export interface NavigationItem {
  key?: string;
  title?: string;
  href: string;
}

// These are the navigation keys for translation
export const marketingNavigationKeys = [
  {
    key: "tools",
    href: "/tools",
  },
  {
    key: "blog",
    href: "/blog",
  },
  {
    key: "contact",
    href: "/contact",
  },
];

export const appNavigationKeys = [
  {
    key: "dashboard",
    href: "/dashboard",
  },
  {
    key: "profile",
    href: "/profile",
  },
];

// Legacy exports for compatibility
export const marketingNavigation: NavigationItem[] = [
  {
    title: "Tools",
    href: "/tools",
  },
  {
    title: "Blog",
    href: "/blog",
  },
  {
    title: "Contact",
    href: "/contact",
  },
];

export const appNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Profile",
    href: "/profile",
  },
];
