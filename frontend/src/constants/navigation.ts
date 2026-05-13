import type { NavItem } from "@/types";

export const publicNav: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Alerts", href: "/alerts" },
  { title: "Shelters", href: "/shelters" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

export const dashboardNav: NavItem[] = [
  { title: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "SOS Emergency", href: "/dashboard/sos", icon: "Siren" },
  { title: "Emergency Feed", href: "/dashboard/feed", icon: "Radio" },
  { title: "My Requests", href: "/dashboard/requests", icon: "FileText" },
  { title: "Live Map", href: "/dashboard/map", icon: "Map" },
  { title: "Profile", href: "/dashboard/profile", icon: "UserCircle" },
];

export const volunteerNav: NavItem[] = [
  { title: "Command Center", href: "/volunteer", icon: "Shield" },
  { title: "My Tasks", href: "/volunteer/tasks", icon: "ClipboardList" },
  { title: "Navigation", href: "/volunteer/navigate", icon: "Navigation" },
  { title: "Profile", href: "/dashboard/profile", icon: "UserCircle" },
];

export const adminNav: NavItem[] = [
  { title: "Operations Center", href: "/admin", icon: "Activity" },
  { title: "Incidents", href: "/admin/incidents", icon: "AlertTriangle" },
  { title: "Shelters", href: "/admin/shelters", icon: "Home" },
  { title: "Volunteers", href: "/admin/volunteers", icon: "Users" },
  { title: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
  { title: "Alert Commander", href: "/admin/notifications", icon: "Bell" },
];

export const SITE_CONFIG = {
  name: "DisasterLink",
  description: "National Emergency Management Platform — Real-time disaster coordination, resource management, and emergency response.",
  url: "https://disasterlink.gov",
  tagline: "National Emergency Infrastructure & Response Synchronization",
};
