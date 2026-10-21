import Login from "./pages/login";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./pages/MainLayout";
import Dashboard from "./pages/Dashboard";
import ListUser from "./pages/user/List";
import ListTransaction from "./pages/transaction/List";
import CategoryPage from "./pages/Category/List";
import ProductPage from "./pages/product/List";
import FormTransaction from "./pages/transaction/Form";
import PrintTransaction from "./pages/transaction/print";

function App() {
  //   if (editPeserta) {
  //     setListPeserta(
  //       listPeserta.map((item) =>
  //         item.id === DataPeserta.id ? DataPeserta : item,
  //       ),
  //     );
  //     setEditPeserta(null);
  //   } else {
  //     setListPeserta([...listPeserta, DataPeserta]);
  //   }
  // };
  // const handleHapus = (id) => {
  //   setListPeserta(listPeserta.filter((item) => item.id !== id));
  //   if (id === editPeserta.id) {
  //     setEditPeserta(null);
  //   }
  // };
  // const [listPeserta, setListPeserta] = useState(Peserta);
  // const [editPeserta, setEditPeserta] = useState(null);
  // return (
  //   <>
  //     <FormPeserta onSimpan={handleSubmit} pesertaEdit={editPeserta} />
  //     {/* {map: looping juga} */}
  //     {listPeserta.map((item) => (
  //       <DataPeserta
  //         key={item.id}
  //         peserta={item}
  //         onEdit={setEditPeserta}
  //         onHapus={handleHapus}
  //       />
  //     ))}
  //   </>
  // );
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />}></Route>
          <Route path="/user" element={<ListUser />}></Route>
          <Route path="/category" element={<CategoryPage />}></Route>
          <Route path="/transaction" element={<ListTransaction />}></Route>
          <Route
            path="/transaction/create"
            element={<FormTransaction />}
          ></Route>
          <Route path="/product" element={<ProductPage />}></Route>
          <Route path="/transaction/print" element={<PrintTransaction />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
