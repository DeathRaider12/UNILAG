"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Type, Plus, Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from "lucide-react"
import type { TextOverlay } from "@/lib/video-processing-service"

interface TextOverlayEditorProps {
  textOverlays: TextOverlay[]
  selectedTextOverlay: TextOverlay | null
  onTextOverlayUpdate: (overlay: TextOverlay) => void
  onAddTextOverlay: () => void
}

export function TextOverlayEditor({
  textOverlays,
  selectedTextOverlay,
  onTextOverlayUpdate,
  onAddTextOverlay,
}: TextOverlayEditorProps) {
  const [previewText, setPreviewText] = useState("")

  const fontFamilies = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Courier New",
    "Impact",
    "Comic Sans MS",
  ]

  const animations = [
    { value: "none", label: "None" },
    { value: "fade-in", label: "Fade In" },
    { value: "slide-in", label: "Slide In" },
    { value: "zoom-in", label: "Zoom In" },
    { value: "typewriter", label: "Typewriter" },
  ]

  const presetColors = [
    "#ffffff",
    "#000000",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#ffa500",
    "#800080",
  ]

  const handleTextChange = (field: keyof TextOverlay, value: any) => {
    if (!selectedTextOverlay) return

    const updatedOverlay = {
      ...selectedTextOverlay,
      [field]: value,
    }
    onTextOverlayUpdate(updatedOverlay)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Text Overlays</h3>
        <Button size="sm" onClick={onAddTextOverlay}>
          <Plus className="h-4 w-4 mr-2" />
          Add Text
        </Button>
      </div>

      {/* Text Overlays List */}
      <ScrollArea className="h-32">
        <div className="space-y-2">
          {textOverlays.length === 0 ? (
            <div className="text-center py-4">
              <Type className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No text overlays</p>
            </div>
          ) : (
            textOverlays.map((overlay) => (
              <Card
                key={overlay.id}
                className={`cursor-pointer transition-all hover:bg-gray-700 ${
                  selectedTextOverlay?.id === overlay.id ? "bg-gray-700 ring-2 ring-blue-500" : "bg-gray-800"
                } border-gray-700`}
                onClick={() => onTextOverlayUpdate(overlay)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{overlay.text}</p>
                      <p className="text-xs text-gray-400">
                        {formatTime(overlay.startTime)} - {formatTime(overlay.startTime + overlay.duration)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {overlay.animation}
                      </Badge>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Text Editor */}
      {selectedTextOverlay ? (
        <ScrollArea className="flex-1">
          <div className="space-y-4">
            {/* Text Content */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white">Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-400">Text</Label>
                  <Textarea
                    value={selectedTextOverlay.text}
                    onChange={(e) => handleTextChange("text", e.target.value)}
                    placeholder="Enter your text..."
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white">Typography</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Font Family</Label>
                    <Select
                      value={selectedTextOverlay.fontFamily}
                      onValueChange={(value) => handleTextChange("fontFamily", value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map((font) => (
                          <SelectItem key={font} value={font}>
                            <span style={{ fontFamily: font }}>{font}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Font Size</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[selectedTextOverlay.fontSize]}
                        onValueChange={([value]) => handleTextChange("fontSize", value)}
                        min={12}
                        max={120}
                        step={2}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-400 w-8">{selectedTextOverlay.fontSize}</span>
                    </div>
                  </div>
                </div>

                {/* Text Formatting */}
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Underline className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-600 mx-2" />
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white">Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-400">Text Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={selectedTextOverlay.color}
                      onChange={(e) => handleTextChange("color", e.target.value)}
                      className="w-12 h-8 p-0 border-0 bg-transparent"
                    />
                    <Input
                      value={selectedTextOverlay.color}
                      onChange={(e) => handleTextChange("color", e.target.value)}
                      className="flex-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded border border-gray-600 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => handleTextChange("color", color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-400">Background Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={
                        selectedTextOverlay.backgroundColor === "transparent"
                          ? "#000000"
                          : selectedTextOverlay.backgroundColor
                      }
                      onChange={(e) => handleTextChange("backgroundColor", e.target.value)}
                      className="w-12 h-8 p-0 border-0 bg-transparent"
                    />
                    <Select
                      value={selectedTextOverlay.backgroundColor}
                      onValueChange={(value) => handleTextChange("backgroundColor", value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transparent">Transparent</SelectItem>
                        <SelectItem value="#000000">Black</SelectItem>
                        <SelectItem value="#ffffff">White</SelectItem>
                        <SelectItem value="#ff0000">Red</SelectItem>
                        <SelectItem value="#00ff00">Green</SelectItem>
                        <SelectItem value="#0000ff">Blue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Position & Timing */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white">Position & Timing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">X Position</Label>
                    <Input
                      type="number"
                      value={selectedTextOverlay.position.x}
                      onChange={(e) =>
                        handleTextChange("position", {
                          ...selectedTextOverlay.position,
                          x: Number(e.target.value),
                        })
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Y Position</Label>
                    <Input
                      type="number"
                      value={selectedTextOverlay.position.y}
                      onChange={(e) =>
                        handleTextChange("position", {
                          ...selectedTextOverlay.position,
                          y: Number(e.target.value),
                        })
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Start Time (s)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedTextOverlay.startTime}
                      onChange={(e) => handleTextChange("startTime", Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Duration (s)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedTextOverlay.duration}
                      onChange={(e) => handleTextChange("duration", Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Animation */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white">Animation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-400">Animation Type</Label>
                  <Select
                    value={selectedTextOverlay.animation}
                    onValueChange={(value) => handleTextChange("animation", value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {animations.map((animation) => (
                        <SelectItem key={animation.value} value={animation.value}>
                          {animation.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <Type className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Select a text overlay to edit</p>
            <p className="text-sm text-gray-500">Or create a new one to get started</p>
          </div>
        </div>
      )}
    </div>
  )
}
