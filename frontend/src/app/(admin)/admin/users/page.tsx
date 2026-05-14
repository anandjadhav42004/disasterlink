"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MANAGED_USERS, type ManagedUser } from "@/lib/auth";
import { roleBadgeClass, roleLabel } from "@/lib/permissions";
import type { UserRole } from "@/types";
import { userService } from "@/services";

export default function UserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>(MANAGED_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "pending">("all");
  const [sortBy, setSortBy] = useState<"name" | "role" | "lastActive">("name");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "", role: "citizen", district: "", state: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    userService.getAll().then((response) => {
      const loaded = response.data.data.map((user: ManagedUser & { status?: string }) => ({
        ...user,
        status: (user.status ?? "active") as ManagedUser["status"],
        lastActive: user.lastActive ?? "Live API",
      }));
      setUsers(loaded);
    }).catch(() => {
      toast.error("Using cached user roster", { description: "The user API could not be reached." });
    });
  }, []);

  // Filter & sort
  const filtered = users
    .filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.district?.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "role") return a.role.localeCompare(b.role);
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelect = (id: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedUsers.size === paged.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paged.map((u) => u.id)));
    }
  };

  const handleSuspend = async (id: string) => {
    const target = users.find((user) => user.id === id);
    const nextStatus = target?.status === "suspended" ? "active" : "suspended";
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: nextStatus } : u
      )
    );
    try {
      await userService.update(id, { status: nextStatus });
      toast.success(nextStatus === "suspended" ? "User suspended" : "User activated");
    } catch {
      toast.error("User status update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this user? This action is irreversible.")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      await userService.delete(id);
      toast.success("User deactivated");
    }
  };

  const handleRoleChange = async (id: string, newRole: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
    try {
      await userService.update(id, { role: newRole });
      toast.success("Role updated");
    } catch {
      toast.error("Role update failed");
    }
  };

  const handleBulkSuspend = async () => {
    const ids = [...selectedUsers];
    setUsers((prev) => prev.map((user) => ids.includes(user.id) ? { ...user, status: "suspended" } : user));
    await userService.bulkSuspend(ids);
    setSelectedUsers(new Set());
    toast.success("Selected users suspended");
  };

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await userService.create(newUser);
    const created = response.data.data.user as ManagedUser;
    setUsers((prev) => [{ ...created, status: "pending", lastActive: "Invitation sent" }, ...prev]);
    toast.success("User invitation sent", { description: `Temporary password: ${response.data.data.invitation.temporaryPassword}` });
    setShowAddModal(false);
    setNewUser({ name: "", email: "", phone: "", role: "citizen", district: "", state: "" });
  };

  const statusBg: Record<string, string> = {
    active: "bg-primary/10 text-primary",
    suspended: "bg-error/10 text-error",
    pending: "bg-tertiary/10 text-tertiary",
  };

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              admin_panel_settings
            </span>
            User Management
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage all registered users across the DisasterLink platform. {filtered.length} users found.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="bg-primary text-on-primary px-6 py-3 rounded-lg text-title-sm flex items-center gap-2 hover:opacity-90 transition-opacity w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add User
        </button>
      </div>

      {/* Filters Row */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or district..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-base focus:border-primary outline-none"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value as "all" | UserRole); setCurrentPage(1); }}
            className="p-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-base outline-none focus:border-primary"
          >
            <option value="all">All Roles</option>
            <option value="citizen">Citizen</option>
            <option value="volunteer">Volunteer</option>
            <option value="admin">Administrator</option>
            <option value="district_admin">District Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as "all" | "active" | "suspended" | "pending"); setCurrentPage(1); }}
            className="p-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-base outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Bulk actions */}
        {selectedUsers.size > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-primary-container/20 rounded-lg border border-primary/20">
            <span className="text-label-caps text-primary">{selectedUsers.size} SELECTED</span>
            <button onClick={handleBulkSuspend} className="text-body-sm text-error hover:underline">Suspend Selected</button>
            <button className="text-body-sm text-on-surface-variant hover:underline">Export Selected</button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high border-b border-outline-variant">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === paged.length && paged.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-label-caps text-on-surface-variant cursor-pointer hover:text-on-surface" onClick={() => setSortBy("name")}>
                  USER {sortBy === "name" && "↓"}
                </th>
                <th className="px-4 py-3 text-label-caps text-on-surface-variant cursor-pointer hover:text-on-surface" onClick={() => setSortBy("role")}>
                  ROLE {sortBy === "role" && "↓"}
                </th>
                <th className="px-4 py-3 text-label-caps text-on-surface-variant">DISTRICT</th>
                <th className="px-4 py-3 text-label-caps text-on-surface-variant">STATUS</th>
                <th className="px-4 py-3 text-label-caps text-on-surface-variant cursor-pointer hover:text-on-surface" onClick={() => setSortBy("lastActive")}>
                  LAST ACTIVE {sortBy === "lastActive" && "↓"}
                </th>
                <th className="px-4 py-3 text-label-caps text-on-surface-variant text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {paged.map((user) => {
                return (
                  <tr key={user.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-title-sm font-bold">
                          {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-body-base font-medium text-on-surface">{user.name}</p>
                          <p className="text-body-sm text-on-surface-variant">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className={`text-[11px] font-bold uppercase px-2 py-1 rounded ${roleBadgeClass(user.role)} border-none outline-none cursor-pointer`}
                      >
                        <option value="citizen">Citizen</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="admin">Administrator</option>
                        <option value="district_admin">District Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">{user.district || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold uppercase px-2 py-1 rounded ${statusBg[user.status]}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-mono-data text-on-surface-variant text-body-sm">
                      {user.lastActive || "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleSuspend(user.id)}
                          title={user.status === "suspended" ? "Reactivate" : "Suspend"}
                          className="p-1.5 rounded hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                            {user.status === "suspended" ? "check_circle" : "block"}
                          </span>
                        </button>
                        <button
                          title="Reset Password"
                          onClick={async () => {
                            const response = await userService.resetPassword(user.id);
                            toast.success("Reset email queued", { description: `Temporary password: ${response.data.data.temporaryPassword}` });
                          }}
                          className="p-1.5 rounded hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">lock_reset</span>
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          title="Delete User"
                          className="p-1.5 rounded hover:bg-error-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px] text-error">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">person_off</span>
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant bg-surface-container-low">
            <span className="text-body-sm text-on-surface-variant">
              Page {currentPage} of {totalPages} · {filtered.length} total users
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded text-body-sm bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-high disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 rounded text-body-sm border transition-colors ${
                    currentPage === i + 1
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-container-lowest border-outline-variant hover:bg-surface-container-high"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded text-body-sm bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-high disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Legend */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
        <h3 className="text-label-caps text-on-surface-variant mb-3">ROLE HIERARCHY & ACCESS LEVELS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {(["super_admin", "admin", "district_admin", "volunteer", "citizen"] as UserRole[]).map((role) => {
            return (
              <div key={role} className="flex items-center gap-2 p-2 rounded bg-surface-container-low">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${roleBadgeClass(role)}`}>
                  {roleLabel(role)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateUser} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-title-sm">Add User</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="material-symbols-outlined">close</button>
            </div>
            <input required value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Name" />
            <div className="grid grid-cols-2 gap-3">
              <input required type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Email" />
              <input required value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Phone" />
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface">
                <option value="citizen">Citizen</option><option value="volunteer">Volunteer</option><option value="admin">Administrator</option><option value="district_admin">District Admin</option><option value="super_admin">Super Admin</option>
              </select>
              <input value={newUser.district} onChange={(e) => setNewUser({ ...newUser, district: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder="District" />
              <input value={newUser.state} onChange={(e) => setNewUser({ ...newUser, state: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder="State" />
            </div>
            <button className="w-full bg-primary text-on-primary py-3 rounded-lg text-label-caps">Send Invitation</button>
          </form>
        </div>
      )}
    </div>
  );
}
