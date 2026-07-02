import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "YieldGuard — DeFi Yield Optimization",
  description: "Automated treasury management and yield optimization across DeFi protocols",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
