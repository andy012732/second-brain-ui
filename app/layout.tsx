import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "德谷拉指揮中心 (Mission Control)",
  description: "Next-gen strategic AI dashboard for absolute command.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#030303] text-gray-400 overflow-hidden h-screen flex flex-col`}
      >
        {/* 🟢 全域導航欄鎖定 */}
        <Navbar />
        
        {/* 主要內容區 */}
        <main className="flex-1 overflow-hidden relative">
            {children}
        </main>
      </body>
    </html>
  );
}
