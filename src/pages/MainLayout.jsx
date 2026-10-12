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
      <SidebarInset className="flex flex-col min-w-0 bg-white text-slate-900">
        {/* Header Bar (Menyatu dengan Sidebar/Tema Gelap) */}
        <header className="sticky top-0 z-10 flex items-center gap-2 px-4 border-b shadow-md border-slate-800 h-14 shrink-0 bg-slate-950 text-slate-100">
          <SidebarTrigger className="-ml-1 text-slate-300 hover:text-white hover:bg-slate-800" />
          <Separator orientation="vertical" className="h-4 mr-2 bg-slate-800" />
          <span className="text-sm font-semibold tracking-wide text-slate-100">
            Dashboard POS System
          </span>
        </header>

        {/* Konten Halaman (Background Putih) */}
        <main className="flex-1 p-6 bg-white min-h-[calc(100vh-3.5rem)] text-slate-900">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}