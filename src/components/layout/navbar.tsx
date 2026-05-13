"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { publicNav } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-primary-container">
      <nav
        className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6"
        aria-label="Primary navigation"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-on-primary/10 border border-on-primary/20 transition-colors group-hover:bg-on-primary/20">
            <Shield className="h-5 w-5 text-on-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-wide text-on-primary leading-none">
              DISASTERLINK
            </span>
            <span className="text-[10px] font-medium text-on-primary/60 tracking-widest uppercase leading-none mt-0.5">
              NEMA
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {publicNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded transition-colors",
                  isActive
                    ? "bg-on-primary/15 text-on-primary"
                    : "text-on-primary/70 hover:text-on-primary hover:bg-on-primary/10"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded text-on-primary/70 hover:bg-on-primary/10 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <Link
            href="/login"
            className="hidden sm:flex items-center gap-2 h-9 px-4 text-sm font-semibold rounded bg-on-primary text-primary-container hover:bg-on-primary/90 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded text-on-primary/70 hover:bg-on-primary/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden md:hidden border-t border-on-primary/10 bg-primary-container"
          >
            <div className="px-4 py-3 space-y-1">
              {publicNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-on-primary/80 hover:bg-on-primary/10 rounded transition-colors"
                >
                  {item.title}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 mt-2 text-sm font-semibold rounded bg-on-primary text-primary-container"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
