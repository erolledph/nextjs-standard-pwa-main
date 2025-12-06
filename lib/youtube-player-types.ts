/**
 * YouTube IFrame Player API Type Definitions
 * Provides TypeScript support for the YouTube IFrame Player API
 */

export interface YTPlayerOptions {
  videoId: string
  width?: string | number
  height?: string | number
  playerVars?: YTPlayerVars
  events?: YTPlayerEvents
}

export interface YTPlayerVars {
  autoplay?: 0 | 1
  controls?: 0 | 1 | 2
  modestbranding?: 0 | 1
  rel?: 0 | 1
  showinfo?: 0 | 1
  enablejsapi?: 0 | 1
  fs?: 0 | 1
  playsinline?: 0 | 1
  start?: number
  end?: number
  list?: string
  playlist?: string
  loop?: 0 | 1
  origin?: string
}

export interface YTPlayerEvents {
  onReady?: (event: YTPlayerEvent) => void
  onStateChange?: (event: YTPlayerStateChangeEvent) => void
  onPlaybackRateChange?: (event: YTPlayerEvent) => void
  onPlaybackQualityChange?: (event: YTPlayerEvent) => void
  onError?: (event: YTPlayerErrorEvent) => void
  onCued?: (event: YTPlayerEvent) => void
}

export interface YTPlayerEvent {
  target: YTPlayer
}

export interface YTPlayerStateChangeEvent extends YTPlayerEvent {
  data: YTPlayerState
}

export interface YTPlayerErrorEvent extends YTPlayerEvent {
  data: YTPlayerErrorCode
}

export enum YTPlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  VIDEO_CUED = 5,
}

export enum YTPlayerErrorCode {
  INVALID_PARAM = 2,
  HTML5_PLAYER_ERROR = 5,
  VIDEO_NOT_FOUND = 100,
  VIDEO_NOT_ALLOWED = 101,
  VIDEO_NOT_ALLOWED_EMBEDDED = 150,
}

export interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  stopVideo(): void
  seekTo(seconds: number, allowSeekAhead?: boolean): void
  clearVideo(): void
  getVideoData(): any
  getPlaylist(): string[]
  getPlaylistIndex(): number
  mute(): void
  unMute(): void
  isMuted(): boolean
  setVolume(volume: number): void
  getVolume(): number
  setSize(width: number, height: number): void
  getPlaybackRate(): number
  getAvailablePlaybackRates(): number[]
  setPlaybackRate(suggestedRate: number): void
  getVideoEmbedCode(): string
  getPlaylist(): string[]
  getVideoUrl(): string
  getVideoEmbedCode(): string
  getPlaylistId(): string
  getPlayerState(): YTPlayerState
  getCurrentTime(): number
  getDuration(): number
  getVideoUrl(): string
  getVideoEmbedCode(): string
  getPlayList(): string[]
  getPlayListIndex(): number
  getVideoLoadedFraction(): number
  getPlayerState(): number
  getPlaybackQuality(): string
  getAvailableQualityLevels(): string[]
  setPlaybackQuality(suggestedQuality: string): void
  getIframe(): HTMLIFrameElement
  destroy(): void
}

export interface YTPlayerConstructor {
  new (element: string | HTMLElement, options: YTPlayerOptions): YTPlayer
}

declare global {
  interface Window {
    YT: {
      Player: YTPlayerConstructor
      PlayerState: typeof YTPlayerState
      loaded?: number
    }
    onYouTubeIframeAPIReady?: () => void
    youtubeAPILoading?: boolean
  }
}
