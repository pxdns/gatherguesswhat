import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Vertex — Where Teams Build",
  description: "The workplace collaboration platform for modern engineering teams. GitHub integration, real-time chat, tasks, roadmaps, and AI — all in one place.",
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
