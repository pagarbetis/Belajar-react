import {
  Home,
  ShoppingCart,
  ShoppingBag,
  ListSortDescending,
  Settings,
  User2,
  Users,
  ChevronUp,
  LogOut,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/Dashboard", icon: Home },
  { title: "Order", url: "/transaction", icon: ShoppingCart },
  { title: "Product", url: "/product", icon: ShoppingBag },
  { title: "Category", url: "/category", icon: ListSortDescending },
  { title: "User", url: "/user", icon: Users },
  { title: "Settings", url: "#", icon: Settings },
  { title: "Logout", url: "/login", icon: LogOut },
];

export function AppSidebar() {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-800 bg-slate-950 text-slate-100 !transition-all !duration-300 !ease-in-out"
    >
      <SidebarHeader className="py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center justify-center w-9 h-9 font-bold rounded-xl shrink-0 bg-blue-600 text-white shadow-lg shadow-blue-500/30 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8">
            <span className="text-xs">POS</span>
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-wide text-slate-100">
              PPKD JP
            </span>
            <span className="text-[11px] text-blue-400 font-medium">
              Point of Sales
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-slate-400 uppercase px-2 mb-2 group-data-[collapsible=icon]:hidden">
            Menu Navigasi
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={<Link to={item.url} />}
                    className="hover:bg-slate-800/60 hover:text-blue-400 text-slate-300 transition-all rounded-lg py-2.5 px-3 data-[active=true]:bg-blue-600 data-[active=true]:text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                  >
                    <item.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 shrink-0" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-slate-800/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Ujang Saklar"
              className="hover:bg-slate-800/60 text-slate-300 rounded-lg p-2.5 transition-all group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
            >
              <div className="flex items-center justify-center text-blue-400 border rounded-full w-7 h-7 bg-slate-800 border-slate-700 shrink-0">
                <User2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden min-w-0">
                <span className="text-xs font-semibold truncate text-slate-200">
                  Ujang Saklar
                </span>
                <span className="text-[10px] text-slate-400">Kasir Utama</span>
              </div>
              <ChevronUp className="ml-auto w-4 h-4 text-slate-400 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
