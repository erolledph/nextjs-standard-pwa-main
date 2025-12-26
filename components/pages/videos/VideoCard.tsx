"use client"

import React, { useState, useEffect, useRef } from "react"
import { Maximize2, RotateCcw } from "lucide-react"
import { useVideoPlayer } from "@/contexts/VideoPlayerContext"
import { CookingVideo } from "@/lib/youtube"
import { videoSchema } from "@/lib/seo"

interface VideoCardProps {
  video: CookingVideo
}

export function VideoCard({ video }: VideoCardProps) {
  const { playingVideoId, setPlayingVideoId } = useVideoPlayer()
  const isPlaying = playingVideoId === video.videoId
  const [isBuffering, setIsBuffering] = useState(true)
  const [isEnded, setIsEnded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Add video schema on mount
  useEffect(() => {
    const schema = videoSchema({
      title: video.title,
      description: video.title,
      thumbnailUrl: video.thumbnailUrl,
      uploadDate: video.publishedAt || new Date().toISOString(),
      videoId: video.videoId,
      contentUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
    })

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schema)
    script.id = `video-schema-${video.videoId}`
    document.head.appendChild(script)

    return () => {
      const element = document.getElementById(`video-schema-${video.videoId}`)
      if (element) {
        document.head.removeChild(element)
      }
    }
  }, [video])

  useEffect(() => {
    if (isPlaying) {
      // Show spinner for 2 seconds when video starts, then hide it
      const timer = setTimeout(() => setIsBuffering(false), 2000)
      return () => clearTimeout(timer)
    } else {
      setIsBuffering(true)
      setIsEnded(false)
    }
  }, [isPlaying])

  const handleClick = () => {
    setPlayingVideoId(video.videoId)
    setIsBuffering(true)
    setIsEnded(false)
  }

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Create a new src with a timestamp to force reload
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src
      // Add/update timestamp parameter to force a fresh load
      const separator = currentSrc.includes('?') ? '&' : '?'
      const timestamp = Date.now()
      iframeRef.current.src = `${currentSrc}${separator}t=${timestamp}`
    }
    setIsEnded(false)
    setIsBuffering(true)
  }

  const handleStop = () => {
    setPlayingVideoId(null)
    setIsBuffering(true)
    setIsEnded(false)
  }

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation()
    const container = document.querySelector(".youtube-container-hidden-details") as HTMLElement
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        container.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
      }
    }
  }

  return (
    <div className="group rounded-lg overflow-hidden border border-shadow-gray hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-background hover:bg-muted/50 flex flex-col h-full">
      {/* Video Container */}
      <div className="relative w-full h-48 md:h-56 overflow-hidden bg-muted">
        {!isPlaying ? (
          <>
            {/* Thumbnail */}
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />

            {/* Play Button Overlay */}
            <div
              onClick={handleClick}
              className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white fill-white"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          <div className="relative w-full h-full">
            <div className="youtube-container-hidden-details">
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&controls=0&modestbranding=1&playsinline=1&rel=0&fs=0&iv_load_policy=3&disablekb=1&end=0&start=0&enablejsapi=1`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-full"
                style={{ pointerEvents: 'none' }}
              />
            </div>

            {/* Custom Loading Spinner - Hides YouTube UI during buffering */}
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-50">
                <div className="flex flex-col items-center gap-4">
                  {/* Spinner Animation */}
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-transparent border-t-red-600 border-r-red-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-transparent border-b-orange-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                  <p className="text-white text-sm font-medium">Loading...</p>
                </div>
              </div>
            )}

            {/* Video Ended Overlay - Show Replay Button */}
            {/* Only show when video has ended AND loading is complete */}
            {isEnded && !isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-40">
                <button
                  onClick={handleReplay}
                  className="flex flex-col items-center gap-3 p-6 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all hover:scale-110 active:scale-95 shadow-lg"
                  title="Replay Video"
                >
                  <RotateCcw className="w-8 h-8" />
                  <span className="text-sm font-semibold">Replay</span>
                </button>
              </div>
            )}

            {/* Control Buttons */}
            <div className="absolute top-2 right-2 flex gap-2" style={{ pointerEvents: 'auto' }}>
              {/* Fullscreen Button */}
              <button
                onClick={handleFullscreen}
                title="Open in Fullscreen"
                className="p-2 bg-zinc-900/80 hover:bg-zinc-900 text-white rounded-lg transition-colors backdrop-blur-sm"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Stop Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleStop()
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
              >
                Stop
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content - Title */}
      <div className="flex-1 p-4 md:p-5 flex flex-col">
        <h3 className="font-bold text-sm md:text-base line-clamp-2 text-foreground dark:text-white group-hover:text-primary transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
          {video.title}
        </h3>
      </div>
    </div>
  )
}
