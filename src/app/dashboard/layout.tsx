
import * as React from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search } from "@/components/search"
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DashboardNav } from "@/components/dashboard-nav"
import { logout } from "@/lib/data"
import { User as UserIcon } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/80 dark:bg-slate-950/40">
        <Sidebar className="border-r border-slate-200 dark:border-slate-800">
          <DashboardNav />
        </Sidebar>
        <div className="flex flex-1 flex-col">
          {/* High-fidelity Glassmorphic Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-background/70 backdrop-blur-md px-4 sm:px-6 shadow-sm">
            <SidebarTrigger className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors" />
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="flex-1 max-w-md hidden sm:block">
              <Search />
            </div>
            
            <div className="flex items-center gap-4 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="overflow-hidden rounded-full ml-auto hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 p-0.5 border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-xs font-semibold">
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 border border-slate-200 dark:border-slate-800 shadow-lg rounded-xl p-1 bg-background">
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                  <DropdownMenuItem asChild className="rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-sm">
                    <Link href="/dashboard/settings" className="flex items-center gap-2 w-full text-slate-700 dark:text-slate-300">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-sm flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                  <DropdownMenuItem asChild className="rounded-lg px-3 py-2 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
                    <form action={logout} className="w-full">
                      <button type="submit" className="w-full text-left font-medium">Logout</button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          {/* Main Dashboard Content Area */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-500">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
