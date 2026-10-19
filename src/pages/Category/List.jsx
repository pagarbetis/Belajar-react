import { useEffect, useState } from "react";
import AppModal from "../../components/AppModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import api from "../../services/api.js";

const CategoryPage = () => {
  const _initForm = {
    id: null,
    name: "",
  };
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(_initForm);
  const [isEdit, setIsEdit] = useState(false);

  // State buat toggle show/hide password
  // const [showPassword, setShowPassword] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/category");
      setCategories(response.data);
      console.log(response)
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    console.log("render ini")
    fetchCategories();
  }, []);

  const handleOpenModal = () => {
    setShowModal(true);
    setFormData(_initForm);
    setIsEdit(false);
    // setShowPassword(false);
  };

  const handleEditModal = (user) => {
    setShowModal(true);
    setIsEdit(true);
    setFormData({
      ...user,
      password: "",
    });
    // setShowPassword(false);
  };

  const handleDelete = async (id) => {
    const isConfirm = window.confirm("Are you sure want to delete this data?");
    if (!isConfirm) {
      return;
    }
    try {
      await api.delete(`/category/${id}`);
      fetchCategories();
    } catch (error) {
      const errMsg = error.message;
      console.log(errMsg);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    fetchCategories();
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
        await api.put(`/category/${formData.id}`, payload);
      } else {
        await api.post("/category", payload);
      }
      setFormData(_initForm);
    } catch (error) {
      const errMsg = error.message;
      console.log(errMsg);
    } finally {
      fetchCategories();
      setShowModal(false);
    }
  };

  return (
    <>
      <Card className="p-6 border-0 shadow-sm border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">Data Category</CardTitle>
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
                <th className="px-6 py-3 font-md">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((category, index) => (
                <tr key={index} className="transition-colors hover:bg-muted/50">
                  <td className="px-6 py-3 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-3">{category.name}</td>
                  <td>
                    <Button
                      onClick={() => handleEditModal(category)}
                      variant="warning"
                      size="sm"
                      className="text-black bg-yellow-400 rounded-md me-2 hover:bg-yellow-500"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(category.id)}
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
        title={isEdit ? "Edit Category" : "Create New Category"}
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
        </div>
      </AppModal>
    </>
  );
};

export default CategoryPage;
