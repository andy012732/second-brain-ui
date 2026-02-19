import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "德谷拉指揮中心 (Mission Control)",
  description: "Next-gen strategic AI dashboard for absolute command.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-TW" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col overflow-hidden`}
        style={{ background: '#020409', color: '#c8e6f5' }}
      >
        <Navbar />
        <main className="flex-1 overflow-hidden relative" style={{ zIndex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
