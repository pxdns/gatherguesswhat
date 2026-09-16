import type { Metadata } from "next";
import { brand } from "@nexa/branding";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: brand.name,
  description: brand.tagline,
  openGraph: {
    title: brand.name,
    description: brand.tagline,
    url: brand.website,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-950 dark:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
