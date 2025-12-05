"use client"

import React, { useEffect } from "react"
import { X } from "lucide-react"
import { CookingVideo } from "@/lib/youtube"

interface VideoPlayerProps {
  video: CookingVideo | null
  isOpen: boolean
  onClose: () => void
}

export function VideoPlayer({ video, isOpen, onClose }: VideoPlayerProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "auto"
    }
  }, [isOpen, onClose])

  if (!isOpen || !video) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-zinc-900 rounded-xl overflow-hidden shadow-2xl">
        {/* Video Container */}
        <div className="relative w-full bg-black" style={{ aspectRatio: "16/9" }}>
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&modestbranding=1`}
            allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        {/* Metadata */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">{video.title}</h2>
              <p className="text-red-500 font-semibold">{video.channelTitle}</p>
              <p className="text-zinc-400 text-sm mt-1">
                {new Date(video.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-zinc-400 hover:text-white transition-colors p-2 -m-2"
            >
              <X size={24} />
            </button>
          </div>

          {/* Description */}
          <div>
            <p className="text-zinc-300 text-sm line-clamp-3">{video.description}</p>
          </div>

          {/* Watch on YouTube Button */}
          <div className="pt-2">
            <a
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Watch on YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
