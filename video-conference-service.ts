"use client"

export interface ConferenceRoom {
  id: string
  name: string
  description: string
  instructorId: string
  courseId?: string
  isActive: boolean
  participants: Participant[]
  settings: RoomSettings
  createdAt: string
  startedAt?: string
  endedAt?: string
}

export interface Participant {
  id: string
  userId: string
  name: string
  role: "instructor" | "student"
  joinedAt: string
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isScreenSharing: boolean
  connectionStatus: "connected" | "connecting" | "disconnected"
}

export interface RoomSettings {
  maxParticipants: number
  allowStudentVideo: boolean
  allowStudentAudio: boolean
  allowScreenShare: boolean
  recordSession: boolean
  requireApproval: boolean
}

class VideoConferenceService {
  private static instance: VideoConferenceService
  private rooms: ConferenceRoom[] = []
  private listeners: ((rooms: ConferenceRoom[]) => void)[] = []

  static getInstance(): VideoConferenceService {
    if (!VideoConferenceService.instance) {
      VideoConferenceService.instance = new VideoConferenceService()
    }
    return VideoConferenceService.instance
  }

  subscribe(listener: (rooms: ConferenceRoom[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.rooms))
  }

  async createRoom(
    instructorId: string,
    name: string,
    description: string,
    courseId?: string,
    settings?: Partial<RoomSettings>,
  ): Promise<{ success: boolean; room?: ConferenceRoom; error?: string }> {
    try {
      const room: ConferenceRoom = {
        id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        instructorId,
        courseId,
        isActive: false,
        participants: [],
        settings: {
          maxParticipants: 50,
          allowStudentVideo: true,
          allowStudentAudio: true,
          allowScreenShare: false,
          recordSession: false,
          requireApproval: false,
          ...settings,
        },
        createdAt: new Date().toISOString(),
      }

      this.rooms.push(room)
      this.notify()

      return { success: true, room }
    } catch (error) {
      return { success: false, error: "Failed to create conference room" }
    }
  }

  async joinRoom(
    roomId: string,
    userId: string,
    userName: string,
    userRole: "instructor" | "student",
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const room = this.rooms.find((r) => r.id === roomId)
      if (!room) {
        return { success: false, error: "Room not found" }
      }

      if (!room.isActive && userRole !== "instructor") {
        return { success: false, error: "Room is not active" }
      }

      const existingParticipant = room.participants.find((p) => p.userId === userId)
      if (existingParticipant) {
        return { success: false, error: "Already in room" }
      }

      if (room.participants.length >= room.settings.maxParticipants) {
        return { success: false, error: "Room is full" }
      }

      const participant: Participant = {
        id: `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        name: userName,
        role: userRole,
        joinedAt: new Date().toISOString(),
        isVideoEnabled: room.settings.allowStudentVideo || userRole === "instructor",
        isAudioEnabled: room.settings.allowStudentAudio || userRole === "instructor",
        isScreenSharing: false,
        connectionStatus: "connected",
      }

      room.participants.push(participant)
      this.notify()

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to join room" }
    }
  }

  async leaveRoom(roomId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const room = this.rooms.find((r) => r.id === roomId)
      if (!room) {
        return { success: false, error: "Room not found" }
      }

      room.participants = room.participants.filter((p) => p.userId !== userId)
      this.notify()

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to leave room" }
    }
  }

  async startRoom(roomId: string, instructorId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const room = this.rooms.find((r) => r.id === roomId && r.instructorId === instructorId)
      if (!room) {
        return { success: false, error: "Room not found or unauthorized" }
      }

      room.isActive = true
      room.startedAt = new Date().toISOString()
      this.notify()

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to start room" }
    }
  }

  async endRoom(roomId: string, instructorId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const room = this.rooms.find((r) => r.id === roomId && r.instructorId === instructorId)
      if (!room) {
        return { success: false, error: "Room not found or unauthorized" }
      }

      room.isActive = false
      room.endedAt = new Date().toISOString()
      room.participants = []
      this.notify()

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to end room" }
    }
  }

  getRooms(): ConferenceRoom[] {
    return this.rooms
  }

  getRoom(roomId: string): ConferenceRoom | undefined {
    return this.rooms.find((r) => r.id === roomId)
  }

  getUserRooms(userId: string): ConferenceRoom[] {
    return this.rooms.filter((r) => r.instructorId === userId || r.participants.some((p) => p.userId === userId))
  }
}

export const videoConferenceService = VideoConferenceService.getInstance()
