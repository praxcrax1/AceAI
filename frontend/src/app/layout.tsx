import type { Metadata } from "next";
import "./globals.css";
import {Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/user-nav";
import { CommandMenu } from "@/components/command-menu";
import { Home, FileText, MessageSquare, BarChart2, Settings } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { 
  SidebarProvider,
  SidebarTrigger 
} from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AceAI - Document Intelligence",
  description: "Chat with your documents using advanced AI",
};

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: "/documents",
    label: "Documents",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    href: "/chat",
    label: "Chat",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    href: "/stats",
    label: "Stats",
    icon: <BarChart2 className="h-5 w-5" />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen">
            <SidebarProvider defaultOpen>
              <Sidebar navItems={navItems} />
              <div className="flex flex-col flex-1">
                <header className="border-b sticky top-0 z-10 bg-background">
                  <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center">
                      <SidebarTrigger className="mr-2 md:hidden" />
                      <CommandMenu />
                    </div>
                    <div className="flex items-center gap-4">
                      <ModeToggle />
                      <UserNav />
                    </div>
                  </div>
                </header>
                <main className="container mx-auto p-4 md:p-6 flex-1">{children}</main>
              </div>
            </SidebarProvider>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
