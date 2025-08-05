"use client"

import { useState, useEffect, useCallback } from "react"

interface OfflineVideo {
  key: string
  title: string
  url: string
  blob: Blob
  downloadDate: number
  size: number
}

interface DownloadProgress {
  [key: string]: number
}

interface StorageInfo {
  totalSize: number
  availableSpace: number
  videoCount: number
  videos: OfflineVideo[]
}

export function useOfflineVideo() {
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({})
  const [downloadingVideos, setDownloadingVideos] = useState<Set<string>>(new Set())
  const [offlineVideos, setOfflineVideos] = useState<Map<string, OfflineVideo>>(new Map())

  // Load offline videos from IndexedDB on mount
  useEffect(() => {
    loadOfflineVideos()
  }, [])

  const loadOfflineVideos = async () => {
    try {
      const db = await openDB()
      const transaction = db.transaction(["videos"], "readonly")
      const store = transaction.objectStore("videos")
      const request = store.getAll()

      request.onsuccess = () => {
        const videos = new Map<string, OfflineVideo>()
        request.result.forEach((video: OfflineVideo) => {
          videos.set(video.key, video)
        })
        setOfflineVideos(videos)
      }
    } catch (error) {
      console.error("Failed to load offline videos:", error)
    }
  }

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("OfflineVideos", 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains("videos")) {
          const store = db.createObjectStore("videos", { keyPath: "key" })
          store.createIndex("downloadDate", "downloadDate", { unique: false })
        }
      }
    })
  }

  const downloadVideo = useCallback(
    async (key: string, url: string, title: string) => {
      if (downloadingVideos.has(key) || offlineVideos.has(key)) {
        return
      }

      setDownloadingVideos((prev) => new Set(prev).add(key))
      setDownloadProgress((prev) => ({ ...prev, [key]: 0 }))

      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error("Failed to fetch video")

        const contentLength = response.headers.get("content-length")
        const total = contentLength ? Number.parseInt(contentLength, 10) : 0
        let loaded = 0

        const reader = response.body?.getReader()
        if (!reader) throw new Error("Failed to get response reader")

        const chunks: Uint8Array[] = []

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          chunks.push(value)
          loaded += value.length

          if (total > 0) {
            const progress = (loaded / total) * 100
            setDownloadProgress((prev) => ({ ...prev, [key]: progress }))
          }
        }

        const blob = new Blob(chunks, { type: "video/mp4" })
        const offlineVideo: OfflineVideo = {
          key,
          title,
          url,
          blob,
          downloadDate: Date.now(),
          size: blob.size,
        }

        // Save to IndexedDB
        const db = await openDB()
        const transaction = db.transaction(["videos"], "readwrite")
        const store = transaction.objectStore("videos")
        await new Promise<void>((resolve, reject) => {
          const request = store.add(offlineVideo)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })

        setOfflineVideos((prev) => new Map(prev).set(key, offlineVideo))
        setDownloadProgress((prev) => ({ ...prev, [key]: 100 }))

        // Clean up progress after a delay
        setTimeout(() => {
          setDownloadProgress((prev) => {
            const newProgress = { ...prev }
            delete newProgress[key]
            return newProgress
          })
        }, 2000)
      } catch (error) {
        console.error("Failed to download video:", error)
        setDownloadProgress((prev) => {
          const newProgress = { ...prev }
          delete newProgress[key]
          return newProgress
        })
      } finally {
        setDownloadingVideos((prev) => {
          const newSet = new Set(prev)
          newSet.delete(key)
          return newSet
        })
      }
    },
    [downloadingVideos, offlineVideos],
  )

  const deleteVideo = useCallback(
    async (key: string) => {
      try {
        const db = await openDB()
        const transaction = db.transaction(["videos"], "readwrite")
        const store = transaction.objectStore("videos")

        await new Promise<void>((resolve, reject) => {
          const request = store.delete(key)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })

        // Revoke the blob URL to free memory
        const video = offlineVideos.get(key)
        if (video) {
          URL.revokeObjectURL(getOfflineVideoUrl(key))
        }

        setOfflineVideos((prev) => {
          const newMap = new Map(prev)
          newMap.delete(key)
          return newMap
        })
      } catch (error) {
        console.error("Failed to delete video:", error)
      }
    },
    [offlineVideos],
  )

  const getOfflineVideoUrl = useCallback(
    (key: string): string => {
      const video = offlineVideos.get(key)
      if (!video) return ""
      return URL.createObjectURL(video.blob)
    },
    [offlineVideos],
  )

  const isDownloaded = useCallback(
    (key: string): boolean => {
      return offlineVideos.has(key)
    },
    [offlineVideos],
  )

  const isDownloading = useCallback(
    (key: string): boolean => {
      return downloadingVideos.has(key)
    },
    [downloadingVideos],
  )

  const getStorageInfo = useCallback((): StorageInfo => {
    const videos = Array.from(offlineVideos.values())
    const totalSize = videos.reduce((sum, video) => sum + video.size, 0)

    return {
      totalSize,
      availableSpace: 0, // Would need to implement storage quota API
      videoCount: videos.length,
      videos: videos.sort((a, b) => b.downloadDate - a.downloadDate),
    }
  }, [offlineVideos])

  const clearAllVideos = useCallback(async () => {
    try {
      const db = await openDB()
      const transaction = db.transaction(["videos"], "readwrite")
      const store = transaction.objectStore("videos")

      await new Promise<void>((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      // Revoke all blob URLs
      offlineVideos.forEach((video, key) => {
        URL.revokeObjectURL(getOfflineVideoUrl(key))
      })

      setOfflineVideos(new Map())
    } catch (error) {
      console.error("Failed to clear videos:", error)
    }
  }, [offlineVideos, getOfflineVideoUrl])

  return {
    downloadVideo,
    deleteVideo,
    isDownloaded,
    isDownloading,
    downloadProgress,
    getOfflineVideoUrl,
    getStorageInfo,
    clearAllVideos,
  }
}
