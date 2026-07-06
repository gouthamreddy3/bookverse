import {
  BellIcon,
  BookOpenIcon,
  CompassIcon,
  HomeIcon,
  LayoutDashboardIcon,
  ListIcon,
  MessageSquareIcon,
  UserIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: typeof HomeIcon;
  /** Shown only when the user is authenticated. */
  requiresAuth?: boolean;
  /** Included in the mobile bottom tab bar (kept short — 5 items max). */
  inBottomNav?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: HomeIcon, inBottomNav: true },
  { label: "Explore", href: "/explore", icon: CompassIcon, inBottomNav: true },
  { label: "Books", href: "/books", icon: BookOpenIcon, inBottomNav: true },
  { label: "Reviews", href: "/reviews", icon: MessageSquareIcon },
  { label: "Reading Lists", href: "/lists", icon: ListIcon, requiresAuth: true, inBottomNav: true },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon, requiresAuth: true },
];

export const NOTIFICATIONS_NAV: NavItem = {
  label: "Notifications",
  href: "/notifications",
  icon: BellIcon,
  requiresAuth: true,
};

export const PROFILE_NAV: NavItem = {
  label: "Profile",
  href: "/profile",
  icon: UserIcon,
  requiresAuth: true,
  inBottomNav: true,
};
