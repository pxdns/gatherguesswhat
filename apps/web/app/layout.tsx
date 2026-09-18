import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "pxdns — projects",
  description: "Vertex, CS Offline, and more — open source projects by pxdns.",
  icons: {
    icon: "/favicon.ico",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="vertex-bg" aria-hidden>
          <video autoPlay muted loop playsInline>
            <source src="/glass.mp4" type="video/mp4" />
          </video>
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
