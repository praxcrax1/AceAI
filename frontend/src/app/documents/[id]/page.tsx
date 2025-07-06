"use client";

import { useState } from "react";
import { ArrowLeft, Download, MessageSquare, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface DocumentPageProps {
  params: {
    id: string;
  };
}

export default function DocumentPage({ params }: DocumentPageProps) {
  const { id } = params;
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mock document data
  const document = {
    id,
    title: "Annual Report 2025",
    type: "PDF",
    pages: 24,
    date: "July 5, 2025",
    // This would be actual document content in a real implementation
    content: Array.from({ length: 24 }, (_, i) => ({
      pageNumber: i + 1,
      // In a real app, this would be the actual page content
      text: `This is page ${i + 1} of the document. In a real implementation, this would display the actual document content.`,
    })),
  };

  const nextPage = () => {
    if (currentPage < document.pages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/documents">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{document.title}</h1>
            <p className="text-sm text-muted-foreground">
              {document.type} • {document.pages} pages • {document.date}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/chat/${id}`}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat with Document
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator />

      {/* Document Viewer */}
      <div className="flex flex-col items-center">
        {/* Page Navigation */}
        <div className="mb-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {document.pages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={nextPage}
            disabled={currentPage === document.pages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Document Page */}
        <Card className="p-8 max-w-3xl w-full min-h-[600px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium mb-4">Page {currentPage}</p>
            <p className="text-muted-foreground">
              {document.content[currentPage - 1]?.text}
            </p>
            <p className="mt-8 text-sm text-muted-foreground">
              In a real implementation, this would display the actual document content
              using a PDF viewer library like PDF.js or react-pdf.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
