import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import PWA from "@/components/PWA";
import MobileNav from "@/components/MobileNav";
import WelcomeModal from "@/components/WelcomeModal";

// Display: a heavy modern serif with quirky character.
const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-display",
});

// Body: a clean geometric grotesque, so the serif headlines stay the loud part.
const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-sans-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vrsfd.com"),
  title: "Verse — Every VA opportunity. One place.",
  description:
    "Learn the work, price it properly, and find real remote jobs. Built for Filipino virtual assistants.",
  applicationName: "Verse",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Verse",
    // "default" keeps the iOS status bar legible on our light paper background.
    // "black-translucent" would slide content under the clock.
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Verse — Every VA opportunity. One place.",
    description:
      "Learn the work, price it properly, and find real remote jobs. Built for Filipino virtual assistants.",
    siteName: "Verse",
    type: "website",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Installed apps should fill the notch area rather than letterbox.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#f7f6f4" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <MobileNav />
          <WelcomeModal />
          <PWA />
        </AuthProvider>
      </body>
    </html>
  );
}
