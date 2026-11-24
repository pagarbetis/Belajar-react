import Login from "./pages/login";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./pages/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ListUser from "./pages/user/List";
import ListTransaction from "./pages/transaction/List";
import CategoryPage from "./pages/Category/List";
import ProductPage from "./pages/product/List";
import FormTransaction from "./pages/transaction/Form";
import PrintTransaction from "./pages/transaction/print";
import SettingsPage from "./pages/Settings/SettingsPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Rute yang bisa diakses ADMIN & CASHIER */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN", "CASHIER"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/transaction" element={<ListTransaction />} />
            <Route path="/transaction/create" element={<FormTransaction />} />
            <Route path="/transaction/print" element={<PrintTransaction />} />
          </Route>
        </Route>

        {/* Rute khusus ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user" element={<ListUser />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;