import { ImageResponse } from "next/og"

export const alt = "Omotenashi em Divinópolis — Workshop Gratuito de Atendimento"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a0a 30%, #0f0a05 60%, #0a0a0f 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Red glow top-right */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, #dc2626 0%, transparent 70%)",
            opacity: "0.12",
          }}
        />

        {/* Amber glow bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)",
            opacity: "0.08",
          }}
        />

        {/* Torii gate motif */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 50,
            fontSize: 80,
            opacity: 0.15,
            transform: "rotate(-5deg)",
          }}
        >
          ⛩️
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            zIndex: 1,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              borderRadius: 50,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#0a0a0f",
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 20,
              letterSpacing: "0.5px",
            }}
          >
            🗺️ EXCLUSIVO DIVINÓPOLIS E REGIÃO
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "white",
              textAlign: "center",
              lineHeight: 1.1,
              letterSpacing: "-1px",
              marginBottom: 8,
            }}
          >
            Omotenashi
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              background: "linear-gradient(135deg, #ef4444, #f59e0b)",
              backgroundClip: "text",
              color: "transparent",
              textAlign: "center",
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            em Divinópolis
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 26,
              color: "#a0a0a0",
              textAlign: "center",
              maxWidth: 700,
              lineHeight: 1.4,
              marginBottom: 24,
              fontWeight: 400,
            }}
          >
            Workshop gratuito • Sua empresa • 1 hora
          </div>

          {/* CTA row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "12px 28px",
              borderRadius: 12,
              background: "#141418",
              border: "1px solid #222228",
            }}
          >
            <span style={{ fontSize: 28 }}>📱</span>
            <span style={{ fontSize: 28, color: "#22c55e", fontWeight: 700 }}>
              (37) 98418-9874
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 16,
            color: "#666",
          }}
        >
          <span>⛩️</span>
          <span>curso-omotenashi.vercel.app/divinopolis</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
