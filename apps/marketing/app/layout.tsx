import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vertex — Workplace Collaboration for Engineering Teams",
  description:
    "The workplace platform your engineering team actually wants to use. GitHub-native, AI-powered, beautifully designed.",
  openGraph: {
    title: "Vertex",
    description: "Workplace collaboration for engineering teams",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
