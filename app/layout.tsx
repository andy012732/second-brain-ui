import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "德谷拉指揮中心 (Mission Control)",
  description: "Next-gen strategic dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body style={{
        background: '#010208',
        color: '#e4f4ff',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // body keeps hidden
        margin: 0,
        padding: 0,
      }}>
        <Navbar />
        <main style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1, minHeight: 0 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
