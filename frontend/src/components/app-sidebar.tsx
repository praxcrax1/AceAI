"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Sidebar as ShadcnSidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

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
  const pathname = usePathname()

  return (
    <ShadcnSidebar className="border-r border-sidebar-border min-h-screen h-full">
      <SidebarHeader className="p-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold">AceAI</span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link 
                href={item.href}
                data-active={pathname === item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors w-full",
                  pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </ShadcnSidebar>
  )
}
