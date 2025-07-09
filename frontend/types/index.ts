export interface Document {
  fileId: string
  filename: string
  title?: string
  description?: string
  tags?: string[]
  fileUrl: string
  uploadedAt: string
}

export interface ChatMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  sources?: any[]
}

export interface User {
  id: string
  email: string
}
