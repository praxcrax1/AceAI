"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Mic, Users, StickyNote, BookOpen, HelpCircle, Clock, Plus } from "lucide-react"
import type { Document } from "@/types"

interface StudioPanelProps {
  document: Document
}

export function StudioPanel({ document }: StudioPanelProps) {
  return (
    <div className="w-80 border-l bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Studio</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Audio Overview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Mic className="h-4 w-4" />
                <CardTitle className="text-sm">Audio Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground mb-3">Create an Audio Overview in more languages!</p>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Customize
                </Button>
                <Button size="sm" className="flex-1">
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Deep Dive Conversation */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <CardTitle className="text-sm">Deep Dive conversation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Two hosts</p>
            </CardContent>
          </Card>

          <Separator />

          {/* Notes Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <StickyNote className="h-4 w-4" />
                <h3 className="text-sm font-medium">Notes</h3>
              </div>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Study guide
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Briefing doc
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQ
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Timeline
              </Button>
            </div>
          </div>

          <Separator />

          {/* Document Summary */}
          <div>
            <h3 className="text-sm font-medium mb-3">Document Summary</h3>
            <div className="space-y-3">
              <Card className="p-3">
                <div className="flex items-start space-x-2">
                  <BookOpen className="h-4 w-4 mt-0.5 text-orange-500" />
                  <div>
                    <h4 className="text-xs font-medium">Key Concepts</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      The main concepts and principles covered in this document...
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-start space-x-2">
                  <BookOpen className="h-4 w-4 mt-0.5 text-orange-500" />
                  <div>
                    <h4 className="text-xs font-medium">Important Applications</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Real-world applications and use cases discussed...
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
