export interface Document {
  _id: string
  userId: string
  filename: string
  cloudinaryUrl: string
  fileId: string
  pageCount: number
  chunksCount: number | null
  createdAt: string
  updatedAt: string
  processedAt: string
}

export interface ChatMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  sources?: {
    content: string
    metadata: {
      fileId: string
      filename: string
      "loc.lines.from": number
      "loc.lines.to": number
      "loc.pageNumber": number
      [key: string]: any
    }
  }[]
  sessionId?: string
  processingTime?: string
  cached?: boolean
}

export interface User {
  id: string
  email: string
}
