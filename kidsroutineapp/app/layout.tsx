import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kids Routine App",
  description: "Help your kids stay organized with daily routines, tasks, and family calendar. Track progress and celebrate achievements together!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* Botpress Webchat FAB */}
        <Script src="https://cdn.botpress.cloud/webchat/v3.5/inject.js" strategy="afterInteractive" />
        <Script src="https://files.bpcontent.cloud/2025/12/23/00/20251223003346-T9CQDI7E.js" strategy="afterInteractive" defer />
      </body>
    </html>
  );
}
