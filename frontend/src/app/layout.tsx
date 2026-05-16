import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { SocketBridge } from "@/components/providers/socket-bridge";
import { Toaster } from "sonner";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | DisasterLink",
    default: "DisasterLink — National Emergency Management Platform",
  },
  description:
    "Real-time disaster coordination, resource management, and emergency response platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="min-h-screen font-sans antialiased bg-background text-on-surface">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <AuthProvider>
            <SocketBridge />
            {children}
          </AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "var(--font-sans)",
                borderRadius: "8px",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
