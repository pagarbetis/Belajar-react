import { useState } from "react";
import { Card, Form, Button, Table } from "react-bootstrap";
import AppModal from "../../components/AppModal";

const dataMenu = [
  {
    id: 1,
    kategori: "Coffe",
    name: "Americano",
    harga: 20000,
    status: "Available",
  },
  {
    id: 2,
    kategori: "Coffe",
    name: "Kopi Susu",
    harga: 25000,
    status: "Available",
  },
  {
    id: 3,
    kategori: "Non Coffe",
    name: "Es Teh",
    harga: 15000,
    status: "Available",
  },
  {
    id: 4,
    kategori: "Non Coffe",
    name: "Air Putih",
    harga: 8000,
    status: "Available",
  },
  {
    id: 5,
    kategori: "Food",
    name: "Ayam Geprek",
    harga: 35000,
    status: "Available",
  },
  {
    id: 6,
    kategori: "Food",
    name: "Sate",
    harga: 30000,
    status: "Available",
  },
];

const ListMenu = () => {
  const _initForm = {
    id: null,
    kategori: "",
    name: "",
    harga: "",
    status: "Available",
  };

  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState(dataMenu);
  const [formData, setFormData] = useState(_initForm);
  const [isEdit, setIsEdit] = useState(false);

  const [filterCategory, setFilterCategory] = useState("All");

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
    }
    setShowModal(false);
  };

  const filteredUsers =
    filterCategory === "All"
      ? users
      : users.filter((user) => user.kategori === filterCategory);

  return (
    <>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h4 className="mb-0 fw-bold">Data Menu</h4>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Form.Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ width: "170px" }}
              >
                <option value="All">Semua Kategori</option>
                <option value="Coffe">Coffe</option>
                <option value="Non Coffe">Non Coffe</option>
                <option value="Food">Food</option>
              </Form.Select>

              <Button variant="primary" onClick={handleOpenModal}>
                Create New Menu
              </Button>
            </div>
          </div>

          <Table responsive hover className="align-middle mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>kategori</th>
                <th>Harga</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.kategori}</td>
                    <td>{user.harga}</td>
                    <td>{user.status}</td>
                    <td>
                      <Button
                        onClick={() => handleEditModal(user)}
                        variant="warning"
                        size="sm"
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(user.id)}
                        variant="danger"
                        size="sm"
                        className="me-2"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-3 text-muted">
                    Tidak ada data menu untuk kategori ini.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <AppModal
        show={showModal}
        onClose={handleCloseModal}
        title={isEdit ? "Edit Menu" : "Add New Menu"}
        onSubmit={handleSubmit}
        submitLabel={isEdit ? "Save Change" : "Save"}
      >
        <Form.Group className="mb-3">
          <Form.Label>Name Menu</Form.Label>
          <Form.Control
            value={formData.name}
            onChange={handleChange}
            type="text"
            name="name"
            placeholder="Enter menu name"
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Kategori</Form.Label>
          <Form.Select
            value={formData.kategori}
            onChange={handleChange}
            name="kategori"
            required
          >
            <option value="">Pilih Kategori</option>
            <option value="Food">Food</option>
            <option value="Coffe">Coffe</option>
            <option value="Non Coffe">Non Coffe</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Harga</Form.Label>
          <Form.Control
            value={formData.harga}
            onChange={handleChange}
            type="number"
            name="harga"
            placeholder="Enter your Price"
            required
          ></Form.Control>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={formData.status}
            onChange={handleChange}
            name="status"
          >
            <option value="Available">Available</option>
            <option value="Out of Service">Out of Service</option>
          </Form.Select>
        </Form.Group>
      </AppModal>
    </>
  );
};

export default ListMenu;
