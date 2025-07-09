"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FileText, Trash2, Calendar, FileIcon, Eye } from "lucide-react"
import type { Document } from "@/types"

interface SidebarProps {
  documents: Document[]
  selectedDocument: Document | null
  onDocumentSelect: (document: Document) => void
  onDocumentDelete: (documentId: string) => void
  onAddSources: () => void
  onViewDocument: (document: Document) => void // NEW
}

export function Sidebar({
  documents,
  selectedDocument,
  onDocumentSelect,
  onDocumentDelete,
  onAddSources,
  onViewDocument, // NEW
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDocuments = documents.filter((document) =>
    document.filename.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Recently added"
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return "Recently added"
    }
  }

  const formatFileSize = (pageCount: number) => {
    if (!pageCount) return ""
    return `${pageCount} page${pageCount !== 1 ? "s" : ""}`
  }

  const smartTruncateFilename = (filename: string) => {
    // Don't truncate if it's short enough
    if (filename.length <= 35) return filename

    const extension = filename.split(".").pop() || ""
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."))

    // Keep more of the beginning and show the extension
    const maxNameLength = 32 - extension.length
    if (nameWithoutExt.length > maxNameLength) {
      return `${nameWithoutExt.substring(0, maxNameLength)}...${extension}`
    }

    return filename
  }

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col h-full">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Sources</h2>
          <Badge variant="secondary" className="text-xs">
            {documents.length}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Button onClick={onAddSources} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 py-4">
          {filteredDocuments.map((document) => (
            <div
              key={document.fileId}
              className={`group relative flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                selectedDocument?.fileId === document.fileId
                  ? "bg-primary/5 border-primary/20 shadow-sm"
                  : "bg-background border-transparent hover:bg-muted/50 hover:border-muted-foreground/20"
              }`}
              onClick={() => onDocumentSelect(document)}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                  <FileIcon className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-medium leading-tight text-foreground break-words"
                      title={document.filename}
                      style={{ wordBreak: "break-word", hyphens: "auto" }}
                    >
                      {smartTruncateFilename(document.filename)}
                    </p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 hover:bg-muted-foreground/10 flex-shrink-0"
                      onClick={e => {
                        e.stopPropagation();
                        onViewDocument(document);
                      }}
                      title="View document"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Document</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{document.filename}"? This action cannot be undone and will
                            remove all associated chat history.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDocumentDelete(document.fileId)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(document.createdAt)}</span>
                  </div>
                  {document.pageCount && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{formatFileSize(document.pageCount)}</span>
                    </div>
                  )}
                </div>

                {document.processedAt && (
                  <Badge variant="outline" className="text-xs h-5 w-fit">
                    Processed
                  </Badge>
                )}
              </div>
            </div>
          ))}

          {filteredDocuments.length === 0 && documents.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No documents match your search</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}

          {documents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm font-medium mb-1">No documents yet</p>
              <p className="text-xs mb-4">Upload your first PDF to get started</p>
              <Button onClick={onAddSources} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
