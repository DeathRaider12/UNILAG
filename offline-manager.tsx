"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, Trash2, HardDrive, Wifi, WifiOff, Play, Calendar, FileVideo, AlertTriangle } from "lucide-react"
import { useOfflineVideo } from "@/hooks/use-offline-video"

export function OfflineManager() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const { getStorageInfo, deleteVideo, clearAllVideos } = useOfflineVideo()
  const [storageInfo, setStorageInfo] = useState(getStorageInfo())

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
    const interval = setInterval(() => {
      setStorageInfo(getStorageInfo())
    }, 1000)

    return () => clearInterval(interval)
  }, [getStorageInfo])

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDeleteVideo = async (key: string) => {
    await deleteVideo(key)
    setStorageInfo(getStorageInfo())
  }

  const handleClearAll = async () => {
    await clearAllVideos()
    setStorageInfo(getStorageInfo())
    setShowClearDialog(false)
  }

  const getStorageUsagePercentage = () => {
    // Assuming 1GB limit for demo purposes
    const limit = 1024 * 1024 * 1024 // 1GB in bytes
    return (storageInfo.totalSize / limit) * 100
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Alert className={isOnline ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
        {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-orange-600" />}
        <AlertDescription className={isOnline ? "text-green-800" : "text-orange-800"}>
          {isOnline
            ? "You're online. Videos will stream normally."
            : "You're offline. Only downloaded videos are available."}
        </AlertDescription>
      </Alert>

      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>Storage Overview</span>
          </CardTitle>
          <CardDescription>Manage your downloaded videos for offline viewing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{storageInfo.videoCount}</div>
              <div className="text-sm text-gray-600">Downloaded Videos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatFileSize(storageInfo.totalSize)}</div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(getStorageUsagePercentage())}%</div>
              <div className="text-sm text-gray-600">Storage Used</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Storage Usage</span>
              <span>{formatFileSize(storageInfo.totalSize)} / 1 GB</span>
            </div>
            <Progress value={getStorageUsagePercentage()} className="h-2" />
          </div>

          {storageInfo.videoCount > 0 && (
            <div className="flex justify-end">
              <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Clear All Downloads</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete all downloaded videos? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleClearAll}>
                      Clear All
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Downloaded Videos List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileVideo className="h-5 w-5" />
            <span>Downloaded Videos</span>
          </CardTitle>
          <CardDescription>
            {storageInfo.videoCount === 0
              ? "No videos downloaded yet"
              : `${storageInfo.videoCount} video${storageInfo.videoCount === 1 ? "" : "s"} available offline`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {storageInfo.videoCount === 0 ? (
            <div className="text-center py-8">
              <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Downloaded Videos</h3>
              <p className="text-gray-600 mb-4">
                Download videos while online to watch them later without an internet connection.
              </p>
              <Button variant="outline">Browse Courses</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {storageInfo.videos.map((video) => (
                <div key={video.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Play className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{video.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <HardDrive className="h-3 w-3" />
                          <span>{formatFileSize(video.size)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(video.downloadDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Downloaded
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteVideo(video.key)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span>Storage Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>
                Downloaded videos are stored locally on your device and don't count against your data usage when
                watching offline.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Videos are automatically played from your downloads when available, even when online.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Clear old downloads regularly to free up storage space on your device.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Download videos on Wi-Fi to avoid using your mobile data allowance.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
