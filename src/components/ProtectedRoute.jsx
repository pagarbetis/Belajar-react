import { Navigate, Outlet } from "react-router-dom";

const getToken = () => {
  const rawToken =
    localStorage.getItem("token") ?? localStorage.getItem("ccp_token");
  if (!rawToken || rawToken === "null" || rawToken === "undefined") {
    return null;
  }
  return rawToken;
};

const getUserRole = () => {
  try {
    const raw =
      localStorage.getItem("ccp_user") ?? localStorage.getItem("user");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    const user = parsed?.user ?? parsed?.data ?? parsed;
    const roleRaw =
      user?.role?.name ?? user?.role ?? user?.roleName ?? user?.level ?? "";
    return String(roleRaw).trim().toUpperCase();
  } catch {
    return "";
  }
};

export default function ProtectedRoute({ allowedRoles = [] }) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const fallbackRoute = role === "ADMIN" ? "/dashboard" : "/transaction";
    return <Navigate to={fallbackRoute} replace />;
  }

  return <Outlet />;
}