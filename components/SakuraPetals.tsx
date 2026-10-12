"use client"
import { useEffect, useState } from "react"

const petals = [
  { emoji: "🌸", size: 16, left: "5%", delay: "0s", duration: 12, sway: "sakuraSway 3s ease-in-out infinite" },
  { emoji: "🌸", size: 12, left: "15%", delay: "3s", duration: 14, sway: "sakuraSway 4s ease-in-out infinite" },
  { emoji: "🌸", size: 14, left: "25%", delay: "1s", duration: 15, sway: "sakuraSway 3.5s ease-in-out infinite" },
  { emoji: "🌸", size: 10, left: "40%", delay: "5s", duration: 13, sway: "sakuraSway 2.5s ease-in-out infinite" },
  { emoji: "🌸", size: 18, left: "50%", delay: "7s", duration: 16, sway: "sakuraSway 4.5s ease-in-out infinite" },
  { emoji: "🌸", size: 11, left: "60%", delay: "2s", duration: 11, sway: "sakuraSway 3s ease-in-out infinite" },
  { emoji: "🌸", size: 15, left: "72%", delay: "4s", duration: 14, sway: "sakuraSway 3.2s ease-in-out infinite" },
  { emoji: "🌸", size: 13, left: "82%", delay: "6s", duration: 12, sway: "sakuraSway 4s ease-in-out infinite" },
  { emoji: "🌸", size: 9, left: "90%", delay: "8s", duration: 15, sway: "sakuraSway 2.8s ease-in-out infinite" },
  { emoji: "🌸", size: 17, left: "35%", delay: "9s", duration: 13, sway: "sakuraSway 3.6s ease-in-out infinite" },
]

export function SakuraPetals() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {petals.map((p, i) => (
        <div
          key={i}
          className="sakura-petal"
          style={{
            left: p.left,
            top: "-5%",
            fontSize: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: p.delay,
            animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          <div style={{ animation: p.sway }}>{p.emoji}</div>
        </div>
      ))}
    </div>
  )
}
