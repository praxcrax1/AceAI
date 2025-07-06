"use client";

import { useState } from "react";
import { Upload, FileText, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the upload process to your backend
    console.log("Files to upload:", files);
    
    // Mock successful upload
    alert("Files uploaded successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/documents">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to documents
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Upload Documents</CardTitle>
          <CardDescription>
            Upload PDF documents to chat with them using AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    Drag & drop files here or click to browse
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    PDF files only, up to 50MB each
                  </p>
                </div>
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
                    Select files
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </Label>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold">Selected Files:</h4>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                asChild
              >
                <Link href="/documents">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={files.length === 0}
              >
                Upload {files.length > 0 && `(${files.length} ${files.length === 1 ? "file" : "files"})`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
