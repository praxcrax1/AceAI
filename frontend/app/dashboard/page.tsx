"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ChatArea } from "@/components/chat-area"
import { AddSourcesDialog } from "@/components/add-sources-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Brain, Plus } from "lucide-react"
import type { Document } from "@/types"

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showAddSources, setShowAddSources] = useState(false)
  const [chatMessages, setChatMessages] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchDocuments()
    }
  }, [user])

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/documents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      if (data.documents) {
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error)
    }
  }

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document)
    setChatMessages([])
  }

  const handleDocumentUpload = (document: Document) => {
    setDocuments((prev) => [...prev, document])
    setShowAddSources(false)
  }

  const handleDocumentDelete = async (documentId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/documents/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.fileId !== documentId))
        if (selectedDocument?.fileId === documentId) {
          setSelectedDocument(null)
          setChatMessages([])
        }
      }
    } catch (error) {
      console.error("Failed to delete document:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold">AceAI</h1>
              {selectedDocument && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-lg text-muted-foreground truncate max-w-md">{selectedDocument.filename}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          documents={documents}
          selectedDocument={selectedDocument}
          onDocumentSelect={handleDocumentSelect}
          onDocumentDelete={handleDocumentDelete}
          onAddSources={() => setShowAddSources(true)}
        />

        {/* Main Content */}
        {selectedDocument ? (
          <ChatArea document={selectedDocument} messages={chatMessages} onMessagesChange={setChatMessages} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto" />
              <h2 className="text-2xl font-semibold text-muted-foreground">Welcome to AceAI</h2>
              <p className="text-muted-foreground max-w-md">
                Upload your first document to start chatting with your PDFs using AI
              </p>
              <Button onClick={() => setShowAddSources(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Sources
              </Button>
            </div>
          </div>
        )}
      </div>

      <AddSourcesDialog
        open={showAddSources}
        onOpenChange={setShowAddSources}
        onDocumentUpload={handleDocumentUpload}
      />
    </div>
  )
}
