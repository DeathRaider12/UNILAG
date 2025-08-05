"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  Settings,
  FileVideo,
  Smartphone,
  Monitor,
  Youtube,
  Instagram,
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react"
import type { VideoProject } from "@/lib/video-processing-service"

interface ExportManagerProps {
  project: VideoProject
  onExport: (format: string, quality: string, preset: string) => Promise<void>
}

export function ExportManager({ project, onExport }: ExportManagerProps) {
  const [selectedFormat, setSelectedFormat] = useState("mp4")
  const [selectedQuality, setSelectedQuality] = useState("medium")
  const [selectedPreset, setSelectedPreset] = useState("web")
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "success" | "error">("idle")

  const formats = [
    { value: "mp4", label: "MP4", description: "Most compatible format" },
    { value: "webm", label: "WebM", description: "Web optimized" },
    { value: "mov", label: "MOV", description: "High quality" },
  ]

  const qualities = [
    { value: "low", label: "Low (720p)", bitrate: "2 Mbps", size: "~50MB" },
    { value: "medium", label: "Medium (1080p)", bitrate: "5 Mbps", size: "~125MB" },
    { value: "high", label: "High (1080p+)", bitrate: "10 Mbps", size: "~250MB" },
  ]

  const presets = [
    { value: "web", label: "Web", icon: Globe, description: "Optimized for web playback" },
    { value: "youtube", label: "YouTube", icon: Youtube, description: "YouTube recommended settings" },
    { value: "instagram", label: "Instagram", icon: Instagram, description: "Instagram video format" },
    { value: "mobile", label: "Mobile", icon: Smartphone, description: "Mobile device optimized" },
    { value: "desktop", label: "Desktop", icon: Monitor, description: "Desktop viewing" },
  ]

  const handleExport = async () => {
    setIsExporting(true)
    setExportStatus("exporting")
    setExportProgress(0)

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 10
        })
      }, 500)

      await onExport(selectedFormat, selectedQuality, selectedPreset)

      clearInterval(progressInterval)
      setExportProgress(100)
      setExportStatus("success")
    } catch (error) {
      setExportStatus("error")
    } finally {
      setIsExporting(false)
    }
  }

  const getEstimatedFileSize = () => {
    const quality = qualities.find((q) => q.value === selectedQuality)
    const duration = project.duration
    const baseSizeMB = selectedQuality === "low" ? 10 : selectedQuality === "medium" ? 25 : 50
    return Math.round(baseSizeMB * (duration / 60))
  }

  const getEstimatedTime = () => {
    const duration = project.duration
    const processingRatio = selectedQuality === "low" ? 0.5 : selectedQuality === "medium" ? 1 : 2
    return Math.round(duration * processingRatio)
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Export Video</h3>
        <Badge variant="outline" className="text-xs">
          {project.duration.toFixed(1)}s
        </Badge>
      </div>

      {/* Export Settings */}
      <div className="space-y-4">
        {/* Format Selection */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center">
              <FileVideo className="h-4 w-4 mr-2" />
              Format
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div>
                      <div className="font-medium">{format.label}</div>
                      <div className="text-xs text-gray-400">{format.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Quality Selection */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedQuality} onValueChange={setSelectedQuality}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {qualities.map((quality) => (
                  <SelectItem key={quality.value} value={quality.value}>
                    <div>
                      <div className="font-medium">{quality.label}</div>
                      <div className="text-xs text-gray-400">
                        {quality.bitrate} • {quality.size}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Preset Selection */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Platform Presets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {presets.map((preset) => {
                const IconComponent = preset.icon
                return (
                  <div
                    key={preset.value}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPreset === preset.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    }`}
                    onClick={() => setSelectedPreset(preset.value)}
                  >
                    <IconComponent className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{preset.label}</div>
                      <div className="text-xs opacity-75">{preset.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Info */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white">Export Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Estimated Size:</span>
            <span className="text-white">{getEstimatedFileSize()} MB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Estimated Time:</span>
            <span className="text-white">{getEstimatedTime()}s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Resolution:</span>
            <span className="text-white">
              {project.width}x{project.height}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Frame Rate:</span>
            <span className="text-white">{project.fps} fps</span>
          </div>
        </CardContent>
      </Card>

      {/* Export Progress */}
      {(isExporting || exportStatus !== "idle") && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center">
              {exportStatus === "exporting" && <Clock className="h-4 w-4 mr-2 animate-spin" />}
              {exportStatus === "success" && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
              {exportStatus === "error" && <AlertCircle className="h-4 w-4 mr-2 text-red-500" />}
              Export Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={exportProgress} className="w-full" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                {exportStatus === "exporting" && "Exporting..."}
                {exportStatus === "success" && "Export Complete!"}
                {exportStatus === "error" && "Export Failed"}
              </span>
              <span className="text-white">{Math.round(exportProgress)}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Button */}
      <div className="flex-1 flex items-end">
        <Button
          onClick={handleExport}
          disabled={isExporting || project.clips.length === 0}
          className="w-full"
          size="lg"
        >
          {isExporting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export Video
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
