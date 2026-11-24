import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppModal from "@/components/AppModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/services/api";

const formatIDR = (val) =>
  Number(val || 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

const ProductPage = () => {
  const _initForm = {
    id: null,
    category_id: "",
    name: "",
    price: "",
    stock: "",
    description: "",
    is_active: 1,
  };

  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(_initForm);
  const [isEdit, setIsEdit] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/product");
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setProducts(list);
    } catch (error) {
      console.log(error.message);
    }
  };

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
    fetchProducts();
    fetchCategories();
  }, []);

  const handleOpenModal = () => {
    setShowModal(true);
    setFormData(_initForm);
    setIsEdit(false);
  };

  const handleEditModal = (row) => {
    setShowModal(true);
    setIsEdit(true);
    setFormData({
      id: row.id,
      category_id: row.category_id ? String(row.category_id) : "",
      name: row.nama ?? row.name ?? "",
      price: row.price ?? "",
      stock: row.stock ?? "",
      description: row.description ?? "",
      is_active: row.is_active ?? 1,
    });
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
        nama: formData.name,
        category_id: Number(formData.category_id),
        price: Number(formData.price),
        description: formData.description,
        stock: Number(formData.stock),
        is_active: Number(formData.is_active ?? 1),
      };

      if (isEdit) {
        await api.put(`/product/${formData.id}`, payload);
      } else {
        await api.post("/product", payload);
      }

      setFormData(_initForm);
      fetchProducts();
    } catch (error) {
      console.log(error.message);
    } finally {
      setShowModal(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmation = window.confirm(
      "Are you sure want to delete this product?",
    );
    if (confirmation) {
      try {
        await api.delete(`/product/${id}`);
        fetchProducts();
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  return (
    <>
      <Card className="p-6 rounded-md shadow-md border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">Data Product</CardTitle>
          </div>
          <Button type="button" onClick={handleOpenModal}>
            Create New Product
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase border-y bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium text-center">#</th>
                <th className="px-4 py-3 font-medium text-center">Name</th>
                <th className="px-4 py-3 font-medium text-center">Category</th>
                <th className="px-4 py-3 font-medium text-center">Price</th>
                <th className="px-4 py-3 font-medium text-center">Stock</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length > 0 ? (
                products.map((row, index) => {
                  const isAvailable =
                    Boolean(row.is_active) && Number(row.stock ?? 0) > 0;

                  return (
                    <tr
                      key={row.id ?? index}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {row.nama ?? row.name ?? "-"}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {row.category_name ?? row.category?.name ?? "-"}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {formatIDR(row.price)}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {row.stock}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isAvailable
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                            }`}
                        >
                          {isAvailable ? "Available" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            onClick={() => handleEditModal(row)}
                            size="sm"
                            className="text-white bg-green-600 rounded-md hover:bg-green-700"
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleDelete(row.id)}
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
                    colSpan={7}
                    className="py-6 text-center text-muted-foreground"
                  >
                    Product not found
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
        title={isEdit ? "Edit Product" : "Create New Product"}
        onSubmit={handleSubmit}
        submitLabel={isEdit ? "Save Change" : "Save"}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(val) =>
                setFormData({ ...formData, category_id: val })
              }
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select One.." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your product name"
            />
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <Input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="Enter your price"
            />
          </div>
          <div className="space-y-2">
            <Label>Stock</Label>
            <Input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              placeholder="Enter your stock"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter description product"
            />
          </div>
          {isEdit && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={String(formData.is_active ?? 1)}
                onValueChange={(val) =>
                  setFormData({ ...formData, is_active: Number(val) })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </AppModal>
    </>
  );
};

export default ProductPage;