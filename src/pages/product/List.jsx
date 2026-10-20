import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppModal from "@/components/AppModal";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/services/api";

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
      // get All Users
      const response = await api.get("/product");
      setProducts(response.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/category");
      setCategories(response.data);
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

  const handleEditModal = (user) => {
    console.log(user);
    setShowModal(true);
    setIsEdit(true);
    setFormData(user);
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
        category_id: formData.category_id,
        price: formData.price,
        description: formData.description,
        stock: formData.stock,
        is_active: parseInt(formData.is_active),
      };
      if (isEdit) {
        // update data
        await api.put(`/product/${formData.id}`, payload);
        // setUsers(users.map((user) => (user.id === formData.id ? formData : user)));
      } else {
        // insert data
        await api.post("/product", payload);
        // const newUser = {
        //   ...formData,
        //   id: Date.now(),
        // };

        // setUsers([...users, newUser]);
      }
      setFormData(_initForm);
      fetchProducts();
    } catch (error) {
      const errMsg = error.message;
      console.log(errMsg);
    } finally {
      setShowModal(false);
    }
    // jika edit data
  };

  const handleDelete = async (id) => {
    const confirmation = window.confirm("Are you sure want to delete this product?");
    if (confirmation) {
      // delete
      await api.delete(`/product/${id}`);
      fetchProducts();
      // setUsers(users.filter((u) => u.id !== id));
    }
    // filter: users
  };

  return (
    <>
      <Card className="p-6 rounded-md shadow-md border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">Data Product</CardTitle>
          </div>
          <Button onClick={handleOpenModal}>Create New Product</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0 fw-bold">Data Product</h4>
            </div>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase border-y bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">#</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length > 0 ? (
                products.map((row, index) => (
                  <tr key={index} className="transition-colors hover:bg-muted/50 ">
                    <td className="px-6 py-6 whitespace-nowrap">{index + 1}</td>
                    <td className="px-1 py-6">{row.nama}</td>
                    <td className="px-8 py-6">{row.category_name}</td>
                    <td className="px-5 py-6">{row.price}</td>
                    <td className="py-6 px-7">{row.stock}</td>
                    <td>
                        <div className="flex items-center gap-2 px-4">
                      <span className="relative flex w-2.5 h-2.5">
                        <span
                          className={`absolute inline-flex w-full h-full rounded-full opacity-75 ${
                            row.is_active === 1
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        ></span>
                        <span
                          className={`relative inline-flex w-2.5 h-2.5 rounded-full ${
                            row.is_active === 1
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        ></span>
                      </span>

                      <span
                        className={`text-xs font-medium ${
                          row.is_active === 1
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {row.is_active === 1 ? "Active" : "Non-Active"}
                      </span>
                    </div>
                    </td>
                    <td className="px-1 py-6 whitespace-nowrap">
                      <Button onClick={() => handleEditModal(row)} size="sm" className="bg-green-600 me-2">
                        Edit
                      </Button>
                      <Button onClick={() => handleDelete(row.id)} variant="destructive" size="sm" className="me-2">
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted">
                    Product not found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <AppModal show={showModal} onClose={handleCloseModal} title={isEdit ? "Edit Product" : "Create New Product"} onSubmit={handleSubmit} submitLabel={isEdit ? "Save Change" : "Save"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category_id} onValueChange={(val) => setFormData({ ...formData, category_id: val })} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select One.."></SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((category, index) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your product name" />
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <Input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required placeholder="Enter your price" />
          </div>
          <div className="space-y-2">
            <Label>Stock</Label>
            <Input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} required placeholder="Enter your stock" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input type="text" id="description" name="description" value={formData.description} onChange={handleChange} required placeholder="Enter description product" />
          </div>

          {/* {isEdit ? (
            <div className="space-y-2">
              <Label>Activation</Label>
              <RadioGroup value={String(formData.is_active)} onValueChange={(val) => setFormData({ ...formData, is_active: parseInt(val) })} className="flex gap-4 w-fit">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="active" />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="inactive" />
                  <Label htmlFor="inactive">In-Active</Label>
                </div>
              </RadioGroup>
            </div>
          ) : (
            ""
          )} */}
        </div>
        {/* <Form>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" name="name" placeholder="Enter your name" required value={formData.name} onChange={handleChange}></Form.Control>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control value={formData.email} onChange={handleChange} type="email" name="email" placeholder="Enter your email" required></Form.Control>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control value={formData.password} onChange={handleChange} type="password" name="password" placeholder="Enter your passwod" required></Form.Control>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select name="status" value={formData.status} onChange={handleChange}>
              <option value="">Select One</option>
              <option value="Active">Publish</option>
              <option value="In Active">Draft</option>
            </Form.Select>
          </Form.Group>
        </Form> */}
      </AppModal>
    </>
  );
};

export default ProductPage;