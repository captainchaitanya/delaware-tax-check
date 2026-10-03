import type { ComponentType } from "react";
import {
  IconCalendar,
  IconHome,
  IconInbox,
  IconSettings,
  IconTools,
} from "./NavIcons";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType;
  badge?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: IconHome },
  { href: "/calendar", label: "Calendar", icon: IconCalendar },
  { href: "/inbox", label: "Inbox", icon: IconInbox },
  { href: "/tools", label: "Tools", icon: IconTools },
  { href: "/settings", label: "Settings", icon: IconSettings },
];
