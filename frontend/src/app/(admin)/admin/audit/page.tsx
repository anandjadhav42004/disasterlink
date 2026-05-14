"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services";

export default function AuditLogsPage() {
  const fallbackLogs = [
    { id: "AUD-001", timestamp: "13/05/2026 • 18:45 IST", actor: "Director Rajesh Patil", action: "Changed role of Priya Sharma from Citizen to Volunteer", category: "ROLE_CHANGE", severity: "warning", ip: "103.21.XX.XX" },
    { id: "AUD-002", timestamp: "13/05/2026 • 18:30 IST", actor: "Commissioner Vikram Singh", action: "Emergency Override activated for Konkan Coastal District", category: "EMERGENCY", severity: "critical", ip: "14.139.XX.XX" },
    { id: "AUD-003", timestamp: "13/05/2026 • 17:15 IST", actor: "DM Sneha Kulkarni", action: "Deployed 4 NDRF teams to Kolhapur sector", category: "DEPLOYMENT", severity: "info", ip: "49.36.XX.XX" },
    { id: "AUD-004", timestamp: "13/05/2026 • 16:42 IST", actor: "System", action: "Auto-escalated INC-2041 from HIGH to CRITICAL", category: "SYSTEM", severity: "warning", ip: "—" },
    { id: "AUD-005", timestamp: "13/05/2026 • 15:30 IST", actor: "Director Rajesh Patil", action: "Suspended account: anita.k@disasterlink.in (Policy Violation)", category: "USER_MGMT", severity: "warning", ip: "103.21.XX.XX" },
    { id: "AUD-006", timestamp: "13/05/2026 • 14:20 IST", actor: "Admin Patil", action: "Broadcast Emergency Alert: Konkan Coastal Evacuation", category: "ALERT", severity: "critical", ip: "103.21.XX.XX" },
    { id: "AUD-007", timestamp: "13/05/2026 • 12:00 IST", actor: "DM Arun Kumar", action: "Added new shelter: Chennai District Relief Camp #7", category: "SHELTER", severity: "info", ip: "59.92.XX.XX" },
    { id: "AUD-008", timestamp: "12/05/2026 • 22:10 IST", actor: "System", action: "Session expired for citizen@disasterlink.in after 24h inactivity", category: "SYSTEM", severity: "info", ip: "—" },
    { id: "AUD-009", timestamp: "12/05/2026 • 18:00 IST", actor: "Commissioner Vikram Singh", action: "Created new District Admin account: meera.j@disasterlink.gov.in", category: "USER_MGMT", severity: "info", ip: "14.139.XX.XX" },
    { id: "AUD-010", timestamp: "12/05/2026 • 09:45 IST", actor: "System", action: "Failed login attempt (3x) for admin@disasterlink.gov.in from 185.XX.XX.XX", category: "SECURITY", severity: "critical", ip: "185.XX.XX.XX" },
  ];
  const [logs, setLogs] = useState(fallbackLogs);

  useEffect(() => {
    adminService.getAudit({ take: 100 }).then((response) => {
      setLogs(response.data.data.map((log: { id: string; createdAt: string; user?: { name?: string }; action: string; module: string; severity: string; ip?: string }) => ({
        id: log.id,
        timestamp: new Date(log.createdAt).toLocaleString(),
        actor: log.user?.name || "System",
        action: log.action,
        category: log.module.toUpperCase(),
        severity: log.severity.toLowerCase(),
        ip: log.ip || "-"
      })));
    }).catch(() => undefined);
  }, []);

  const severityStyle: Record<string, string> = {
    critical: "bg-error text-on-error",
    warning: "bg-tertiary-container text-on-tertiary-container",
    info: "bg-surface-container-high text-on-surface-variant",
  };

  const categoryStyle: Record<string, string> = {
    ROLE_CHANGE: "text-tertiary",
    EMERGENCY: "text-error",
    DEPLOYMENT: "text-primary",
    SYSTEM: "text-outline",
    USER_MGMT: "text-secondary",
    ALERT: "text-error",
    SHELTER: "text-primary",
    SECURITY: "text-error",
  };

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <div>
        <h1 className="text-headline-md text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            history
          </span>
          Audit Logs
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Complete activity trail for all administrative and system actions. Super Admin access only.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Events (24h)", value: "847", icon: "receipt_long" },
          { label: "Security Alerts", value: "3", icon: "gpp_maybe", color: "text-error" },
          { label: "Role Changes", value: "12", icon: "swap_horiz", color: "text-tertiary" },
          { label: "Emergency Overrides", value: "1", icon: "emergency", color: "text-error" },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-[18px] ${s.color || "text-primary"}`}>{s.icon}</span>
              <span className="text-label-caps text-on-surface-variant">{s.label}</span>
            </div>
            <p className={`text-headline-md ${s.color || "text-on-surface"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high border-b border-outline-variant">
              <tr>
                {["TIMESTAMP", "ACTOR", "ACTION", "CATEGORY", "SEVERITY", "IP ADDRESS"].map((h) => (
                  <th key={h} className="px-4 py-3 text-label-caps text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 text-mono-data text-on-surface-variant text-body-sm whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-4 py-3 text-body-sm font-medium text-on-surface">{log.actor}</td>
                  <td className="px-4 py-3 text-body-sm text-on-surface-variant max-w-[400px]">{log.action}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase ${categoryStyle[log.category] || "text-outline"}`}>
                      {log.category.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${severityStyle[log.severity]}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-mono-data text-on-surface-variant text-body-sm">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
