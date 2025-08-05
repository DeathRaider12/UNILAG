"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Subtitles,
  Download,
  Wifi,
  WifiOff,
  CheckCircle,
  X,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useOfflineVideo } from "@/hooks/use-offline-video"

interface VideoPlayerProps {
  src: string
  title: string
  lessonId: string
  courseId: string
  onComplete?: () => void
  onProgress?: (progress: number) => void
}

export function VideoPlayer({ src, title, lessonId, courseId, onComplete, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [quality, setQuality] = useState("Auto")
  const [showSubtitles, setShowSubtitles] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showDownloadAlert, setShowDownloadAlert] = useState(false)

  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  const {
    downloadVideo,
    deleteVideo,
    isDownloaded,
    isDownloading,
    downloadProgress,
    getOfflineVideoUrl,
    getStorageInfo,
  } = useOfflineVideo()

  const videoKey = `${courseId}-${lessonId}`
  const downloaded = isDownloaded(videoKey)
  const downloading = isDownloading(videoKey)
  const progress = downloadProgress[videoKey] || 0

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Use offline video if available and online video is not accessible
    const videoSrc = downloaded ? getOfflineVideoUrl(videoKey) : src

    if (video.src !== videoSrc) {
      video.src = videoSrc
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      const progress = (video.currentTime / video.duration) * 100
      onProgress?.(progress)

      if (progress >= 95 && onComplete) {
        onComplete()
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onComplete?.()
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handleCanPlay = () => {
      setIsBuffering(false)
    }

    const handleError = () => {
      if (!isOnline && !downloaded) {
        setShowDownloadAlert(true)
      }
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("ended", handleEnded)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("error", handleError)

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("ended", handleEnded)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("error", handleError)
    }
  }, [src, downloaded, videoKey, getOfflineVideoUrl, onComplete, onProgress, isOnline])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (value[0] / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0] / 100
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (isFullscreen) {
      document.exitFullscreen()
    } else {
      container.requestFullscreen()
    }
  }

  const skipTime = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
  }

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = rate
    setPlaybackRate(rate)
  }

  const handleDownload = async () => {
    if (downloaded) {
      await deleteVideo(videoKey)
    } else {
      await downloadVideo(videoKey, src, title)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Offline Alert */}
      {showDownloadAlert && !isOnline && !downloaded && (
        <Alert className="border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You're offline and this video isn't downloaded. Connect to the internet or download videos for offline
            viewing.
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-auto p-0 text-orange-600 hover:text-orange-800"
              onClick={() => setShowDownloadAlert(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Download Progress */}
      {downloading && (
        <Alert className="border-blue-200 bg-blue-50">
          <Download className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <span>Downloading video for offline viewing...</span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mt-2 h-2" />
          </AlertDescription>
        </Alert>
      )}

      {/* Video Player */}
      <div
        ref={containerRef}
        className={`relative bg-black group ${isFullscreen ? "w-screen h-screen" : "aspect-video"}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <video ref={videoRef} className="w-full h-full object-contain" onClick={togglePlay} crossOrigin="anonymous" />

        {/* Offline Indicator */}
        {!isOnline && (
          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
            <WifiOff className="h-4 w-4 text-white" />
            <span className="text-white text-sm">Offline</span>
          </div>
        )}

        {/* Downloaded Indicator */}
        {downloaded && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-green-600/80 backdrop-blur-sm rounded-full px-3 py-1">
            <CheckCircle className="h-4 w-4 text-white" />
            <span className="text-white text-sm">Downloaded</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {/* Play Button Overlay */}
        {!isPlaying && !isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={togglePlay}
              size="lg"
              className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
            >
              <Play className="h-8 w-8 text-white ml-1" />
            </Button>
          </div>
        )}

        {/* Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[duration ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button onClick={togglePlay} size="sm" variant="ghost" className="text-white hover:bg-white/20">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button onClick={() => skipTime(-10)} size="sm" variant="ghost" className="text-white hover:bg-white/20">
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button onClick={() => skipTime(10)} size="sm" variant="ghost" className="text-white hover:bg-white/20">
                <SkipForward className="h-5 w-5" />
              </Button>

              <div className="flex items-center space-x-2 ml-4">
                <Button onClick={toggleMute} size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <div className="w-20">
                  <Slider value={[isMuted ? 0 : volume * 100]} onValueChange={handleVolumeChange} max={100} step={1} />
                </div>
              </div>

              <div className="text-white text-sm ml-4">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Download Button */}
              <Button
                onClick={handleDownload}
                size="sm"
                variant="ghost"
                className={`text-white hover:bg-white/20 ${downloaded ? "bg-green-600/20" : ""} ${downloading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={downloading}
              >
                {downloaded ? <CheckCircle className="h-5 w-5" /> : <Download className="h-5 w-5" />}
              </Button>

              {/* Playback Speed */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    {playbackRate}x
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <DropdownMenuItem
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={playbackRate === rate ? "bg-blue-100" : ""}
                    >
                      {rate}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quality */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {["Auto", "1080p", "720p", "480p", "360p"].map((q) => (
                    <DropdownMenuItem
                      key={q}
                      onClick={() => setQuality(q)}
                      className={quality === q ? "bg-blue-100" : ""}
                    >
                      {q}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Subtitles */}
              <Button
                onClick={() => setShowSubtitles(!showSubtitles)}
                size="sm"
                variant="ghost"
                className={`text-white hover:bg-white/20 ${showSubtitles ? "bg-white/20" : ""}`}
              >
                <Subtitles className="h-5 w-5" />
              </Button>

              {/* Fullscreen */}
              <Button onClick={toggleFullscreen} size="sm" variant="ghost" className="text-white hover:bg-white/20">
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Title Overlay */}
        {showControls && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-semibold">{title}</h3>
              <div className="flex items-center space-x-2">
                {!isOnline && <WifiOff className="h-5 w-5 text-white opacity-60" />}
                {isOnline && <Wifi className="h-5 w-5 text-white opacity-60" />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
