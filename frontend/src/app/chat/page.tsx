import { MessageSquare, Search, Clock, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock chat history data
const chatSessions = [
  {
    id: "1",
    documentTitle: "Annual Report 2025",
    lastMessage: "What were the main challenges mentioned?",
    date: "July 5, 2025",
    time: "14:30",
    messages: 12,
  },
  {
    id: "2",
    documentTitle: "Research Paper",
    lastMessage: "Summarize the methodology section",
    date: "July 4, 2025",
    time: "10:15",
    messages: 8,
  },
  {
    id: "3",
    documentTitle: "User Manual",
    lastMessage: "How do I configure the network settings?",
    date: "July 2, 2025",
    time: "16:45",
    messages: 15,
  },
  {
    id: "4",
    documentTitle: "Specifications",
    lastMessage: "What are the power requirements?",
    date: "June 30, 2025",
    time: "09:20",
    messages: 6,
  },
  {
    id: "5",
    documentTitle: "Annual Report 2025",
    lastMessage: "Compare Q2 and Q3 performance",
    date: "June 28, 2025",
    time: "11:05",
    messages: 10,
  },
];

export default function ChatHistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chat History</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search chat history..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Last Message</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chatSessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  <div className="font-medium">{session.documentTitle}</div>
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {session.lastMessage}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {session.date} at {session.time}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{session.messages}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/chat/${session.id}`}>
                        <MessageSquare className="h-4 w-4" />
                        <span className="sr-only">View chat</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete chat</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
