import "./globals.css";

import { Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";

import type { Metadata } from "next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlayOff - Игровой клуб PlayStation",
  description: "CRM и онлайн-бронирование игрового клуба PlayStation",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
      <html
        lang="ru"
        suppressHydrationWarning
        className={`${inter.variable} ${geistMono.variable} dark h-full antialiased`}
      >
      <body className="min-h-full flex flex-col">
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
