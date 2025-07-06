"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useState } from "react"

interface NavItemProps {
  href: string
  label: string
  icon: React.ReactNode
}

const NavItem = ({ href, label, icon }: NavItemProps) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      {icon}
      {label}
    </Link>
  )
}

interface SidebarProps {
  navItems: {
    href: string
    label: string
    icon: React.ReactNode
  }[]
}

export function Sidebar({ navItems }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden h-screen border-r bg-sidebar text-sidebar-foreground border-sidebar-border md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col px-4 py-4">
          <Link href="/" className="flex items-center gap-2 mb-10 px-2">
            <span className="text-2xl font-bold">AceAI</span>
          </Link>
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="w-10 h-10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-sidebar text-sidebar-foreground border-sidebar-border">
            <Link href="/" className="flex items-center gap-2 mb-10">
              <span className="text-2xl font-bold">AceAI</span>
            </Link>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
