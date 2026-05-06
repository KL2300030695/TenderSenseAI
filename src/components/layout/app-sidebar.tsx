
"use client"

import {
  BarChart3,
  FileText,
  PlusCircle,
  ShieldCheck,
  Settings,
  LayoutDashboard,
  Search,
  LogOut,
  User as UserIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import Link from "next/link"
import {usePathname, useRouter} from "next/navigation"
import { useUser, useAuth, initiateSignOut } from "@/firebase"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "All Tenders",
    url: "/tenders",
    icon: FileText,
  },
  {
    title: "New Evaluation",
    url: "/tenders/new",
    icon: PlusCircle,
  },
  {
    title: "Audit History",
    url: "/history",
    icon: ShieldCheck,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAdmin } = useUser()
  const auth = useAuth()

  const handleSignOut = () => {
    if (auth) {
      initiateSignOut(auth)
      router.push('/login')
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-bold text-lg whitespace-nowrap">
              TenderSense AI
            </span>
            {isAdmin && <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Admin Portal</span>}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/search"} tooltip="Search">
                  <Link href="/search">
                    <Search />
                    <span>Search Docs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/settings"} tooltip="Settings">
                  <Link href="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2 bg-sidebar">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-3 py-2 group-data-[collapsible=icon]:px-1">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user?.photoURL || ""} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-bold truncate">{user?.displayName || user?.email?.split('@')[0] || "User"}</span>
                <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
