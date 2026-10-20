import { useEffect, useState } from "react";
import AppModal from "../../components/AppModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import api from "../../services/api.js";

const ListUser = () => {
  const _initForm = {
    id: null,
    name: "",
    email: "",
    password: "",
    is_active: 1,
  };
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(_initForm);
  const [isEdit, setIsEdit] = useState(false);

  // State buat toggle show/hide password
  const [showPassword, setShowPassword] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await api.get("/user");
      setUsers(response.data);
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
    setShowModal(true);
    setIsEdit(true);
    setFormData({
      ...user,
      password: "", // Kosongin password pas edit biar ga ke-overwrite string kosong/hash lama kecuali diisi
    });
    setShowPassword(false);
  };

  const handleDelete = async (id) => {
    const isConfirm = window.confirm("Are you sure want to delete this data?");
    if (!isConfirm) {
      return;
    }
    try {
      await api.delete(`/user/${id}`);
      fetchUser();
    } catch (error) {
      const errMsg = error.message;
      console.log(errMsg);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    fetchUser();
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
      const payload = {
        name: formData.name,
        email: formData.email,
        is_active: parseInt(formData.is_active),
      };

      // Kalau password diisi pas edit atau pas create, ikut dikirim
      if (formData.password) {
        payload.password = formData.password;
      }

      if (isEdit) {
        await api.put(`/user/${formData.id}`, payload);
      } else {
        await api.post("/user", payload);
      }
      setFormData(_initForm);
    } catch (error) {
      const errMsg = error.message;
      console.log(errMsg);
    } finally {
      fetchUser();
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
          <Button className="rounded-md" onClick={handleOpenModal}>
            Create New User
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase border-y bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-md">#</th>
                <th className="px-6 py-3 font-md">Name</th>
                <th className="px-6 py-3 font-md">Email</th>
                <th className="px-6 py-3 font-md">Status</th>
                <th className="px-6 py-3 font-md">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user, index) => (
                <tr key={index} className="transition-colors hover:bg-muted/50">
                  <td className="px-5 py-6 whitespace-nowrap">{index + 1}</td>
                  <td className="px-5">{user.name}</td>
                  <td>{user.email}</td>
                  <td className="px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="relative flex w-2.5 h-2.5">
                        <span
                          className={`absolute inline-flex w-full h-full rounded-full opacity-75 ${
                            user.is_active === 1
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        ></span>
                        <span
                          className={`relative inline-flex w-2.5 h-2.5 rounded-full ${
                            user.is_active === 1
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        ></span>
                      </span>

                      <span
                        className={`text-xs font-medium ${
                          user.is_active === 1
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {user.is_active === 1 ? "Active" : "Non-Active"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <Button
                      onClick={() => handleEditModal(user)}
                      variant="warning"
                      size="sm"
                      className="text-black bg-yellow-400 rounded-md me-2 hover:bg-yellow-500"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(user.id)}
                      variant="danger"
                      size="sm"
                      className="bg-red-500 rounded-md me-2 hover:bg-red-700"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
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
                name="is_active"
                value={formData.is_active}
                onChange={handleChange}
                className="flex w-full px-3 py-1 text-sm transition-colors bg-transparent border rounded-md shadow-sm h-9 border-input file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value={1}>Active</option>
                <option value={0}>Non-Active</option>
              </select>
            </div>
          )}
        </div>
      </AppModal>
    </>
  );
};

export default ListUser;
