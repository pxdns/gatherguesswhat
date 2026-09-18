"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#111118",
      color: "#fff",
      fontFamily: "'Courier New', 'Consolas', monospace",
      overflow: "hidden auto",
    }}>
      {/* top bar */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 32px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.9 }}>
            <path fill="#4a9eff" d="M23 5H11L4 12v8l7 7h12v-5H13l-4-4v-4l4-4h10Z M20 12l7 4-7 4v-2h-6v-4h6Z" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "#4a9eff" }}>pxdns</span>
        </div>
        <nav style={{ display: "flex", gap: 24, fontSize: 11, letterSpacing: 2, opacity: 0.6 }}>
          <a href="#projects" style={{ color: "inherit", textDecoration: "none", textTransform: "uppercase" }}>Projects</a>
          <a href="https://github.com/pxdns" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none", textTransform: "uppercase" }}>GitHub</a>
        </nav>
      </header>

      {/* hero */}
      <section style={{
        padding: "100px 32px 80px",
        maxWidth: 900,
        margin: "0 auto",
      }}>
        <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.4, marginBottom: 20, textTransform: "uppercase" }}>
          &gt; portfolio_v2.0 — all systems operational
        </div>
        <h1 style={{
          fontSize: "clamp(36px, 6vw, 72px)",
          fontWeight: 300,
          letterSpacing: 4,
          lineHeight: 1.1,
          marginBottom: 20,
        }}>
          PXDNS
        </h1>
        <p style={{ fontSize: 14, opacity: 0.5, maxWidth: 480, lineHeight: 1.7, letterSpacing: 0.5 }}>
          Building things that work. Desktop apps, web platforms, games.
          Open source where possible.
        </p>

        <div style={{ marginTop: 40, display: "flex", gap: 12 }}>
          <a
            href="#projects"
            style={{
              background: "#4a9eff",
              color: "#000",
              padding: "10px 24px",
              fontSize: 11,
              letterSpacing: 2,
              textDecoration: "none",
              fontWeight: 700,
              textTransform: "uppercase",
              borderRadius: 3,
            }}
          >
            View Projects →
          </a>
          <a
            href="https://github.com/pxdns"
            target="_blank"
            rel="noreferrer"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "10px 24px",
              fontSize: 11,
              letterSpacing: 2,
              textDecoration: "none",
              textTransform: "uppercase",
              borderRadius: 3,
            }}
          >
            GitHub
          </a>
        </div>
      </section>

      {/* divider */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", maxWidth: 900, margin: "0 auto" }} />

      {/* projects */}
      <section id="projects" style={{ padding: "80px 32px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.4, marginBottom: 40, textTransform: "uppercase" }}>
          &gt; projects/
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>

          {/* Vertex */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 6,
            padding: 28,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(74,158,255,0.4)";
              (e.currentTarget as HTMLDivElement).style.background = "rgba(74,158,255,0.05)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.09)";
              (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, flexShrink: 0,
              }}>⚡</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>Vertex</div>
                <div style={{
                  display: "inline-block", fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
                  background: "rgba(99,102,241,0.2)", color: "#818cf8",
                  padding: "2px 7px", borderRadius: 3, marginTop: 3,
                }}>Web App</div>
              </div>
            </div>
            <p style={{ fontSize: 12, opacity: 0.6, lineHeight: 1.7, marginBottom: 16, fontFamily: "sans-serif" }}>
              Workspace collaboration platform — real-time messaging, GitHub integration,
              task boards, roadmaps, and Claude AI with extended thinking.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, marginBottom: 16 }}>
              {["Next.js 14", "TypeScript", "Tailwind", "Prisma", "Supabase", "Claude AI"].map(t => (
                <span key={t} style={{
                  fontSize: 9, letterSpacing: 0.5,
                  background: "rgba(255,255,255,0.07)",
                  padding: "3px 7px", borderRadius: 3,
                }}>{t}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <a href="https://github.com/pxdns/gatherguesswhat" target="_blank" rel="noreferrer"
                style={{ fontSize: 10, color: "#4a9eff", textDecoration: "none", letterSpacing: 1 }}>
                GitHub →
              </a>
              <Link href="/signin"
                style={{ fontSize: 10, color: "#4a9eff", textDecoration: "none", letterSpacing: 1 }}>
                Launch App →
              </Link>
            </div>
          </div>

          {/* CS Offline */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 6,
            padding: 28,
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,100,0,0.4)";
              (e.currentTarget as HTMLDivElement).style.background = "rgba(255,100,0,0.04)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.09)";
              (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: "linear-gradient(135deg, #ff6400, #ff8c00)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, flexShrink: 0,
              }}>🎯</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>CS Offline</div>
                <div style={{
                  display: "inline-block", fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
                  background: "rgba(255,100,0,0.2)", color: "#ff8c00",
                  padding: "2px 7px", borderRadius: 3, marginTop: 3,
                }}>Desktop App</div>
              </div>
            </div>
            <p style={{ fontSize: 12, opacity: 0.6, lineHeight: 1.7, marginBottom: 16, fontFamily: "sans-serif" }}>
              Offline Counter-Strike practice arena with bot AI, realistic weapon physics
              (AK-47, AWP, Desert Eagle), and multiple game modes. No internet needed.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, marginBottom: 16 }}>
              {["Tauri v1", "Three.js", "TypeScript", "Vite", "Rust"].map(t => (
                <span key={t} style={{
                  fontSize: 9, letterSpacing: 0.5,
                  background: "rgba(255,255,255,0.07)",
                  padding: "3px 7px", borderRadius: 3,
                }}>{t}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <a href="https://github.com/pxdns/gatherguesswhat/tree/csgo-offline" target="_blank" rel="noreferrer"
                style={{ fontSize: 10, color: "#ff8c00", textDecoration: "none", letterSpacing: 1 }}>
                GitHub →
              </a>
              <a href="https://github.com/pxdns/gatherguesswhat/releases" target="_blank" rel="noreferrer"
                style={{ fontSize: 10, color: "#ff8c00", textDecoration: "none", letterSpacing: 1 }}>
                Download →
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 10,
        opacity: 0.35,
        letterSpacing: 1,
        maxWidth: 900,
        margin: "0 auto",
      }}>
        <span>pxdns · {new Date().getFullYear()}</span>
        <span>all systems operational</span>
      </footer>
    </main>
  );
}
