"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dialog
} from "@/components/ui/dialog";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Home,
  FileText,
  MessageSquare,
  BarChart2,
  Settings,
  Upload,
  Search,
  Users,
  HelpCircle,
  Command
} from "lucide-react";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 border border-input"
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden md:inline-flex">Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/"))}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/documents"))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Documents</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/chat"))}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Chat</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/stats"))}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/settings"))}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/documents/upload"))}
            >
              <Upload className="mr-2 h-4 w-4" />
              <span>Upload Document</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => console.log("Create new chat"))}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>New Chat</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => console.log("Help"))}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
