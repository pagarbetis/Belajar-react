import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import AppModal from "../../components/AppModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import api from "../../services/api.js";

const ROLE_OPTIONS = [
  { label: "Admin", value: "ADMIN" },
  { label: "Cashier", value: "CASHIER" },
];

const normalizeRole = (rawRole) => {
  const val =
    typeof rawRole === "object" && rawRole !== null
      ? rawRole.name ?? rawRole.role ?? ""
      : String(rawRole ?? "");
  const upper = val.trim().toUpperCase();
  if (upper === "ADMIN") return "ADMIN";
  return "CASHIER";
};

const ListUser = () => {
  const _initForm = {
    id: null,
    name: "",
    email: "",
    password: "",
    role: "CASHIER",
    status: "ACTIVE",
  };

  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(_initForm);
  const [isEdit, setIsEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await api.get("/user");
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setUsers(list);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleOpenModal = () => {
    setShowModal(true);
    setFormData(_initForm);
    setIsEdit(false);
    setShowPassword(false);
  };

  const handleEditModal = (user) => {
    const rawStatus =
      typeof user.status === "boolean"
        ? user.status
          ? "ACTIVE"
          : "INACTIVE"
        : user.status !== undefined
          ? String(user.status).toUpperCase()
          : Number(user.is_active ?? 1) === 1
            ? "ACTIVE"
            : "INACTIVE";

    setShowModal(true);
    setIsEdit(true);
    setFormData({
      id: user.id,
      name: user.name ?? "",
      email: user.email ?? "",
      password: "",
      role: normalizeRole(user.role ?? user.roleName ?? user.level),
      status:
        rawStatus === "INACTIVE" || rawStatus === "0" ? "INACTIVE" : "ACTIVE",
    });
    setShowPassword(false);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus User?",
      text: "Data user yang dihapus nggak bisa dibalikin.",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await api.delete(`/user/${id}`);
      await Swal.fire({
        icon: "success",
        title: "Terhapus",
        text: "Data user berhasil dihapus.",
        timer: 1000,
        showConfirmButton: false,
      });
      fetchUser();
    } catch (error) {
      console.log(error.message);
      await Swal.fire({
        icon: "error",
        title: "Gagal Hapus",
        text: error.response?.data?.message || error.message || "Terjadi kesalahan.",
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const isActiveBool =
        String(formData.status ?? "ACTIVE").toUpperCase() === "ACTIVE";
      const selectedRole = normalizeRole(formData.role);

      const payload = {
        name: formData.name,
        email: formData.email,
        role: selectedRole,
        status: isActiveBool ? "ACTIVE" : "INACTIVE",
        is_active: isActiveBool ? 1 : 0,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (isEdit) {
        await api.put(`/user/${formData.id}`, payload);
      } else {
        await api.post("/user", payload);
      }

      setFormData(_initForm);
      fetchUser();
    } catch (error) {
      console.log(error.message);
    } finally {
      setShowModal(false);
    }
  };

  return (
    <>
      <Card className="p-6 border-0 rounded-md shadow-md border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">Data User</CardTitle>
          </div>
          <Button type="button" className="rounded-md" onClick={handleOpenModal}>
            Create New User
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase border-y bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium text-center">#</th>
                <th className="px-4 py-3 font-medium text-center">Name</th>
                <th className="px-4 py-3 font-medium text-center">Email</th>
                <th className="px-4 py-3 font-medium text-center">Role</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length > 0 ? (
                users.map((user, index) => {
                  const isActive =
                    typeof user.status === "boolean"
                      ? user.status
                      : user.status !== undefined
                        ? String(user.status).toUpperCase() === "ACTIVE" ||
                        user.status === 1
                        : Number(user.is_active ?? 1) === 1;

                  const userRole = normalizeRole(
                    user.role ?? user.roleName ?? user.level,
                  );

                  return (
                    <tr
                      key={user.id ?? index}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {user.name}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {userRole}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                            }`}
                        >
                          {isActive ? "Active" : "Non-Active"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            onClick={() => handleEditModal(user)}
                            size="sm"
                            className="text-white bg-green-600 rounded-md hover:bg-green-700"
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            size="sm"
                            className="text-white bg-red-600 rounded-md hover:bg-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-muted-foreground"
                  >
                    User not found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <AppModal
        show={showModal}
        onClose={handleCloseModal}
        title={isEdit ? "Edit User" : "Create New User"}
        onSubmit={handleSubmit}
        submitLabel={isEdit ? "Save Change" : "Save"}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="flex w-full px-3 py-1 text-sm transition-colors bg-transparent border rounded-md shadow-sm h-9 border-input file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>
              Password {isEdit && "(Kosongkan jika tidak ingin mengubah)"}
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEdit}
                placeholder="Enter your password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {isEdit && (
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex w-full px-3 py-1 text-sm transition-colors bg-transparent border rounded-md shadow-sm h-9 border-input file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Non-Active</option>
              </select>
            </div>
          )}
        </div>
      </AppModal>
    </>
  );
};

export default ListUser;