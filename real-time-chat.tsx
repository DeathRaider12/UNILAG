"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Send,
  Search,
  Plus,
  MessageCircle,
  Users,
  Hash,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
} from "lucide-react"
import { chatService, type ChatConversation, type TypingIndicator } from "@/lib/chat-service"
import { useAuth } from "@/hooks/use-auth"

export function RealTimeChat() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([])
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const [newChatData, setNewChatData] = useState({
    name: "",
    type: "group" as "direct" | "group" | "course",
    participants: [] as string[],
  })

  useEffect(() => {
    const unsubscribeConversations = chatService.subscribe(setConversations)
    const unsubscribeTyping = chatService.subscribeToTyping(setTypingIndicators)

    if (user) {
      loadConversations()
    }

    return () => {
      unsubscribeConversations()
      unsubscribeTyping()
    }
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  const loadConversations = () => {
    if (!user) return
    const userConversations = chatService.getUserConversations(user.id)
    setConversations(userConversations)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!user || !selectedConversation || !message.trim()) return

    const result = await chatService.sendMessage(
      selectedConversation.id,
      user.id,
      `${user.firstName} ${user.lastName}`,
      message.trim(),
    )

    if (result.success) {
      setMessage("")
      setIsTyping(false)
      await chatService.setTyping(selectedConversation.id, user.id, `${user.firstName} ${user.lastName}`, false)
    }
  }

  const handleTyping = async (value: string) => {
    setMessage(value)

    if (!user || !selectedConversation) return

    if (value.trim() && !isTyping) {
      setIsTyping(true)
      await chatService.setTyping(selectedConversation.id, user.id, `${user.firstName} ${user.lastName}`, true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(async () => {
      if (isTyping) {
        setIsTyping(false)
        await chatService.setTyping(selectedConversation.id, user.id, `${user.firstName} ${user.lastName}`, false)
      }
    }, 1000)
  }

  const handleCreateConversation = async () => {
    if (!user) return

    const result = await chatService.createConversation(
      newChatData.name,
      newChatData.type,
      newChatData.participants,
      user.id,
    )

    if (result.success) {
      setShowCreateDialog(false)
      setNewChatData({
        name: "",
        type: "group",
        participants: [],
      })
    }
  }

  const handleSelectConversation = async (conversation: ChatConversation) => {
    setSelectedConversation(conversation)
    if (user) {
      await chatService.markAsRead(conversation.id, user.id)
    }
  }

  const getConversationIcon = (conversation: ChatConversation) => {
    switch (conversation.type) {
      case "direct":
        return <MessageCircle className="h-4 w-4" />
      case "group":
        return <Users className="h-4 w-4" />
      case "course":
        return <Hash className="h-4 w-4" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  const getParticipantInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString()
    }
  }

  const currentTypingIndicators = selectedConversation
    ? typingIndicators.filter((t) => t.conversationId === selectedConversation.id && t.userId !== user?.id)
    : []

  return (
    <div className="h-[600px] flex border rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r bg-gray-50">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Conversation</DialogTitle>
                  <DialogDescription>Create a new chat conversation</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chatName">Conversation Name</Label>
                    <Input
                      id="chatName"
                      placeholder="e.g., Study Group, Project Team"
                      value={newChatData.name}
                      onChange={(e) => setNewChatData({ ...newChatData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <div className="flex space-x-4">
                      {[
                        { value: "group", label: "Group Chat" },
                        { value: "course", label: "Course Channel" },
                      ].map((type) => (
                        <label key={type.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="chatType"
                            value={type.value}
                            checked={newChatData.type === type.value}
                            onChange={(e) => setNewChatData({ ...newChatData, type: e.target.value as any })}
                          />
                          <span>{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateConversation} disabled={!newChatData.name}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-sm text-gray-600">Start a new conversation to begin chatting</p>
              </div>
            ) : (
              conversations
                .filter((conv) => searchQuery === "" || conv.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? "bg-blue-100 border border-blue-200"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {conversation.type === "direct" ? (
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{getParticipantInitials(conversation.name)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {getConversationIcon(conversation)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">{conversation.name}</p>
                          {conversation.lastMessage && (
                            <p className="text-xs text-gray-500">
                              {formatMessageTime(conversation.lastMessage.timestamp)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage?.content || "No messages yet"}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {selectedConversation.type === "direct" ? (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getParticipantInitials(selectedConversation.name)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {getConversationIcon(selectedConversation)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedConversation.name}</h3>
                    <p className="text-sm text-gray-600">{selectedConversation.participants.length} participants</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedConversation.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                        msg.senderId === user?.id ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {msg.senderId !== user?.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{getParticipantInitials(msg.senderName)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          msg.senderId === user?.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        {msg.senderId !== user?.id && <p className="text-xs font-medium mb-1">{msg.senderName}</p>}
                        <p className="text-sm">{msg.content}</p>
                        <div
                          className={`flex items-center justify-end mt-1 space-x-1 ${
                            msg.senderId === user?.id ? "text-blue-200" : "text-gray-500"
                          }`}
                        >
                          <span className="text-xs">{formatMessageTime(msg.timestamp)}</span>
                          {msg.senderId === user?.id &&
                            (msg.isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicators */}
                {currentTypingIndicators.length > 0 && (
                  <div className="flex justify-start">
                    <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getParticipantInitials(currentTypingIndicators[0].userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-200 text-gray-900 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 ml-2">
                            {currentTypingIndicators[0].userName} is typing...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="pr-10"
                  />
                  <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handleSendMessage} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
