import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lotique | Luxury Watch & Jewelry Auctions",
  description: "The premier destination for luxury watches and fine jewelry auctions. Authenticated items, secure bidding, worldwide shipping.",
  keywords: ["luxury watches", "jewelry auctions", "fine jewelry", "watch auctions", "Rolex", "Patek Philippe", "luxury collectibles"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[var(--color-bg-primary)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
