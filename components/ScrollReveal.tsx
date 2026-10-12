"use client"
import { useEffect, useRef, ReactNode } from "react"

interface Props {
  children: ReactNode
  className?: string
  delay?: number
  type?: "fade" | "scale"
}

export function ScrollReveal({ children, className = "", delay = 0, type = "fade" }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("visible"), delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  const baseClass = type === "scale" ? "reveal-scale" : "reveal"

  return (
    <div ref={ref} className={`${baseClass} ${className}`}>
      {children}
    </div>
  )
}
