"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container">
      <div className="mx-auto max-w-[1440px] px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="DisasterLink Logo" width={36} height={36} className="shrink-0 object-contain" />
              <div>
                <span className="text-sm font-bold tracking-wide text-on-surface">
                  DISASTERLINK
                </span>
                <p className="text-[10px] text-on-surface-variant tracking-widest uppercase">
                  National Emergency Management Agency
                </p>
              </div>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Providing federal command structure with real-time geospatial
              intelligence and unified communications for large-scale disaster
              management.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-label-caps text-on-surface-variant mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Active Alerts", href: "/alerts" },
                { label: "Find Shelter", href: "/shelters" },
                { label: "Report Emergency", href: "/dashboard/sos" },
                { label: "Volunteer", href: "/register" },
                { label: "About NEMA", href: "/about" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-label-caps text-on-surface-variant mb-4">
              Emergency Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <Phone className="h-4 w-4 text-error" />
                <span className="font-mono font-semibold text-on-surface">
                  911
                </span>
                <span>— Life Threatening</span>
              </li>
              <li className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-mono font-semibold text-on-surface">
                  1-800-621-3362
                </span>
              </li>
              <li className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <Mail className="h-4 w-4 text-primary" />
                ops@disasterlink.gov
              </li>
              <li className="flex items-start gap-2 text-body-sm text-on-surface-variant">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                500 C Street SW, Washington, DC 20472
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-label-caps text-on-surface-variant mb-4">
              Legal & Compliance
            </h3>
            <ul className="space-y-2">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Accessibility Statement",
                "FOIA Requests",
                "Agency Directory",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-body-sm text-on-surface-variant text-center sm:text-left">
            © {new Date().getFullYear()} DisasterLink — National Emergency Management
            Agency. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-body-sm text-on-surface-variant">
            <span>FedRAMP High</span>
            <span className="mx-1">·</span>
            <span>SOC 2 Type II</span>
            <span className="mx-1">·</span>
            <span>WCAG 2.1 AA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
