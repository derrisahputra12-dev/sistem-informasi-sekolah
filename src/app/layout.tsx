import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "SIS - Sistem Informasi Sekolah",
  description: "Digitalisasi Ekosistem Sekolah Indonesia yang cepat, andal, dan adaptif",
  keywords: ["sistem informasi sekolah", "SIS", "sekolah", "pendidikan", "PPDB", "e-raport"],
};

import { Suspense } from "react";
import ProgressBar from "@/components/ProgressBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
