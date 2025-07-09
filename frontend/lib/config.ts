export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export const config = {
  apiUrl: API_BASE_URL,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: ["application/pdf"],
}
