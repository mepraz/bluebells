"use client"
import Link from "next/link"
import * as React from "react"
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
  Users2,
  ChevronRight
} from "lucide-react"
import { getSettings } from "@/lib/data"
import type { SchoolSettings, User } from "@/lib/types"
import { useSession } from "@/hooks/use-session"

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const allMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['admin', 'accountant', 'exam'] },
  { href: "/dashboard/classes", label: "Classes", icon: BookOpen, roles: ['admin', 'exam'] },
  { href: "/dashboard/students", label: "Students", icon: Users, roles: ['admin', 'exam'] },
  { href: "/dashboard/accounting", label: "Accounting", icon: Banknote, roles: ['admin', 'accountant'] },
  { href: "/dashboard/exams", label: "Exams", icon: FileText, roles: ['admin', 'exam'] },
  { href: "/dashboard/results", label: "Results", icon: ClipboardList, roles: ['admin', 'exam'] },
  { href: "/dashboard/users", label: "Users", icon: Users2, roles: ['admin'] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ['admin'] },
]

export function DashboardNav() {
  const pathname = usePathname();
  const [settings, setSettings] = React.useState<SchoolSettings | null>(null);
  const { session } = useSession();
  
  React.useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const userRole = session?.role;

  const menuItems = React.useMemo(() => {
    if (!userRole) return [];
    return allMenuItems.filter(item => item.roles.includes(userRole));
  }, [userRole]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 border-r border-slate-800">
      <SidebarHeader className="p-4 border-b border-slate-850">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30 animate-pulse">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-100 tracking-wide truncate">
              {settings?.schoolName || 'Bluebells ERP'}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
              School Manager
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild 
                  isActive={active} 
                  tooltip={item.label}
                  className={`
                    w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group
                    ${active 
                      ? "bg-indigo-600/90 text-white shadow-md shadow-indigo-600/20" 
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                    }
                  `}
                >
                  <Link href={item.href} className="flex items-center w-full">
                    <item.icon className={`h-4 w-4 mr-3 shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-100"}`} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {active && <ChevronRight className="h-3 w-3 text-white/70" />}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-850 mt-auto bg-slate-950">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800">
          <Avatar className="h-9 w-9 ring-2 ring-indigo-500/20">
            <AvatarFallback className="bg-indigo-950 text-indigo-400 font-semibold text-xs uppercase">
              {session?.username?.substring(0, 2) || 'AD'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-100 truncate">{session?.username || 'Administrator'}</span>
            <span className="text-[10px] text-indigo-400 font-medium capitalize">{session?.role || 'Admin'}</span>
          </div>
        </div>
      </SidebarFooter>
    </div>
  )
}

