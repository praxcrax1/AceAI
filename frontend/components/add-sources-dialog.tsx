"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload } from "lucide-react"
import type { Document } from "@/types"

interface AddSourcesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDocumentUpload: (document: Document) => void
}

export function AddSourcesDialog({ open, onOpenChange, onDocumentUpload }: AddSourcesDialogProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes("pdf")) {
      setError("Only PDF files are supported")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("pdf", file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/upload/file`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        const document: Document = {
          _id: data._id || "",
          userId: data.userId || "",
          filename: file.name,
          cloudinaryUrl: data.fileUrl || "",
          fileId: data.fileId,
          pageCount: data.pageCount || 0,
          chunksCount: data.chunksCount || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          processedAt: data.processedAt || new Date().toISOString(),
        }
        onDocumentUpload(document)
      } else {
        setError(data.error || "Upload failed")
      }
    } catch {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleLinkUpload = async () => {
    if (!linkUrl.trim()) {
      setError("Please enter a valid URL")
      return
    }

    setUploading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/upload/link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ url: linkUrl }),
      })

      const data = await response.json()

      if (data.success) {
        const document: Document = {
          _id: data._id || "",
          userId: data.userId || "",
          filename: linkUrl.split("/").pop() || "Document",
          cloudinaryUrl: data.fileUrl || "",
          fileId: data.fileId,
          pageCount: data.pageCount || 0,
          chunksCount: data.chunksCount || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          processedAt: data.processedAt || new Date().toISOString(),
        }
        onDocumentUpload(document)
        setLinkUrl("")
      } else {
        setError(data.error || "Upload failed")
      }
    } catch {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogTitle>Add Source</DialogTitle>
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Sources let AceAI base its responses on the information that matters most to you.
            <br />
            (Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.)
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="link">From Link</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center space-y-4 hover:border-muted-foreground/50 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-primary mx-auto" />
                <div>
                  <h3 className="text-lg font-medium">Upload sources</h3>
                  <p className="text-muted-foreground">
                    Drag & drop or <span className="text-primary cursor-pointer hover:underline">choose file</span> to
                    upload
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Supported file types: PDF (max 10MB)</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                className="hidden"
              />
            </TabsContent>

            <TabsContent value="link" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="link-url">PDF URL</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      id="link-url"
                      placeholder="https://example.com/document.pdf"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                    />
                    <Button onClick={handleLinkUpload} disabled={uploading || !linkUrl.trim()}>
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {uploading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Processing document...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
