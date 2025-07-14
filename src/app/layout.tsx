import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIUX - AI-Powered Website Analysis",
  description: "Get comprehensive UX insights and recommendations for your website with AI-powered analysis. Analyze accessibility, performance, usability, and design with advanced AI technology.",
  keywords: ["AI", "UX", "website analysis", "accessibility", "performance", "usability", "design", "web development"],
  authors: [{ name: "AIUX Team" }],
  creator: "AIUX",
  publisher: "AIUX",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://aiux.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "AIUX - AI-Powered Website Analysis",
    description: "Get comprehensive UX insights and recommendations for your website with AI-powered analysis.",
    url: 'https://aiux.com',
    siteName: 'AIUX',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'AIUX - AI-Powered Website Analysis',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "AIUX - AI-Powered Website Analysis",
    description: "Get comprehensive UX insights and recommendations for your website with AI-powered analysis.",
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full`}
      >
        {children}
      </body>
    </html>
  );
}
