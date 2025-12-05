"use client"

import React, { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX, Maximize2, X, Play, Pause } from "lucide-react"
import { CookingVideo } from "@/lib/youtube"
import type { YTPlayer } from "@/lib/youtube-player-types"

interface VideoCardProps {
  video: CookingVideo
  isPlaying: boolean
  onPlay: (video: CookingVideo) => void
  onStop: () => void
}

// YouTube Player State constants
const YT_PLAYER_STATES = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
}

export function VideoCard({ video, isPlaying, onPlay, onStop }: VideoCardProps) {
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [playerReady, setPlayerReady] = useState(false)
  const [playerState, setPlayerState] = useState(YT_PLAYER_STATES.UNSTARTED)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Load YouTube IFrame API
  useEffect(() => {
    if (!isPlaying) return

    const loadYouTubeAPI = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        onYouTubeIframeAPIReady()
        return
      }

      if ((window as any).youtubeAPILoading) return

      ;(window as any).youtubeAPILoading = true
      ;(window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady

      const script = document.createElement("script")
      script.src = "https://www.youtube.com/iframe_api"
      document.body.appendChild(script)
    }

    loadYouTubeAPI()
  }, [isPlaying])

  // Initialize player when API is ready
  useEffect(() => {
    if (!isPlaying || !playerReady || !playerContainerRef.current) return

    if (playerRef.current) {
      playerRef.current.destroy()
    }

    setIsLoading(true)

    const createPlayer = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        playerRef.current = new (window as any).YT.Player(playerContainerRef.current, {
          videoId: video.videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            enablejsapi: 1,
            fs: 1,
            playsinline: 1,
          },
          events: {
            onReady: handlePlayerReady,
            onStateChange: handleStateChange,
            onError: handlePlayerError,
          },
        })
      }
    }

    // Small delay to ensure container is mounted
    const timer = setTimeout(createPlayer, 100)
    return () => clearTimeout(timer)
  }, [isPlaying, playerReady, video.videoId])

  const onYouTubeIframeAPIReady = () => {
    setPlayerReady(true)
  }

  const handlePlayerReady = () => {
    setIsLoading(false)
    if (playerRef.current) {
      playerRef.current.playVideo()
    }
  }

  const handleStateChange = (event: any) => {
    const state = event.data
    setPlayerState(state)

    // Auto-hide controls when playing
    if (state === YT_PLAYER_STATES.PLAYING) {
      setShowControls(true)
      scheduleControlsHide()
    } else {
      setShowControls(true)
    }
  }

  const handlePlayerError = (event: any) => {
    console.error("YouTube Player Error:", event.data)
    setIsLoading(false)
  }

  const scheduleControlsHide = () => {
    if (mouseTimeoutRef.current) {
      clearTimeout(mouseTimeoutRef.current)
    }

    mouseTimeoutRef.current = setTimeout(() => {
      if (playerRef.current && playerRef.current.getPlayerState() === YT_PLAYER_STATES.PLAYING) {
        setShowControls(false)
      }
    }, 3000)
  }

  const handleMouseMove = () => {
    setShowControls(true)
    scheduleControlsHide()
  }

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!playerRef.current) return

    if (playerState === YT_PLAYER_STATES.PLAYING) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!playerRef.current) return

    if (isMuted) {
      playerRef.current.unMute()
      setIsMuted(false)
    } else {
      playerRef.current.mute()
      setIsMuted(true)
    }
  }

  const handleFullscreen = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (playerRef.current && playerRef.current.getIframe) {
      const iframe = playerRef.current.getIframe()
      try {
        if (iframe.requestFullscreen) {
          await iframe.requestFullscreen()
        } else if ((iframe as any).webkitRequestFullscreen) {
          await (iframe as any).webkitRequestFullscreen()
        } else if ((iframe as any).msRequestFullscreen) {
          await (iframe as any).msRequestFullscreen()
        }
      } catch (error) {
        console.error("Error requesting fullscreen:", error)
      }
    }
  }

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }
    setPlayerReady(false)
    setPlayerState(YT_PLAYER_STATES.UNSTARTED)
    onStop()
  }

  return (
    <div className="rounded-xl overflow-hidden bg-white dark:bg-zinc-800 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
      <div className="relative w-full h-48 overflow-hidden bg-black">
        {!isPlaying ? (
          <>
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
            <button
              onClick={(e) => {
                e.preventDefault()
                onPlay(video)
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center shadow-2xl hover:shadow-red-600/50 animate-pulse hover:animate-none">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
            </button>
          </>
        ) : (
          <div className="relative w-full h-full" onMouseMove={handleMouseMove}>
            {/* YouTube Player Container - overflow hidden to hide YouTube info immediately */}
            <div className="w-full h-full overflow-hidden" style={{ overflow: 'hidden' }}>
              <div
                ref={playerContainerRef}
                className="w-full h-full overflow-hidden"
                id={`video-player-${video.videoId}`}
                style={{ overflow: 'hidden' }}
              />
            </div>

            {/* Loading Spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
              </div>
            )}

            {/* Custom Controls Overlay */}
            <div
              className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex-1" />
                <button
                  onClick={handleStop}
                  className="text-white hover:text-red-500 transition-colors p-2 hover:bg-black/40 rounded"
                  title="Close"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Center Play Button */}
              <div className="flex items-center justify-center flex-1">
                {playerState !== YT_PLAYER_STATES.PLAYING && !isLoading && (
                  <button
                    onClick={togglePlayPause}
                    className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-2xl hover:shadow-red-600/50 transform hover:scale-110 transition-all"
                    title={playerState === YT_PLAYER_STATES.PLAYING ? "Pause" : "Play"}
                  >
                    {playerState === YT_PLAYER_STATES.PLAYING ? (
                      <Pause className="w-8 h-8 text-white fill-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    )}
                  </button>
                )}
              </div>

              {/* Bottom Controls Bar */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-t from-black/80 to-transparent">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-red-500 transition-colors p-2 hover:bg-black/40 rounded"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX size={22} />
                  ) : (
                    <Volume2 size={22} />
                  )}
                </button>

                <div className="flex-1" />

                <button
                  onClick={handleFullscreen}
                  className="text-white hover:text-red-500 transition-colors p-2 hover:bg-black/40 rounded"
                  title="Fullscreen"
                >
                  <Maximize2 size={22} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-4">
        <h3 className="font-bold text-sm line-clamp-2 text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
          {video.title}
        </h3>
      </div>
    </div>
  )
}
