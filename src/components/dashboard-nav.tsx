
"use client"
import Link from "next/link"
import * as React from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Banknote,
  ClipboardList,
  Settings,
  GraduationCap,
  FileText,
  Users2
} from "lucide-react"
import { getSettings } from "@/lib/data"
import type { SchoolSettings } from "@/lib/types"

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/classes", label: "Classes", icon: BookOpen },
  { href: "/dashboard/students", label: "Students", icon: Users },
  { href: "/dashboard/accounting", label: "Accounting", icon: Banknote },
  { href: "/dashboard/exams", label: "Exams", icon: FileText },
  { href: "/dashboard/results", label: "Results", icon: ClipboardList },
  { href: "/dashboard/users", label: "Users", icon: Users2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function DashboardNav() {
  const pathname = usePathname();
  const [settings, setSettings] = React.useState<SchoolSettings | null>(null);

  React.useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            {settings?.schoolLogoUrl ? (
                <Image src={settings.schoolLogoUrl} alt="School Logo" width={24} height={24} className="rounded-sm" />
            ) : (
                <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
            )}
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">{settings?.schoolName || 'Bluebells ERP'}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  )
}
