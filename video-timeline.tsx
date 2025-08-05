"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Film, Music, ImageIcon, Volume2 } from "lucide-react"
import type { VideoProject, VideoClip } from "@/lib/video-processing-service"

interface VideoTimelineProps {
  project: VideoProject
  currentTime: number
  onTimeChange: (time: number) => void
  selectedClip: VideoClip | null
  onClipSelect: (clip: VideoClip | null) => void
  onClipMove: (clipId: string, newStartTime: number, newTrack: number) => void
}

export function VideoTimeline({
  project,
  currentTime,
  onTimeChange,
  selectedClip,
  onClipSelect,
  onClipMove,
}: VideoTimelineProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedClip, setDraggedClip] = useState<VideoClip | null>(null)
  const [zoom, setZoom] = useState(1)
  const timelineRef = useRef<HTMLDivElement>(null)

  const TRACK_HEIGHT = 60
  const TRACK_COUNT = 8
  const PIXELS_PER_SECOND = 50 * zoom

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = x / PIXELS_PER_SECOND
    onTimeChange(Math.max(0, Math.min(time, project.duration)))
  }

  const handleClipDragStart = (e: React.MouseEvent, clip: VideoClip) => {
    e.stopPropagation()
    setIsDragging(true)
    setDraggedClip(clip)
    onClipSelect(clip)
  }

  const handleClipDrag = (e: React.MouseEvent) => {
    if (!isDragging || !draggedClip || !timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newStartTime = Math.max(0, x / PIXELS_PER_SECOND)
    const newTrack = Math.floor(y / TRACK_HEIGHT)

    if (newTrack >= 0 && newTrack < TRACK_COUNT) {
      onClipMove(draggedClip.id, newStartTime, newTrack)
    }
  }

  const handleClipDragEnd = () => {
    setIsDragging(false)
    setDraggedClip(null)
  }

  const getClipIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Film className="h-4 w-4" />
      case "audio":
        return <Music className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      default:
        return <Film className="h-4 w-4" />
    }
  }

  const getClipColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-blue-600"
      case "audio":
        return "bg-green-600"
      case "image":
        return "bg-purple-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Timeline Header */}
      <div className="flex items-center justify-between p-2 bg-gray-700 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white">Timeline</span>
          <Badge variant="outline" className="text-xs">
            {project.clips.length} clips
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} className="text-white">
            -
          </Button>
          <span className="text-xs text-white w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button size="sm" variant="ghost" onClick={() => setZoom(Math.min(4, zoom + 0.25))} className="text-white">
            +
          </Button>
        </div>
      </div>

      {/* Time Ruler */}
      <div className="h-8 bg-gray-700 border-b border-gray-600 relative overflow-hidden">
        <div className="absolute inset-0 flex">
          {Array.from({ length: Math.ceil(project.duration) + 1 }, (_, i) => (
            <div
              key={i}
              className="border-l border-gray-500 text-xs text-gray-300 pl-1"
              style={{ width: `${PIXELS_PER_SECOND}px` }}
            >
              {formatTime(i)}
            </div>
          ))}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${currentTime * PIXELS_PER_SECOND}px` }}
        />
      </div>

      {/* Tracks */}
      <ScrollArea className="flex-1">
        <div
          ref={timelineRef}
          className="relative"
          style={{
            height: `${TRACK_COUNT * TRACK_HEIGHT}px`,
            width: `${Math.max(1000, project.duration * PIXELS_PER_SECOND)}px`,
          }}
          onClick={handleTimelineClick}
          onMouseMove={handleClipDrag}
          onMouseUp={handleClipDragEnd}
        >
          {/* Track Backgrounds */}
          {Array.from({ length: TRACK_COUNT }, (_, trackIndex) => (
            <div
              key={trackIndex}
              className={`absolute border-b border-gray-600 ${trackIndex % 2 === 0 ? "bg-gray-800" : "bg-gray-750"}`}
              style={{
                top: `${trackIndex * TRACK_HEIGHT}px`,
                height: `${TRACK_HEIGHT}px`,
                width: "100%",
              }}
            >
              <div className="absolute left-2 top-2 text-xs text-gray-400">Track {trackIndex + 1}</div>
            </div>
          ))}

          {/* Clips */}
          {project.clips.map((clip) => (
            <div
              key={clip.id}
              className={`absolute rounded cursor-move border-2 ${
                selectedClip?.id === clip.id ? "border-yellow-400" : "border-transparent"
              } ${getClipColor(clip.type)} hover:opacity-80 transition-opacity`}
              style={{
                left: `${clip.startTime * PIXELS_PER_SECOND}px`,
                top: `${clip.track * TRACK_HEIGHT + 4}px`,
                width: `${clip.duration * PIXELS_PER_SECOND}px`,
                height: `${TRACK_HEIGHT - 8}px`,
              }}
              onMouseDown={(e) => handleClipDragStart(e, clip)}
              onClick={(e) => {
                e.stopPropagation()
                onClipSelect(clip)
              }}
            >
              <div className="p-2 h-full flex items-center space-x-2 text-white text-xs">
                {getClipIcon(clip.type)}
                <span className="truncate flex-1">{clip.name}</span>
                {clip.effects.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {clip.effects.length}
                  </Badge>
                )}
              </div>

              {/* Resize handles */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white opacity-0 hover:opacity-100 cursor-w-resize" />
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-white opacity-0 hover:opacity-100 cursor-e-resize" />
            </div>
          ))}

          {/* Text Overlays */}
          {project.textOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className="absolute rounded bg-yellow-600 border-2 border-transparent hover:border-yellow-400 cursor-move"
              style={{
                left: `${overlay.startTime * PIXELS_PER_SECOND}px`,
                top: `${(TRACK_COUNT - 1) * TRACK_HEIGHT + 4}px`,
                width: `${overlay.duration * PIXELS_PER_SECOND}px`,
                height: `${TRACK_HEIGHT - 8}px`,
              }}
            >
              <div className="p-2 h-full flex items-center space-x-2 text-white text-xs">
                <span className="truncate flex-1">{overlay.text}</span>
              </div>
            </div>
          ))}

          {/* Current Time Indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-20"
            style={{ left: `${currentTime * PIXELS_PER_SECOND}px` }}
          />
        </div>
      </ScrollArea>

      {/* Track Labels */}
      <div className="absolute left-0 top-16 bottom-0 w-20 bg-gray-700 border-r border-gray-600">
        {Array.from({ length: TRACK_COUNT }, (_, trackIndex) => (
          <div
            key={trackIndex}
            className="flex items-center justify-center text-xs text-gray-300 border-b border-gray-600"
            style={{ height: `${TRACK_HEIGHT}px` }}
          >
            {trackIndex < 6 ? <Film className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </div>
        ))}
      </div>
    </div>
  )
}
