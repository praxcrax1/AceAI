"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Brain, X } from "lucide-react"
import type { Document } from "@/types"

interface DocumentReaderProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
}

export function DocumentReader({ document: doc, isOpen, onClose }: DocumentReaderProps) {
  // Handle escape key to close reader
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !doc) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold truncate">{doc.filename}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Document Content */}
          <div className="flex-1 overflow-hidden">
            <iframe
              src={doc.cloudinaryUrl}
              title={doc.filename}
              className="w-full h-full border-0 rounded-b-lg"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  )
}