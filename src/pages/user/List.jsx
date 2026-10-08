import { useState } from "react";
import AppModal from "../../components/AppModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const dataUsers = [
  {
    id: 1,
    name: "Angga",
    email: "andiangga56@gmail.com",
    password: 1234567,
  },
  {
    id: 2,
    name: "Andi",
    email: "andi@gmail.com",
    password: 1234567,
  },
  {
    id: 3,
    name: "Putra",
    email: "putra@gmail.com",
    password: 1234567,
  },
];

const ListUser = () => {
  const _initForm = {
    id: null,
    name: "",
    email: "",
    password: "",
    status: "Active",
  };
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState(dataUsers);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    status: "Active",
  });
  const [isEdit, setIsEdit] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
    setFormData(_initForm);
    setIsEdit(false);
  };

  const handleEditModal = (user) => {
    setShowModal(true);
    setIsEdit(true);
    setFormData(user);
  };

  const handleDelete = (id) => {
    const isConfirm = window.confirm("Are you sure want to delete this data?");
    if (!isConfirm) {
      return;
    }
    // filter: user
    setUsers(users.filter((u) => u.id !== id));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      setUsers(
        users.map((user) => (user.id === formData.id ? formData : user)),
      );
    } else {
      const newUser = {
        ...formData,
        id: Date.now(),
      };
      setUsers([...users, newUser]);
      setFormData(_initForm);
    }

    setShowModal(false);
  };

  return (
    <>
      <Card className="p-6 border-0 shadow-sm border-border">
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
                <tr key={index} className="hover:bg-muted/50 trasition-colors">
                  <td className="px-5 py-6 whitespace-nowrap">{index + 1}</td>
                  <td className="px-5">{user.name}</td>
                  <td>{user.email}</td>
                  <td className="px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                      <span>Active</span>
                    </div>
                  </td>
                  <td>
                    <Button
                      onClick={() => handleEditModal(user)}
                      variant="warning"
                      size="sm"
                      className="bg-yellow-400 rounded-md me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(user.id)}
                      variant="danger"
                      size="sm"
                      className="bg-red-600 rounded-md me-2"
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
            ></Input>
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
            ></Input>
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            ></Input>
          </div>
        </div>
        {/* <Form>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={formData.name}
              onChange={handleChange}
              type="text"
              name="name"
              placeholder="Enter your name"
              required
            ></Form.Control>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              value={formData.email}
              onChange={handleChange}
              type="email"
              name="email"
              placeholder="Enter your Email"
              required
            ></Form.Control>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              value={formData.password}
              onChange={handleChange}
              type="password"
              name="password"
              placeholder="Enter your Password"
              required
            ></Form.Control>
          </Form.Group>
        </Form> */}
      </AppModal>
    </>
  );
};

export default ListUser;
