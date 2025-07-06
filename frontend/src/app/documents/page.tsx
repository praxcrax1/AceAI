"use client"

import { useState } from "react";
import { 
  FileText, 
  MoreHorizontal, 
  Search, 
  SlidersHorizontal,
  Plus
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for documents
const documents = [
  {
    id: "1",
    title: "Annual Report",
    type: "PDF",
    pages: 24,
    date: "July 5, 2025",
  },
  {
    id: "2",
    title: "Research Paper",
    type: "PDF",
    pages: 15,
    date: "July 3, 2025",
  },
  {
    id: "3",
    title: "User Manual",
    type: "PDF",
    pages: 56,
    date: "July 1, 2025",
  },
  {
    id: "4",
    title: "Specifications",
    type: "PDF",
    pages: 8,
    date: "June 28, 2025",
  },
];

export default function DocumentsPage() {
  const [view, setView] = useState("grid");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Documents</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/documents/upload">
              <Plus className="mr-2 h-4 w-4" />
              Upload
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="icon">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
        <Tabs defaultValue="grid" className="w-auto" onValueChange={setView}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="overflow-hidden">
              <div className="aspect-[3/4] relative bg-muted/20 flex items-center justify-center">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold line-clamp-1">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {doc.type} • {doc.pages} pages
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/chat/${doc.id}`}>Chat with document</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{doc.date}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/documents/${doc.id}`}>Preview</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/chat/${doc.id}`}>Chat</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors">
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Document
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Type
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Pages
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{doc.title}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">{doc.type}</td>
                    <td className="p-4 align-middle">{doc.pages}</td>
                    <td className="p-4 align-middle">{doc.date}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/documents/${doc.id}`}>View</Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/chat/${doc.id}`}>Chat</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
