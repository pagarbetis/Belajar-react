import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import AppModal from "../../components/AppModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

  const fetchCategories = async () => {
    try {
      const response = await api.get("/category");
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setCategories(list);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = () => {
    setShowModal(true);
    setFormData(_initForm);
    setIsEdit(false);
  };

  const handleEditModal = (category) => {
    setShowModal(true);
    setIsEdit(true);
    setFormData({
      id: category.id,
      name: category.name ?? "",
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus Kategori?",
      text: "Data kategori yang dihapus nggak bisa dibalikin.",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await api.delete(`/category/${id}`);
      await Swal.fire({
        icon: "success",
        title: "Terhapus",
        text: "Data kategori berhasil dihapus.",
        timer: 1000,
        showConfirmButton: false,
      });
      fetchCategories();
    } catch (error) {
      console.log(error.message);
      await Swal.fire({
        icon: "error",
        title: "Gagal Hapus",
        text:
          error.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan saat menghapus kategori.",
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
      const payload = {
        name: formData.name,
      };

      if (isEdit) {
        await api.put(`/category/${formData.id}`, payload);
      } else {
        await api.post("/category", payload);
      }

      setShowModal(false);
      setFormData(_initForm);
      await fetchCategories();

      await Swal.fire({
        icon: "success",
        title: isEdit ? "Berhasil Diupdate" : "Berhasil Ditambahkan",
        text: isEdit
          ? "Data kategori berhasil diperbarui."
          : "Kategori baru berhasil ditambahkan.",
        timer: 1100,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log(error.message);
      await Swal.fire({
        icon: "error",
        title: isEdit ? "Gagal Update" : "Gagal Menyimpan",
        text:
          error.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan saat menyimpan data kategori.",
      });
    }
  };

  return (
    <>
      <Card className="p-6 border-0 rounded-md shadow-md border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">Data Category</CardTitle>
          </div>
          <Button type="button" className="rounded-md" onClick={handleOpenModal}>
            Create New Category
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase border-y bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium text-center">#</th>
                <th className="px-4 py-3 font-medium text-center">Name</th>
                <th className="px-4 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <tr
                    key={category.id ?? index}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      {category.name}
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          onClick={() => handleEditModal(category)}
                          size="sm"
                          className="text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleDelete(category.id)}
                          size="sm"
                          className="text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="py-6 text-center text-muted-foreground"
                  >
                    Category not found
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
        title={isEdit ? "Edit Category" : "Create New Category"}
        onSubmit={handleSubmit}
        submitLabel={isEdit ? "Save Change" : "Save"}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter category name"
            />
          </div>
        </div>
      </AppModal>
    </>
  );
};

export default CategoryPage;