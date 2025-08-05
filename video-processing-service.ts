"use client"

export interface VideoClip {
  id: string
  name: string
  type: "video" | "audio" | "image"
  url: string
  duration: number
  startTime: number
  endTime: number
  track: number
  volume: number
  effects: VideoEffect[]
  position?: { x: number; y: number }
  scale?: number
  rotation?: number
}

export interface VideoEffect {
  id: string
  type: "brightness" | "contrast" | "saturation" | "hue" | "blur" | "sepia" | "grayscale"
  intensity: number
}

export interface TextOverlay {
  id: string
  text: string
  fontSize: number
  fontFamily: string
  color: string
  backgroundColor: string
  position: { x: number; y: number }
  startTime: number
  duration: number
  animation: "none" | "fade-in" | "slide-in" | "zoom-in" | "typewriter"
}

export interface AudioTrack {
  id: string
  name: string
  url: string
  duration: number
  volume: number
  startTime: number
}

export interface VideoProject {
  id: string
  name: string
  width: number
  height: number
  fps: number
  duration: number
  clips: VideoClip[]
  textOverlays: TextOverlay[]
  audioTracks: AudioTrack[]
  createdAt: Date
  updatedAt: Date
}

class VideoProcessingService {
  private static instance: VideoProcessingService
  private projects: Map<string, VideoProject> = new Map()

  static getInstance(): VideoProcessingService {
    if (!VideoProcessingService.instance) {
      VideoProcessingService.instance = new VideoProcessingService()
    }
    return VideoProcessingService.instance
  }

  async createProject(name: string): Promise<VideoProject> {
    const project: VideoProject = {
      id: crypto.randomUUID(),
      name,
      width: 1920,
      height: 1080,
      fps: 30,
      duration: 0,
      clips: [],
      textOverlays: [],
      audioTracks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.projects.set(project.id, project)
    return project
  }

  loadProject(projectId: string): VideoProject | null {
    return this.projects.get(projectId) || null
  }

  saveProject(project: VideoProject): void {
    project.updatedAt = new Date()
    this.projects.set(project.id, project)

    // Save to localStorage for persistence
    try {
      const projectData = JSON.stringify(project, (key, value) => {
        if (key === "createdAt" || key === "updatedAt") {
          return value instanceof Date ? value.toISOString() : value
        }
        return value
      })
      localStorage.setItem(`video_project_${project.id}`, projectData)
    } catch (error) {
      console.error("Failed to save project to localStorage:", error)
    }
  }

  async importMedia(file: File): Promise<VideoClip> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)

      if (file.type.startsWith("video/")) {
        const video = document.createElement("video")
        video.onloadedmetadata = () => {
          const clip: VideoClip = {
            id: crypto.randomUUID(),
            name: file.name,
            type: "video",
            url,
            duration: video.duration,
            startTime: 0,
            endTime: video.duration,
            track: 0,
            volume: 1,
            effects: [],
            scale: 1,
            rotation: 0,
          }
          resolve(clip)
        }
        video.onerror = () => reject(new Error("Failed to load video"))
        video.src = url
      } else if (file.type.startsWith("audio/")) {
        const audio = document.createElement("audio")
        audio.onloadedmetadata = () => {
          const clip: VideoClip = {
            id: crypto.randomUUID(),
            name: file.name,
            type: "audio",
            url,
            duration: audio.duration,
            startTime: 0,
            endTime: audio.duration,
            track: 0,
            volume: 1,
            effects: [],
          }
          resolve(clip)
        }
        audio.onerror = () => reject(new Error("Failed to load audio"))
        audio.src = url
      } else if (file.type.startsWith("image/")) {
        const img = document.createElement("img")
        img.onload = () => {
          const clip: VideoClip = {
            id: crypto.randomUUID(),
            name: file.name,
            type: "image",
            url,
            duration: 5, // Default 5 seconds for images
            startTime: 0,
            endTime: 5,
            track: 0,
            volume: 1,
            effects: [],
            scale: 1,
            rotation: 0,
          }
          resolve(clip)
        }
        img.onerror = () => reject(new Error("Failed to load image"))
        img.src = url
      } else {
        reject(new Error("Unsupported file type"))
      }
    })
  }

  addClipToProject(project: VideoProject, clip: VideoClip, track: number, startTime: number): VideoProject {
    const newClip = {
      ...clip,
      track,
      startTime,
    }

    const updatedProject = {
      ...project,
      clips: [...project.clips, newClip],
      duration: Math.max(project.duration, startTime + clip.duration),
      updatedAt: new Date(),
    }

    this.projects.set(project.id, updatedProject)
    return updatedProject
  }

  addTextOverlay(project: VideoProject, textOverlay: TextOverlay): VideoProject {
    const updatedProject = {
      ...project,
      textOverlays: [...project.textOverlays, textOverlay],
      updatedAt: new Date(),
    }

    this.projects.set(project.id, updatedProject)
    return updatedProject
  }

  applyEffect(clip: VideoClip, effect: VideoEffect): VideoClip {
    const existingEffectIndex = clip.effects.findIndex((e) => e.type === effect.type)

    if (existingEffectIndex >= 0) {
      clip.effects[existingEffectIndex] = effect
    } else {
      clip.effects.push(effect)
    }

    return { ...clip }
  }

  async renderFrame(project: VideoProject, currentTime: number): Promise<string> {
    const canvas = document.createElement("canvas")
    canvas.width = project.width
    canvas.height = project.height
    const ctx = canvas.getContext("2d")!

    // Clear canvas
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Render video clips
    for (const clip of project.clips) {
      if (currentTime >= clip.startTime && currentTime <= clip.startTime + clip.duration) {
        await this.renderClip(ctx, clip, currentTime - clip.startTime)
      }
    }

    // Render text overlays
    for (const textOverlay of project.textOverlays) {
      if (currentTime >= textOverlay.startTime && currentTime <= textOverlay.startTime + textOverlay.duration) {
        this.renderTextOverlay(ctx, textOverlay, currentTime - textOverlay.startTime)
      }
    }

    return canvas.toDataURL()
  }

  private async renderClip(ctx: CanvasRenderingContext2D, clip: VideoClip, clipTime: number): Promise<void> {
    if (clip.type === "video") {
      // For demo purposes, we'll render a placeholder
      ctx.fillStyle = "#333333"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.fillStyle = "#ffffff"
      ctx.font = "24px Arial"
      ctx.textAlign = "center"
      ctx.fillText(clip.name, ctx.canvas.width / 2, ctx.canvas.height / 2)
    } else if (clip.type === "image") {
      // Render image placeholder
      ctx.fillStyle = "#666666"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.fillStyle = "#ffffff"
      ctx.font = "24px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`Image: ${clip.name}`, ctx.canvas.width / 2, ctx.canvas.height / 2)
    }

    // Apply effects
    this.applyEffectsToCanvas(ctx, clip.effects)
  }

  private renderTextOverlay(ctx: CanvasRenderingContext2D, textOverlay: TextOverlay, overlayTime: number): void {
    ctx.save()

    // Apply animation
    let opacity = 1
    if (textOverlay.animation === "fade-in") {
      opacity = Math.min(overlayTime / 0.5, 1) // Fade in over 0.5 seconds
    }

    ctx.globalAlpha = opacity
    ctx.font = `${textOverlay.fontSize}px ${textOverlay.fontFamily}`
    ctx.fillStyle = textOverlay.color
    ctx.textAlign = "left"
    ctx.textBaseline = "top"

    // Background
    if (textOverlay.backgroundColor !== "transparent") {
      const textMetrics = ctx.measureText(textOverlay.text)
      ctx.fillStyle = textOverlay.backgroundColor
      ctx.fillRect(
        textOverlay.position.x - 5,
        textOverlay.position.y - 5,
        textMetrics.width + 10,
        textOverlay.fontSize + 10,
      )
    }

    // Text
    ctx.fillStyle = textOverlay.color
    ctx.fillText(textOverlay.text, textOverlay.position.x, textOverlay.position.y)

    ctx.restore()
  }

  private applyEffectsToCanvas(ctx: CanvasRenderingContext2D, effects: VideoEffect[]): void {
    if (effects.length === 0) return

    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
    const data = imageData.data

    for (const effect of effects) {
      switch (effect.type) {
        case "brightness":
          this.applyBrightness(data, effect.intensity)
          break
        case "contrast":
          this.applyContrast(data, effect.intensity)
          break
        case "grayscale":
          this.applyGrayscale(data)
          break
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  private applyBrightness(data: Uint8ClampedArray, intensity: number): void {
    const adjustment = (intensity - 50) * 2.55 // Convert 0-100 to -127.5 to 127.5
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] + adjustment)) // Red
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment)) // Green
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment)) // Blue
    }
  }

  private applyContrast(data: Uint8ClampedArray, intensity: number): void {
    const factor = (259 * (intensity + 255)) / (255 * (259 - intensity))
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128))
      data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128))
      data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128))
    }
  }

  private applyGrayscale(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      data[i] = gray // Red
      data[i + 1] = gray // Green
      data[i + 2] = gray // Blue
    }
  }

  async exportVideo(project: VideoProject, format: string, quality: string): Promise<Blob> {
    // For demo purposes, create a simple blob
    // In a real implementation, this would use WebCodecs API or similar
    const canvas = document.createElement("canvas")
    canvas.width = project.width
    canvas.height = project.height

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || new Blob())
      }, `video/${format}`)
    })
  }

  getAllProjects(): VideoProject[] {
    return Array.from(this.projects.values())
  }

  deleteProject(projectId: string): void {
    this.projects.delete(projectId)
    localStorage.removeItem(`video_project_${projectId}`)
  }
}

export const videoProcessingService = VideoProcessingService.getInstance()
