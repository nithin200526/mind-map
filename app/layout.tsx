import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareerMap.AI - Smart Roadmap Builder",
  description: "Generate your personalized learning path instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.className} antialiased selection:bg-[#D4AF37]/30 text-slate-800`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
