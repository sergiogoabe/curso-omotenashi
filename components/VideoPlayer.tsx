"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { getSubtitles, type SubtitleEntry } from "@/data/subtitles"
import { Subtitles, X } from "lucide-react"

interface VideoPlayerProps {
  videoUrl: string
  lessonSlug: string
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        config: {
          height?: string
          width?: string
          videoId: string
          playerVars?: Record<string, string>
          events?: {
            onReady?: (event: { target: YouTubePlayer }) => void
            onStateChange?: (event: { data: number }) => void
          }
        }
      ) => YouTubePlayer
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

interface YouTubePlayer {
  getCurrentTime: () => number
  pauseVideo: () => void
  playVideo: () => void
  destroy: () => void
}

function extractVideoId(url: string): string {
  const match = url.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  return match ? match[1] : ""
}

export function VideoPlayer({ videoUrl, lessonSlug }: VideoPlayerProps) {
  const [showSubtitles, setShowSubtitles] = useState(true)
  const [currentSubtitle, setCurrentSubtitle] = useState("")
  const [subtitlesReady, setSubtitlesReady] = useState(false)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const playerId = useRef(`yt-${Math.random().toString(36).slice(2, 9)}`).current
  const rafRef = useRef<number>(0)
  const subtitles = getSubtitles(lessonSlug)

  useEffect(() => {
    setSubtitlesReady(subtitles.length > 0)
  }, [subtitles])

  const sync = useCallback(() => {
    const p = playerRef.current
    if (!p || !showSubtitles) return
    try {
      const t = p.getCurrentTime()
      const active = subtitles.find((s) => t >= s.start && t < s.end)
      setCurrentSubtitle(active ? active.text : "")
    } catch {
      setCurrentSubtitle("")
    }
    rafRef.current = requestAnimationFrame(sync)
  }, [showSubtitles, subtitles])

  useEffect(() => {
    if (!subtitlesReady || !playerRef.current) return
    if (showSubtitles) {
      rafRef.current = requestAnimationFrame(sync)
    } else {
      cancelAnimationFrame(rafRef.current)
      setCurrentSubtitle("")
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [showSubtitles, subtitlesReady, sync])

  useEffect(() => {
    const videoId = extractVideoId(videoUrl)
    if (!videoId) return

    const container = containerRef.current
    if (!container) return

    const div = document.createElement("div")
    div.id = playerId
    container.appendChild(div)

    function init() {
      if (!window.YT?.Player) {
        setTimeout(init, 200)
        return
      }
      playerRef.current = new window.YT.Player(playerId, {
        height: "100%",
        width: "100%",
        videoId,
        playerVars: { rel: "0", modestbranding: "1" },
        events: {
          onReady() {
            if (showSubtitles) rafRef.current = requestAnimationFrame(sync)
          },
        },
      })
    }

    if (!window.YT) {
      const s = document.createElement("script")
      s.src = "https://www.youtube.com/iframe_api"
      document.head.appendChild(s)
      window.onYouTubeIframeAPIReady = init
    } else {
      init()
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      playerRef.current?.destroy()
      playerRef.current = null
      document.getElementById(playerId)?.remove()
    }
  }, [videoUrl, playerId, showSubtitles, sync, subtitlesReady])

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="aspect-video rounded-xl overflow-hidden border border-border/50 mb-8"
      />

      {subtitlesReady && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setShowSubtitles(!showSubtitles)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border/50 bg-card/50 hover:bg-secondary transition-colors"
          >
            {showSubtitles ? (
              <Subtitles className="h-3.5 w-3.5 text-red-400" />
            ) : (
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={showSubtitles ? "text-red-400" : "text-muted-foreground"}>
              Legendas em Português
            </span>
          </button>
        </div>
      )}

      {showSubtitles && currentSubtitle && (
        <div className="absolute bottom-4 left-0 right-0 px-4 pointer-events-none">
          <div className="mx-auto max-w-2xl bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
            <p className="text-sm md:text-base text-white leading-relaxed">
              {currentSubtitle}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
