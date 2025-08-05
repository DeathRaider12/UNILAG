"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Users,
  Settings,
  Plus,
  Play,
  Square,
  MessageCircle,
  MoreVertical,
} from "lucide-react"
import { videoConferenceService, type ConferenceRoom } from "@/lib/video-conference-service"
import { useAuth } from "@/hooks/use-auth"

export function VideoConferenceRoom() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<ConferenceRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ConferenceRoom | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isInRoom, setIsInRoom] = useState(false)
  const [localVideo, setLocalVideo] = useState(true)
  const [localAudio, setLocalAudio] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const [newRoomData, setNewRoomData] = useState({
    name: "",
    description: "",
    courseId: "",
    maxParticipants: 50,
    allowStudentVideo: true,
    allowStudentAudio: true,
    allowScreenShare: false,
    recordSession: false,
    requireApproval: false,
  })

  useEffect(() => {
    const unsubscribe = videoConferenceService.subscribe(setRooms)
    loadRooms()
    return unsubscribe
  }, [])

  const loadRooms = () => {
    const allRooms = videoConferenceService.getRooms()
    setRooms(allRooms)
  }

  const handleCreateRoom = async () => {
    if (!user) return

    const result = await videoConferenceService.createRoom(
      user.id,
      newRoomData.name,
      newRoomData.description,
      newRoomData.courseId || undefined,
      {
        maxParticipants: newRoomData.maxParticipants,
        allowStudentVideo: newRoomData.allowStudentVideo,
        allowStudentAudio: newRoomData.allowStudentAudio,
        allowScreenShare: newRoomData.allowScreenShare,
        recordSession: newRoomData.recordSession,
        requireApproval: newRoomData.requireApproval,
      },
    )

    if (result.success) {
      setShowCreateDialog(false)
      setNewRoomData({
        name: "",
        description: "",
        courseId: "",
        maxParticipants: 50,
        allowStudentVideo: true,
        allowStudentAudio: true,
        allowScreenShare: false,
        recordSession: false,
        requireApproval: false,
      })
    }
  }

  const handleJoinRoom = async (room: ConferenceRoom) => {
    if (!user) return

    const result = await videoConferenceService.joinRoom(
      room.id,
      user.id,
      `${user.firstName} ${user.lastName}`,
      user.role === "instructor" ? "instructor" : "student",
    )

    if (result.success) {
      setSelectedRoom(room)
      setIsInRoom(true)
    }
  }

  const handleLeaveRoom = async () => {
    if (!user || !selectedRoom) return

    await videoConferenceService.leaveRoom(selectedRoom.id, user.id)
    setSelectedRoom(null)
    setIsInRoom(false)
  }

  const handleStartRoom = async (roomId: string) => {
    if (!user) return
    await videoConferenceService.startRoom(roomId, user.id)
  }

  const handleEndRoom = async (roomId: string) => {
    if (!user) return
    await videoConferenceService.endRoom(roomId, user.id)
  }

  const toggleVideo = () => {
    setLocalVideo(!localVideo)
  }

  const toggleAudio = () => {
    setLocalAudio(!localAudio)
  }

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing)
  }

  const getParticipantInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (isInRoom && selectedRoom) {
    return (
      <div className="h-screen bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-white text-xl font-semibold">{selectedRoom.name}</h1>
            <Badge variant={selectedRoom.isActive ? "default" : "secondary"}>
              {selectedRoom.isActive ? "Live" : "Waiting"}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-white">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
            <Button variant="destructive" onClick={handleLeaveRoom}>
              <PhoneOff className="h-4 w-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Video Grid */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
              {/* Local Video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-700 flex items-center justify-center">
                  {localVideo ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {user ? getParticipantInitials(`${user.firstName} ${user.lastName}`) : "ME"}
                      </span>
                    </div>
                  ) : (
                    <VideoOff className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  You {!localAudio && <MicOff className="inline h-3 w-3 ml-1" />}
                </div>
              </div>

              {/* Participant Videos */}
              {selectedRoom.participants.map((participant) => (
                <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-700 flex items-center justify-center">
                    {participant.isVideoEnabled ? (
                      <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {getParticipantInitials(participant.name)}
                        </span>
                      </div>
                    ) : (
                      <VideoOff className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm flex items-center">
                    {participant.name}
                    {!participant.isAudioEnabled && <MicOff className="h-3 w-3 ml-1" />}
                    {participant.role === "instructor" && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Instructor
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-800 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">Participants ({selectedRoom.participants.length + 1})</h3>
                <div className="space-y-2">
                  {/* Current User */}
                  <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user ? getParticipantInitials(`${user.firstName} ${user.lastName}`) : "ME"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white text-sm">You {user?.role === "instructor" && "(Instructor)"}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {localVideo ? (
                        <Video className="h-4 w-4 text-green-400" />
                      ) : (
                        <VideoOff className="h-4 w-4 text-red-400" />
                      )}
                      {localAudio ? (
                        <Mic className="h-4 w-4 text-green-400" />
                      ) : (
                        <MicOff className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>

                  {/* Other Participants */}
                  {selectedRoom.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-3 p-2 bg-gray-700 rounded">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getParticipantInitials(participant.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          {participant.name} {participant.role === "instructor" && "(Instructor)"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {participant.isVideoEnabled ? (
                          <Video className="h-4 w-4 text-green-400" />
                        ) : (
                          <VideoOff className="h-4 w-4 text-red-400" />
                        )}
                        {participant.isAudioEnabled ? (
                          <Mic className="h-4 w-4 text-green-400" />
                        ) : (
                          <MicOff className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-4 flex items-center justify-center space-x-4">
          <Button
            variant={localAudio ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12"
          >
            {localAudio ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={localVideo ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12"
          >
            {localVideo ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={toggleScreenShare}
            className="rounded-full w-12 h-12"
            disabled={!selectedRoom.settings.allowScreenShare && user?.role !== "instructor"}
          >
            {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          </Button>

          {user?.role === "instructor" && (
            <>
              {!selectedRoom.isActive ? (
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => handleStartRoom(selectedRoom.id)}
                  className="rounded-full w-12 h-12 bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={() => handleEndRoom(selectedRoom.id)}
                  className="rounded-full w-12 h-12"
                >
                  <Square className="h-5 w-5" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Video Conferences</h2>
          <p className="text-gray-600">Create and join video conference rooms</p>
        </div>
        {user?.role === "instructor" && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Conference Room</DialogTitle>
                <DialogDescription>Set up a new video conference room for your course or meeting.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Room Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., CS101 Lecture"
                      value={newRoomData.name}
                      onChange={(e) => setNewRoomData({ ...newRoomData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="courseId">Course ID (Optional)</Label>
                    <Input
                      id="courseId"
                      placeholder="e.g., CS101"
                      value={newRoomData.courseId}
                      onChange={(e) => setNewRoomData({ ...newRoomData, courseId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the conference"
                    value={newRoomData.description}
                    onChange={(e) => setNewRoomData({ ...newRoomData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Room Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allowStudentVideo">Allow Student Video</Label>
                      <Switch
                        id="allowStudentVideo"
                        checked={newRoomData.allowStudentVideo}
                        onCheckedChange={(checked) => setNewRoomData({ ...newRoomData, allowStudentVideo: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allowStudentAudio">Allow Student Audio</Label>
                      <Switch
                        id="allowStudentAudio"
                        checked={newRoomData.allowStudentAudio}
                        onCheckedChange={(checked) => setNewRoomData({ ...newRoomData, allowStudentAudio: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allowScreenShare">Allow Screen Share</Label>
                      <Switch
                        id="allowScreenShare"
                        checked={newRoomData.allowScreenShare}
                        onCheckedChange={(checked) => setNewRoomData({ ...newRoomData, allowScreenShare: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="recordSession">Record Session</Label>
                      <Switch
                        id="recordSession"
                        checked={newRoomData.recordSession}
                        onCheckedChange={(checked) => setNewRoomData({ ...newRoomData, recordSession: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRoom} disabled={!newRoomData.name}>
                  Create Room
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Room List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Conference Rooms</h3>
            <p className="text-gray-600">
              {user?.role === "instructor"
                ? "Create your first conference room to start hosting video sessions."
                : "Conference rooms will appear here when instructors create them."}
            </p>
          </div>
        ) : (
          rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <Badge variant={room.isActive ? "default" : "secondary"}>{room.isActive ? "Live" : "Waiting"}</Badge>
                </div>
                <CardDescription>{room.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Participants</span>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {room.participants.length}/{room.settings.maxParticipants}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created</span>
                  <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                </div>

                {room.participants.length > 0 && (
                  <div className="flex -space-x-2">
                    {room.participants.slice(0, 3).map((participant) => (
                      <Avatar key={participant.id} className="h-8 w-8 border-2 border-white">
                        <AvatarFallback className="text-xs">{getParticipantInitials(participant.name)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {room.participants.length > 3 && (
                      <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                        <span className="text-xs text-gray-600">+{room.participants.length - 3}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Button onClick={() => handleJoinRoom(room)} className="flex-1">
                    Join Room
                  </Button>
                  {user?.id === room.instructorId && (
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
