"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  Palette,
  RotateCcw,
  Sun,
  Contrast,
  Droplets,
  Paintbrush,
  CloudyIcon as Blur,
  Filter,
} from "lucide-react"
import type { VideoClip, VideoEffect } from "@/lib/video-processing-service"

interface EffectsPanelProps {
  selectedClip: VideoClip | null
  onEffectApply: (effect: VideoEffect) => void
}

export function EffectsPanel({ selectedClip, onEffectApply }: EffectsPanelProps) {
  const [activeCategory, setActiveCategory] = useState("color")

  const colorEffects = [
    { type: "brightness", name: "Brightness", icon: Sun, defaultValue: 50 },
    { type: "contrast", name: "Contrast", icon: Contrast, defaultValue: 50 },
    { type: "saturation", name: "Saturation", icon: Droplets, defaultValue: 50 },
    { type: "hue", name: "Hue", icon: Palette, defaultValue: 0 },
  ]

  const filterEffects = [
    { type: "blur", name: "Blur", icon: Blur },
    { type: "sepia", name: "Sepia", icon: Filter },
    { type: "grayscale", name: "Grayscale", icon: Paintbrush },
  ]

  const getEffectValue = (effectType: string) => {
    if (!selectedClip) return 50
    const effect = selectedClip.effects.find((e) => e.type === effectType)
    return effect ? effect.intensity : 50
  }

  const handleEffectChange = (effectType: string, intensity: number) => {
    const effect: VideoEffect = {
      id: crypto.randomUUID(),
      type: effectType as any,
      intensity,
    }
    onEffectApply(effect)
  }

  const resetEffect = (effectType: string) => {
    const defaultValue = colorEffects.find((e) => e.type === effectType)?.defaultValue || 50
    handleEffectChange(effectType, defaultValue)
  }

  const resetAllEffects = () => {
    colorEffects.forEach((effect) => {
      handleEffectChange(effect.type, effect.defaultValue)
    })
  }

  if (!selectedClip) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Select a clip to apply effects</p>
          <p className="text-sm text-gray-500">Choose a video or image clip from the timeline</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Effects</h3>
          <Button size="sm" variant="ghost" onClick={resetAllEffects}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        </div>

        <div className="text-sm text-gray-400">
          Editing: <span className="text-white">{selectedClip.name}</span>
        </div>

        {selectedClip.effects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedClip.effects.map((effect) => (
              <Badge key={effect.id} variant="secondary" className="text-xs">
                {effect.type} ({effect.intensity})
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-2 bg-gray-700">
          <TabsTrigger value="color">Color</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
        </TabsList>

        <TabsContent value="color" className="space-y-4">
          <ScrollArea className="h-80">
            <div className="space-y-6">
              {colorEffects.map((effect) => {
                const IconComponent = effect.icon
                const currentValue = getEffectValue(effect.type)

                return (
                  <Card key={effect.type} className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4 text-blue-400" />
                          <CardTitle className="text-sm text-white">{effect.name}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">{currentValue}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => resetEffect(effect.type)}
                            className="h-6 w-6 p-0"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Slider
                        value={[currentValue]}
                        onValueChange={([value]) => handleEffectChange(effect.type, value)}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>100</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <ScrollArea className="h-80">
            <div className="grid grid-cols-1 gap-3">
              {filterEffects.map((effect) => {
                const IconComponent = effect.icon
                const isActive = selectedClip.effects.some((e) => e.type === effect.type)

                return (
                  <Card
                    key={effect.type}
                    className={`cursor-pointer transition-all hover:bg-gray-700 ${
                      isActive ? "bg-gray-700 ring-2 ring-blue-500" : "bg-gray-800"
                    } border-gray-700`}
                    onClick={() => handleEffectChange(effect.type, isActive ? 0 : 100)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isActive ? "bg-blue-600" : "bg-gray-600"}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">{effect.name}</h4>
                          <p className="text-xs text-gray-400">{isActive ? "Active" : "Click to apply"}</p>
                        </div>
                        {isActive && (
                          <Badge variant="secondary" className="text-xs">
                            ON
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-400">Quick Actions</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              handleEffectChange("brightness", 70)
              handleEffectChange("contrast", 60)
            }}
          >
            <Sun className="h-4 w-4 mr-2" />
            Brighten
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleEffectChange("grayscale", 100)}>
            <Filter className="h-4 w-4 mr-2" />
            B&W
          </Button>
        </div>
      </div>
    </div>
  )
}
