import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { 
  Eye, 
  EyeOff, 
  ShoppingBag, 
  Lock, 
  Mail, 
  ArrowRight,
  TrendingUp,
  Receipt,
  PackageCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const _initialForm = { email: "", password: "" };

  const [formData, setFormData] = useState(_initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Email atau password salah!");
      }

      localStorage.setItem("token", result.data.token);

      Swal.fire({
        icon: "success",
        title: "Login Berhasil!",
        text: "Memuat dashboard...",
        timer: 1200,
        showConfirmButton: false,
        width: "350px",
      });

      setTimeout(() => navigate("/Dashboard"), 1200);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: error.message || "Cek kembali email dan password lu.",
        confirmButtonColor: "#1d4ed8",
        width: "360px",
        customClass: {
          popup: "rounded-2xl p-4",
          title: "text-lg font-bold",
          htmlContainer: "text-sm text-slate-600",
          confirmButton: "rounded-xl text-sm px-5 py-2",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid w-full min-h-screen lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
      {/* SEBELAH KIRI: Hero / Visual Banner POS */}
      <div className="relative flex-col justify-between hidden p-12 overflow-hidden text-white lg:flex bg-slate-950">
        {/* Glow Effects Background */}
        <div className="absolute rounded-full pointer-events-none top-1/4 -left-20 w-80 h-80 bg-blue-600/25 blur-3xl" />
        <div className="absolute rounded-full pointer-events-none bottom-10 right-10 w-96 h-96 bg-indigo-600/15 blur-3xl" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3 text-lg font-semibold">
          <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-600 shadow-lg rounded-xl shadow-blue-500/30">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="tracking-wide">POS System PPKD JP</span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-lg my-auto space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
              Kelola Transaksi Kasir Lebih <span className="text-blue-500">Cepat & Efisien.</span>
            </h1>
            <p className="text-sm leading-relaxed text-slate-400">
              Sistem Point of Sales modern terintegrasi untuk pencatatan penjualan, inventaris barang, dan laporan performa real-time.
            </p>
          </div>

          {/* Visual Cards Element */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="flex flex-col items-center p-4 space-y-2 text-center border rounded-2xl bg-slate-900/80 border-slate-800 backdrop-blur-md">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-300">Transaksi Cepat</span>
            </div>

            <div className="flex flex-col items-center p-4 space-y-2 text-center border rounded-2xl bg-slate-900/80 border-slate-800 backdrop-blur-md">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-300">Laporan Real-time</span>
            </div>

            <div className="flex flex-col items-center p-4 space-y-2 text-center border rounded-2xl bg-slate-900/80 border-slate-800 backdrop-blur-md">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <PackageCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-300">Stok Otomatis</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 text-xs text-slate-500">
          © 2026 PPKD Jakarta Pusat. All rights reserved.
        </div>
      </div>

      {/* SEBELAH KANAN: Form Login Clean */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center mb-4 lg:hidden">
              <div className="flex items-center justify-center w-12 h-12 text-white bg-blue-600 shadow-lg rounded-2xl shadow-blue-500/30">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome Back!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Masukin kredensial lu buat masuk ke sistem POS
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-blue-600 dark:bg-slate-900 dark:border-slate-800"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@ppkdjp.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <a href="#" className="text-xs font-medium text-blue-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10 h-11 rounded-xl border-slate-200 focus-visible:ring-blue-600 dark:bg-slate-900 dark:border-slate-800"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="flex items-center justify-center w-full gap-2 mt-2 font-semibold text-white transition-all bg-blue-600 shadow-lg h-11 rounded-xl hover:bg-blue-700 shadow-blue-600/25 group"
              disabled={isLoading}
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          <p className="pt-4 text-xs text-center text-slate-400">
            By Andi Angga K.P
          </p>
        </div>
      </div>
    </div>
  );
}