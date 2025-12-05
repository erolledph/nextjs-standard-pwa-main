"use client"

import React, { useEffect } from "react"
import { X } from "lucide-react"
import { useVideoPlayer } from "@/contexts/VideoPlayerContext"
import { CookingVideo } from "@/lib/youtube"

interface VideoPlayerModalProps {
  video: CookingVideo | null
}

export function VideoPlayerModal({ video }: VideoPlayerModalProps) {
  const { playingVideoId } = useVideoPlayer()

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Handled by context
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  if (!video || playingVideoId !== video.videoId) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none">
      {/* Modal shows inline player in cards, this is for full details if needed */}
    </div>
  )
}
