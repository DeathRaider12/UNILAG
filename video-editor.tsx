"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, Volume2, Maximize, Save, Undo, Redo } from "lucide-react"
import { VideoTimeline } from "./video-timeline"
import { MediaLibrary } from "./media-library"
import { EffectsPanel } from "./effects-panel"
import { TextOverlayEditor } from "./text-overlay-editor"
import { ExportManager } from "./export-manager"
import {
  videoProcessingService,
  type VideoProject,
  type VideoClip,
  type VideoEffect,
  type TextOverlay,
} from "@/lib/video-processing-service"

interface VideoEditorProps {
  projectId?: string
  onSave?: (project: VideoProject) => void
  onClose?: () => void
}

export function VideoEditor({ projectId, onSave, onClose }: VideoEditorProps) {
  const [project, setProject] = useState<VideoProject | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedClip, setSelectedClip] = useState<VideoClip | null>(null)
  const [selectedTextOverlay, setSelectedTextOverlay] = useState<TextOverlay | null>(null)
  const [activeTab, setActiveTab] = useState("media")
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const initProject = async () => {
      if (projectId) {
        const existingProject = videoProcessingService.loadProject(projectId)
        if (existingProject) {
          setProject(existingProject)
        }
      } else {
        const newProject = await videoProcessingService.createProject("Untitled Project")
        setProject(newProject)
      }
    }

    initProject()
  }, [projectId])

  useEffect(() => {
    if (project && isPlaying) {
      const animate = () => {
        setCurrentTime((prev) => {
          const newTime = prev + 1 / 30 // 30 FPS
          if (newTime >= project.duration) {
            setIsPlaying(false)
            return project.duration
          }
          return newTime
        })
        animationFrameRef.current = requestAnimationFrame(animate)
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, project])

  useEffect(() => {
    if (project && canvasRef.current) {
      renderFrame()
    }
  }, [project, currentTime])

  const renderFrame = async () => {
    if (!project || !canvasRef.current) return

    try {
      const frameData = await videoProcessingService.renderFrame(project, currentTime)
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        const img = new Image()
        img.onload = () => {
          ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
          ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height)
        }
        img.src = frameData
      }
    } catch (error) {
      console.error("Failed to render frame:", error)
    }
  }

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleStop = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleFileUpload = async (files: FileList) => {
    if (!project) return

    for (let i = 0; i < files.length; i++) {
      try {
        const clip = await videoProcessingService.importMedia(files[i])
        const updatedProject = videoProcessingService.addClipToProject(project, clip, 0, project.duration)
        setProject(updatedProject)
      } catch (error) {
        console.error("Failed to import media:", error)
      }
    }
  }

  const handleClipMove = (clipId: string, newStartTime: number, newTrack: number) => {
    if (!project) return

    const updatedClips = project.clips.map((clip) =>
      clip.id === clipId ? { ...clip, startTime: newStartTime, track: newTrack } : clip,
    )

    const updatedProject = {
      ...project,
      clips: updatedClips,
      duration: Math.max(project.duration, ...updatedClips.map((clip) => clip.startTime + clip.duration)),
    }

    setProject(updatedProject)
    videoProcessingService.saveProject(updatedProject)
  }

  const handleEffectApply = (effect: VideoEffect) => {
    if (!selectedClip || !project) return

    const updatedClip = videoProcessingService.applyEffect(selectedClip, effect)
    const updatedClips = project.clips.map((clip) => (clip.id === selectedClip.id ? updatedClip : clip))

    const updatedProject = { ...project, clips: updatedClips }
    setProject(updatedProject)
    setSelectedClip(updatedClip)
    videoProcessingService.saveProject(updatedProject)
  }

  const handleAddTextOverlay = () => {
    if (!project) return

    const newTextOverlay: TextOverlay = {
      id: crypto.randomUUID(),
      text: "New Text",
      fontSize: 48,
      fontFamily: "Arial",
      color: "#ffffff",
      backgroundColor: "transparent",
      position: { x: 100, y: 100 },
      startTime: currentTime,
      duration: 3,
      animation: "none",
    }

    const updatedProject = videoProcessingService.addTextOverlay(project, newTextOverlay)
    setProject(updatedProject)
    setSelectedTextOverlay(newTextOverlay)
  }

  const handleTextOverlayUpdate = (overlay: TextOverlay) => {
    if (!project) return

    const updatedOverlays = project.textOverlays.map((o) => (o.id === overlay.id ? overlay : o))

    const updatedProject = { ...project, textOverlays: updatedOverlays }
    setProject(updatedProject)
    setSelectedTextOverlay(overlay)
    videoProcessingService.saveProject(updatedProject)
  }

  const handleExport = async (format: string, quality: string, preset: string) => {
    if (!project) return

    try {
      const blob = await videoProcessingService.exportVideo(project, format, quality)

      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${project.name}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
      throw error
    }
  }

  const handleSave = () => {
    if (project) {
      videoProcessingService.saveProject(project)
      onSave?.(project)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const frames = Math.floor((seconds % 1) * 30)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`
  }

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading video editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">{project.name}</h1>
          <Badge variant="outline" className="text-xs">
            {project.clips.length} clips
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost">
            <Undo className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Redo className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button size="sm" variant="ghost" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          {onClose && (
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel */}
        <div className="w-80 bg-gray-800 border-r border-gray-700">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-700">
              <TabsTrigger value="media" className="text-xs">
                Media
              </TabsTrigger>
              <TabsTrigger value="effects" className="text-xs">
                Effects
              </TabsTrigger>
              <TabsTrigger value="text" className="text-xs">
                Text
              </TabsTrigger>
              <TabsTrigger value="export" className="text-xs">
                Export
              </TabsTrigger>
            </TabsList>

            <div className="p-4 h-[calc(100vh-8rem)]">
              <TabsContent value="media" className="h-full mt-0">
                <MediaLibrary
                  clips={project.clips}
                  onClipSelect={setSelectedClip}
                  onFileUpload={handleFileUpload}
                  selectedClip={selectedClip}
                />
              </TabsContent>

              <TabsContent value="effects" className="h-full mt-0">
                <EffectsPanel selectedClip={selectedClip} onEffectApply={handleEffectApply} />
              </TabsContent>

              <TabsContent value="text" className="h-full mt-0">
                <TextOverlayEditor
                  textOverlays={project.textOverlays}
                  selectedTextOverlay={selectedTextOverlay}
                  onTextOverlayUpdate={handleTextOverlayUpdate}
                  onAddTextOverlay={handleAddTextOverlay}
                />
              </TabsContent>

              <TabsContent value="export" className="h-full mt-0">
                <ExportManager project={project} onExport={handleExport} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Preview Area */}
          <div className="flex-1 flex items-center justify-center bg-black p-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={project.width / 2}
                    height={project.height / 2}
                    className="rounded border border-gray-600"
                  />

                  {/* Preview Controls Overlay */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" onClick={handlePlay}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleStop}>
                        <Square className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                      {formatTime(currentTime)} / {formatTime(project.duration)}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Volume2 className="h-4 w-4" />
                      <Button size="sm" variant="ghost" onClick={() => setIsFullscreen(!isFullscreen)}>
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div className="h-64 border-t border-gray-700">
            <VideoTimeline
              project={project}
              currentTime={currentTime}
              onTimeChange={setCurrentTime}
              selectedClip={selectedClip}
              onClipSelect={setSelectedClip}
              onClipMove={handleClipMove}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
