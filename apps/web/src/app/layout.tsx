import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import ClientLayout from "./client-layout";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "YieldGuard — DeFi Yield Optimization",
  description:
    "On-chain vaults that allocate capital across Aave and Morpho. Real-time risk, automated rebalancing, and transparent yield on X Layer.",
  icons: [{ rel: "icon", url: "/logo-icon.jpg", type: "image/jpeg" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable} ${spaceGrotesk.variable}`}
    >
      <body className="antialiased font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
