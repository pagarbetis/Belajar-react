import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/AppSidebar";

export default function MainLayout() {
  return (
    <SidebarProvider>
      {/* Sidebar Navigasi */}
      <AppSidebar />

      {/* Konten Utama */}
      <SidebarInset className="min-w-0">
        {/* Header Bar */}
        <header className="flex items-center gap-2 px-4 border-b shadow-md hsa h-14 shrink-0 bg-background">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mr-2" />
          <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
        </header>

        {/* Konten Halaman */}
        <main className="flex-1 p-6 bg-muted/20">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}