import type { NavItem, UserAccess } from "@/types";

export type Permission = string;

export const PERMISSIONS = {
  ROLES_MANAGE: "roles.manage",
  ROLES_VIEW: "roles.view",
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_EDIT: "users.edit",
  USERS_DELETE: "users.delete",
  USERS_ASSIGN_ROLES: "users.assign_roles",
  INCIDENTS_VIEW: "incidents.view",
  INCIDENTS_MANAGE: "incidents.manage",
  ALERTS_BROADCAST: "alerts.broadcast",
  VOLUNTEERS_ASSIGN: "volunteers.assign",
  ANALYTICS_VIEW: "analytics.view",
  SHELTERS_MANAGE: "shelters.manage",
  MAP_VIEW: "map.view",
  MAP_FULL_ACCESS: "map.full_access",
  AUDIT_VIEW: "audit.view",
  CONFIG_MANAGE: "config.manage",
  EMERGENCY_OVERRIDE: "emergency.override",
  SESSIONS_VIEW: "sessions.view"
} as const;

const publicPaths = ["/", "/login", "/register", "/about", "/alerts", "/shelters", "/contact", "/help", "/verify"];

const routePermissions: Array<{ prefix: string; permissions: string[]; modules?: string[] }> = [
  { prefix: "/admin/super/roles", permissions: ["roles.manage"] },
  { prefix: "/admin/super", permissions: ["roles.manage", "config.manage", "audit.view"] },
  { prefix: "/admin/users", permissions: ["users.view", "users.edit"] },
  { prefix: "/admin/audit", permissions: ["audit.view", "roles.manage"] },
  { prefix: "/admin/analytics", permissions: ["analytics.view", "analytics.national"] },
  { prefix: "/admin/map", permissions: ["users.view", "map.full_access", "emergency.override"], modules: ["admin"] },
  { prefix: "/admin/incidents", permissions: ["incidents.view", "incidents.manage"] },
  { prefix: "/admin/volunteers", permissions: ["volunteers.view", "volunteers.manage"] },
  { prefix: "/admin/notifications", permissions: ["alerts.broadcast", "notifications.manage"] },
  { prefix: "/admin/shelters", permissions: ["shelters.manage", "shelters.create"] },
  { prefix: "/admin", permissions: ["analytics.view", "incidents.view", "users.view"], modules: ["admin"] },
  { prefix: "/volunteer", permissions: ["volunteers.respond", "volunteers.manage"], modules: ["volunteer"] },
  { prefix: "/dashboard/map", permissions: ["map.full_access"], modules: ["admin", "map"] },
  { prefix: "/dashboard", permissions: ["sos.create", "sos.view_own"], modules: ["dashboard"] }
];

export function hasPermission(access: UserAccess | null | undefined, required: string): boolean {
  if (!access) return false;
  return access.permissions.includes(required) || access.permissions.includes("emergency.override");
}

export function hasAnyPermission(access: UserAccess | null | undefined, required: string[] = []): boolean {
  if (required.length === 0) return true;
  return required.some((permission) => hasPermission(access, permission));
}

export function hasModule(access: UserAccess | null | undefined, module?: string) {
  if (!module) return true;
  if (!access) return false;
  return access.modules.includes("*") || access.modules.includes(module);
}

export function canAccessRoute(access: UserAccess | null | undefined, path: string): boolean {
  if (publicPaths.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return true;
  if (!access) return false;

  const match = routePermissions
    .filter((route) => path === route.prefix || path.startsWith(`${route.prefix}/`))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];

  if (!match) return true;
  const permissionAllowed = hasAnyPermission(access, match.permissions);
  const moduleAllowed = !match.modules || match.modules.some((module) => hasModule(access, module));
  return permissionAllowed || moduleAllowed;
}

export function defaultRedirect(access: UserAccess | null | undefined) {
  return access?.dashboards?.[0] ?? "/dashboard";
}

export function filterNavItems(items: NavItem[], access: UserAccess | null | undefined) {
  return items.filter((item) => hasModule(access, item.module) && hasAnyPermission(access, item.requiredPermissions));
}

export function roleLabel(role: string, access?: UserAccess | null) {
  return access?.roles.find((entry) => entry.slug === role)?.name ?? role.replaceAll("_", " ");
}

export function roleBadgeClass(role: string) {
  if (role === "super_admin") return "bg-error text-on-error";
  if (role.includes("admin")) return "bg-primary text-on-primary";
  if (role === "volunteer") return "bg-tertiary-container text-on-tertiary-container";
  return "bg-surface-container-high text-on-surface-variant";
}
