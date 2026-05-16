import type { NavItem } from "@/types";

export const publicNav: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Alerts", href: "/alerts" },
  { title: "Shelters", href: "/shelters" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

export const dashboardNav: NavItem[] = [
  { title: "Overview", href: "/dashboard", icon: "LayoutDashboard", module: "dashboard" },
  { title: "SOS Emergency", href: "/dashboard/sos", icon: "Siren", requiredPermissions: ["sos.create"] },
  { title: "Emergency Feed", href: "/dashboard/feed", icon: "Radio", requiredPermissions: ["alerts.view"] },
  { title: "My Requests", href: "/dashboard/requests", icon: "FileText", requiredPermissions: ["sos.view_own"] },
  { title: "Profile", href: "/dashboard/profile", icon: "UserCircle" },
];

export const volunteerNav: NavItem[] = [
  { title: "Command Center", href: "/volunteer", icon: "Shield", module: "volunteer" },
  { title: "My Tasks", href: "/volunteer/tasks", icon: "ClipboardList", requiredPermissions: ["volunteers.respond", "volunteers.manage"] },
  { title: "Navigation", href: "/volunteer/navigate", icon: "Navigation", requiredPermissions: ["volunteers.respond", "map.view"] },
  { title: "Profile", href: "/dashboard/profile", icon: "UserCircle" },
];

export const adminNav: NavItem[] = [
  { title: "Super Command", href: "/admin/super", icon: "Shield", requiredPermissions: ["roles.manage", "config.manage"] },
  { title: "Operations Center", href: "/admin", icon: "Activity", module: "admin" },
  { title: "National Map", href: "/admin/map", icon: "Map", requiredPermissions: ["map.view", "map.full_access"] },
  { title: "Incidents", href: "/admin/incidents", icon: "AlertTriangle", requiredPermissions: ["incidents.view", "incidents.manage"] },
  { title: "Shelters", href: "/admin/shelters", icon: "Home", requiredPermissions: ["shelters.manage", "shelters.create"] },
  { title: "Volunteers", href: "/admin/volunteers", icon: "Users", requiredPermissions: ["volunteers.view", "volunteers.manage"] },
  { title: "User Management", href: "/admin/users", icon: "Shield", requiredPermissions: ["users.view", "users.edit"] },
  { title: "Analytics", href: "/admin/analytics", icon: "BarChart3", requiredPermissions: ["analytics.view", "analytics.national"] },
  { title: "Alert Commander", href: "/admin/notifications", icon: "Bell", requiredPermissions: ["alerts.broadcast", "notifications.manage"] },
  { title: "Audit Logs", href: "/admin/audit", icon: "FileText", requiredPermissions: ["audit.view", "roles.manage"] },
];

export const SITE_CONFIG = {
  name: "DisasterLink",
  description: "National Emergency Management Platform — Real-time disaster coordination, resource management, and emergency response.",
  url: "https://disasterlink.gov",
  tagline: "National Emergency Infrastructure & Response Synchronization",
};
