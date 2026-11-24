import { useEffect, useMemo, useState } from "react";
import {
  Home,
  ShoppingCart,
  ShoppingBag,
  ListSortDescending,
  Settings,
  User2,
  Users,
  LogOut,
} from "lucide-react";

import Swal from "sweetalert2";

import { Link, useNavigate } from "react-router-dom";

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

const SETTINGS_KEY = "warung_madara_settings";
const DEFAULT_STORE_NAME = "Warung Madara";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    roles: ["ADMIN"],
  },
  {
    title: "Order",
    url: "/transaction",
    icon: ShoppingCart,
    roles: ["ADMIN", "CASHIER"],
  },
  {
    title: "Product",
    url: "/product",
    icon: ShoppingBag,
    roles: ["ADMIN"],
  },
  {
    title: "Category",
    url: "/category",
    icon: ListSortDescending,
    roles: ["ADMIN"],
  },
  {
    title: "User",
    url: "/user",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
  {
    title: "Logout",
    url: "/login",
    icon: LogOut,
    isLogout: true,
    roles: ["ADMIN", "CASHIER"],
  },
];

const getStoredStoreName = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_STORE_NAME;
    const parsed = JSON.parse(raw);
    const name = String(parsed?.storeName ?? "").trim();
    return name || DEFAULT_STORE_NAME;
  } catch {
    return DEFAULT_STORE_NAME;
  }
};

const getStoreBadge = (storeName) => {
  const words = String(storeName || DEFAULT_STORE_NAME)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length >= 2) {
    return words
      .slice(0, 3)
      .map((w) => w[0].toUpperCase())
      .join("");
  }
  return String(storeName || "MDR")
    .slice(0, 3)
    .toUpperCase();
};

const getLoggedInUser = () => {
  try {
    const raw =
      localStorage.getItem("ccp_user") ?? localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user ?? parsed?.data ?? parsed;
  } catch {
    return null;
  }
};

const normalizeRole = (rawRole) => {
  const val =
    typeof rawRole === "object" && rawRole !== null
      ? rawRole.name ?? rawRole.role ?? ""
      : String(rawRole ?? "");
  return val.trim().toUpperCase() === "ADMIN" ? "ADMIN" : "CASHIER";
};

export function AppSidebar() {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState(() => getStoredStoreName());

  useEffect(() => {
    const syncStoreName = () => {
      setStoreName(getStoredStoreName());
    };

    syncStoreName();
    window.addEventListener("warung_madara_settings_updated", syncStoreName);
    window.addEventListener("storage", syncStoreName);
    return () => {
      window.removeEventListener("warung_madara_settings_updated", syncStoreName);
      window.removeEventListener("storage", syncStoreName);
    };
  }, []);

  const currentUser = useMemo(() => getLoggedInUser(), []);

  const displayName =
    currentUser?.name ??
    currentUser?.nama ??
    currentUser?.username ??
    currentUser?.email ??
    "User";

  const displayRole = normalizeRole(
    currentUser?.role?.name ??
      currentUser?.role ??
      currentUser?.roleName ??
      currentUser?.level ??
      "CASHIER",
  );

  const visibleItems = useMemo(
    () => items.filter((item) => item.roles.includes(displayRole)),
    [displayRole],
  );

  const handleLogout = () => {
    return Swal.fire({
      icon: "question",
      title: "Logout",
      text: "Are you sure you want to logout?",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("ccp_user");
        localStorage.removeItem("ccp_token");
        navigate("/login", { replace: true });
      }
    });
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-800 bg-slate-950 text-slate-100 !transition-all !duration-300 !ease-in-out"
    >
      <SidebarHeader className="py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center justify-center w-9 h-9 font-bold rounded-xl shrink-0 bg-green-400 text-white shadow-lg shadow-blue-500/30 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8">
            <span className="text-xs">{getStoreBadge(storeName)}</span>
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-wide text-slate-100 truncate">
              {storeName}
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
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.isLogout ? (
                    <SidebarMenuButton
                      type="button"
                      tooltip={item.title}
                      onClick={handleLogout}
                      className="hover:bg-slate-800/60 hover:text-blue-400 text-slate-300 transition-all rounded-lg py-2.5 px-3 data-[active=true]:bg-blue-600 data-[active=true]:text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                    >
                      <item.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      tooltip={item.title}
                      render={<Link to={item.url} />}
                      className="hover:bg-slate-800/60 hover:text-blue-400 text-slate-300 transition-all rounded-lg py-2.5 px-3 data-[active=true]:bg-blue-600 data-[active=true]:text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                    >
                      <item.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  )}
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
              tooltip={`${displayName} (${displayRole})`}
              className="hover:bg-slate-800/60 text-slate-300 rounded-lg p-2.5 transition-all group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
            >
              <div className="flex items-center justify-center text-blue-400 border rounded-full w-7 h-7 bg-slate-800 border-slate-700 shrink-0">
                <User2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden min-w-0">
                <span className="text-xs font-semibold truncate text-slate-200">
                  {displayName}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {displayRole}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}