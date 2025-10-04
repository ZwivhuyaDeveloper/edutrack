"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageCircle,
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
} from "lucide-react"

const conversations = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Mathematics Professor",
    lastMessage: "Don't forget about the quiz tomorrow",
    time: "2 min ago",
    unread: 2,
    avatar: "/avatars/teacher1.jpg",
    type: "teacher"
  },
  {
    id: 2,
    name: "Alex Chen",
    role: "Study Group",
    lastMessage: "The project deadline is approaching",
    time: "1 hour ago",
    unread: 0,
    avatar: "/avatars/student1.jpg",
    type: "student"
  },
  {
    id: 3,
    name: "Physics Study Group",
    role: "Group Chat",
    lastMessage: "Who wants to review chapter 5?",
    time: "3 hours ago",
    unread: 5,
    avatar: "/avatars/group1.jpg",
    type: "group"
  },
  {
    id: 4,
    name: "Dr. Michael Brown",
    role: "Physics Professor",
    lastMessage: "Great work on the lab report!",
    time: "1 day ago",
    unread: 0,
    avatar: "/avatars/teacher2.jpg",
    type: "teacher"
  }
]

const messages = [
  {
    id: 1,
    sender: "Dr. Sarah Johnson",
    content: "Hi! I wanted to remind you about the calculus quiz scheduled for tomorrow.",
    time: "10:30 AM",
    type: "received"
  },
  {
    id: 2,
    sender: "You",
    content: "Thank you for the reminder! I've been reviewing the material. Is there anything specific I should focus on?",
    time: "10:32 AM",
    type: "sent"
  },
  {
    id: 3,
    sender: "Dr. Sarah Johnson",
    content: "Focus on derivatives and integration rules. There will be both theoretical and practical problems.",
    time: "10:35 AM",
    type: "received"
  },
  {
    id: 4,
    sender: "Dr. Sarah Johnson",
    content: "Don't forget about the quiz tomorrow",
    time: "2 min ago",
    type: "received"
  }
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState("")

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Conversations List */}
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
          <CardDescription>
            Stay connected with teachers and classmates
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 ${
                    selectedConversation.id === conversation.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.avatar} />
                      <AvatarFallback>
                        {conversation.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate">{conversation.name}</h4>
                        <span className="text-xs text-muted-foreground">
                          {conversation.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {conversation.role}
                        </Badge>
                        {conversation.unread > 0 && (
                          <Badge className="bg-blue-500 text-white text-xs">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation.avatar} />
                <AvatarFallback>
                  {selectedConversation.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{selectedConversation.name}</CardTitle>
                <CardDescription>{selectedConversation.role}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Video className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col h-[500px]">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "sent" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.type === "sent"
                        ? "bg-blue-500 text-white"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className={`text-xs ${
                      message.type === "sent" ? "text-blue-100" : "text-muted-foreground"
                    }`}>
                      {message.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}