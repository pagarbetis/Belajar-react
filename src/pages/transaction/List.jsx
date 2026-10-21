import { useEffect, useState } from "react";
// import AppModal from "../../components/AppModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
import api from "../../services/api.js";
import { useNavigate } from "react-router-dom";

const ListTransaction = () => {
  const navigate = useNavigate();
  const _initForm = {
    id: null,
    name: "",
    email: "",
    password: "",
    is_active: 1,
  };
  const [showModal, setShowModal] = useState(false);
  const [transaction, setTransaction] = useState([]);
  // const [formData, setFormData] = useState(_initForm);
  // const [isEdit, setIsEdit] = useState(false);

  const fetchTransaction = async () => {
    try {
      const response = await api.get("/transaction");
      setTransaction(response.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, []);

  // const handleOpenModal = () => {
  //   setShowModal(true);
  //   setFormData(_initForm);
  //   setIsEdit(false);
  // };

  // const handleEditModal = (transaction) => {
  //   setShowModal(true);
  //   setIsEdit(true);
  //   setFormData({
  //     ...transaction,
  //   });
  // };

  const handleDelete = async (id) => {
    const isConfirm = window.confirm("Are you sure want to delete this data?");
    if (!isConfirm) {
      return;
    }
    try {
      await api.delete(`/user/${id}`);
      fetchTransaction();
    } catch (error) {
      const errMsg = error.message;
      console.log(errMsg);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    fetchTransaction();
  };

  // const handleChange = (e) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value,
  //   });
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const payload = {
  //       name: formData.name,
  //       email: formData.email,
  //       is_active: parseInt(formData.is_active),
  //     };
  //     if (isEdit) {
  //       await api.put(`/transaction/${formData.id}`, payload);
  //     } else {
  //       await api.post("/transaction", payload);
  //     }
  //     setFormData(_initForm);
  //   } catch (error) {
  //     const errMsg = error.message;
  //     console.log(errMsg);
  //   } finally {
  //     fetchTransaction();
  //     setShowModal(false);
  //   }
  // };

  return (
    <>
      <Card className="p-6 border-0 rounded-md shadow-md border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">Data User</CardTitle>
          </div>
          <Button
            className="rounded-md"
            onClick={() => navigate("/transaction/create")}
          >
            Create New transaction
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase border-y bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-md">#</th>
                <th className="px-2 py-3 font-md">Order number</th>
                <th className="py-3 font-md">Payment method</th>
                <th className="px-2 py-3 font-md">Product</th>
                <th className="px-8 py-3 font-md">Status</th>
                <th className="px-6 py-3 font-md">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transaction.map((user, index) => (
                <tr key={index} className="transition-colors hover:bg-muted/50">
                  <td className="px-5 py-6 whitespace-nowrap">{index + 1}</td>
                  <td className="px-5">{user.order_number}</td>
                  <td className="px-14">{user.payment_method}</td>
                  <td className="px-1">
                    {user.items.map((item) => (
                      <ul>
                        <li>{item.nama}</li>
                      </ul>
                    ))}
                  </td>
                  <td className="px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">

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
                  <td className="py-6 ">
                    <Button
                      onClick={() => handleDelete(user.id)}
                      variant="danger"
                      size="sm"
                      className="text-white bg-indigo-600 rounded-md me-2 hover:bg-indigo-700"
                    >
                      Print
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

      {/* <AppModal
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
      </AppModal> */}
    </>
  );
};

export default ListTransaction;
