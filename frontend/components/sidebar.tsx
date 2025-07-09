"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search } from "lucide-react"
import type { Document } from "@/types"

interface SidebarProps {
  documents: Document[]
  selectedDocument: Document | null
  onDocumentSelect: (document: Document) => void
  onAddSources: () => void
}

export function Sidebar({ documents, selectedDocument, onDocumentSelect, onAddSources }: SidebarProps) {
  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Sources</h2>
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={onAddSources} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="select-all" />
            <label htmlFor="select-all" className="text-sm font-medium">
              Select all sources
            </label>
          </div>

          <div className="space-y-2">
            {documents.map((document) => (
              <div
                key={document.fileId}
                className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-muted ${
                  selectedDocument?.fileId === document.fileId ? "bg-muted" : ""
                }`}
                onClick={() => onDocumentSelect(document)}
              >
                <Checkbox checked={selectedDocument?.fileId === document.fileId} onChange={() => {}} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
                      <span className="text-xs text-white font-bold">PDF</span>
                    </div>
                    <span className="text-sm font-medium truncate">{document.title || document.filename}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {documents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No sources added yet</p>
              <p className="text-xs mt-1">Click Add source above to add your first document</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
