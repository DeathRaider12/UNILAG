"use client"

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  type: "text" | "file" | "image" | "system"
  timestamp: string
  isRead: boolean
  replyTo?: string
}

export interface ChatConversation {
  id: string
  name: string
  type: "direct" | "group" | "course"
  participants: string[]
  messages: ChatMessage[]
  lastMessage?: ChatMessage
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export interface TypingIndicator {
  userId: string
  userName: string
  conversationId: string
  timestamp: string
}

class ChatService {
  private static instance: ChatService
  private conversations: ChatConversation[] = []
  private typingIndicators: TypingIndicator[] = []
  private listeners: ((conversations: ChatConversation[]) => void)[] = []
  private typingListeners: ((indicators: TypingIndicator[]) => void)[] = []

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService()
    }
    return ChatService.instance
  }

  subscribe(listener: (conversations: ChatConversation[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  subscribeToTyping(listener: (indicators: TypingIndicator[]) => void) {
    this.typingListeners.push(listener)
    return () => {
      this.typingListeners = this.typingListeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.conversations))
  }

  private notifyTyping() {
    this.typingListeners.forEach((listener) => listener(this.typingIndicators))
  }

  async createConversation(
    name: string,
    type: "direct" | "group" | "course",
    participants: string[],
    createdBy: string,
  ): Promise<{ success: boolean; conversation?: ChatConversation; error?: string }> {
    try {
      const conversation: ChatConversation = {
        id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        type,
        participants: [...participants, createdBy],
        messages: [],
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      this.conversations.push(conversation)
      this.notify()

      return { success: true, conversation }
    } catch (error) {
      return { success: false, error: "Failed to create conversation" }
    }
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
    type: "text" | "file" | "image" = "text",
    replyTo?: string,
  ): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
    try {
      const conversation = this.conversations.find((c) => c.id === conversationId)
      if (!conversation) {
        return { success: false, error: "Conversation not found" }
      }

      if (!conversation.participants.includes(senderId)) {
        return { success: false, error: "Not a participant in this conversation" }
      }

      const message: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId,
        senderName,
        content,
        type,
        timestamp: new Date().toISOString(),
        isRead: false,
        replyTo,
      }

      conversation.messages.push(message)
      conversation.lastMessage = message
      conversation.updatedAt = new Date().toISOString()

      // Update unread count for other participants
      conversation.participants.forEach((participantId) => {
        if (participantId !== senderId) {
          conversation.unreadCount += 1
        }
      })

      // Remove typing indicator for sender
      this.typingIndicators = this.typingIndicators.filter(
        (t) => t.userId !== senderId || t.conversationId !== conversationId,
      )

      this.notify()
      this.notifyTyping()

      return { success: true, message }
    } catch (error) {
      return { success: false, error: "Failed to send message" }
    }
  }

  async markAsRead(conversationId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const conversation = this.conversations.find((c) => c.id === conversationId)
      if (!conversation) {
        return { success: false, error: "Conversation not found" }
      }

      if (!conversation.participants.includes(userId)) {
        return { success: false, error: "Not a participant in this conversation" }
      }

      conversation.messages.forEach((message) => {
        if (message.senderId !== userId) {
          message.isRead = true
        }
      })

      conversation.unreadCount = 0
      this.notify()

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to mark as read" }
    }
  }

  async setTyping(conversationId: string, userId: string, userName: string, isTyping: boolean): Promise<void> {
    if (isTyping) {
      const existingIndicator = this.typingIndicators.find(
        (t) => t.userId === userId && t.conversationId === conversationId,
      )

      if (!existingIndicator) {
        this.typingIndicators.push({
          userId,
          userName,
          conversationId,
          timestamp: new Date().toISOString(),
        })
      }
    } else {
      this.typingIndicators = this.typingIndicators.filter(
        (t) => t.userId !== userId || t.conversationId !== conversationId,
      )
    }

    this.notifyTyping()

    // Auto-remove typing indicator after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        this.typingIndicators = this.typingIndicators.filter(
          (t) => t.userId !== userId || t.conversationId !== conversationId,
        )
        this.notifyTyping()
      }, 3000)
    }
  }

  getConversations(): ChatConversation[] {
    return this.conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  getUserConversations(userId: string): ChatConversation[] {
    return this.conversations
      .filter((c) => c.participants.includes(userId))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  getConversation(conversationId: string): ChatConversation | undefined {
    return this.conversations.find((c) => c.id === conversationId)
  }

  getTypingIndicators(conversationId: string): TypingIndicator[] {
    return this.typingIndicators.filter((t) => t.conversationId === conversationId)
  }

  searchMessages(query: string, userId: string): ChatMessage[] {
    const userConversations = this.getUserConversations(userId)
    const allMessages: ChatMessage[] = []

    userConversations.forEach((conversation) => {
      conversation.messages.forEach((message) => {
        if (message.content.toLowerCase().includes(query.toLowerCase())) {
          allMessages.push(message)
        }
      })
    })

    return allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }
}

export const chatService = ChatService.getInstance()
