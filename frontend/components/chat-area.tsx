"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Send, Copy, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react"
import type { Document, ChatMessage } from "@/types"

interface ChatAreaProps {
  document: Document
  messages: ChatMessage[]
  onMessagesChange: (messages: ChatMessage[]) => void
}

export function ChatArea({ document, messages, onMessagesChange }: ChatAreaProps) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const suggestedQuestions = ["Summarize the main points", "What are the key findings?", "Explain the methodology"]

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    onMessagesChange(newMessages)
    setInput("")
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          question: input,
          fileId: document.fileId,
        }),
      })

      const data = await response.json()

      if (data.answer) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.answer,
          role: "assistant",
          timestamp: new Date(),
          sources: data.sources,
        }

        onMessagesChange([...newMessages, assistantMessage])
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="font-semibold">Chat</h2>
        <Button variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4 max-w-4xl">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Start a conversation about "{document.title || document.filename}"
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.map((question, index) => (
                  <Button key={index} variant="outline" size="sm" onClick={() => handleSuggestedQuestion(question)}>
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <Card
                className={`max-w-[80%] p-4 ${message.role === "user" ? "bg-primary text-primary-foreground" : ""}`}
              >
                <div className="prose prose-sm max-w-none">{message.content}</div>
                {message.role === "assistant" && (
                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    {message.sources && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {message.sources.length} source{message.sources.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                )}
              </Card>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Start typing..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={loading}
          />
          <Button onClick={handleSendMessage} disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {messages.length > 0 && (
          <div className="flex space-x-2 mt-2">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => handleSuggestedQuestion(question)}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
