// import { useState } from "react";
// import heroImg from "./assets/hero.png";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "./assets/vite.svg";
// import "./App.css";
import { useState } from "react";
import DataPeserta from "./component/DataPeserta";
import { Peserta } from "./component/Peserta";
import FormPeserta from "./component/FormPeserta";

function App() {
  const handleSubmit = (DataPeserta) => {
    if (editPeserta) {
      setListPeserta(
        listPeserta.map((item) =>
          item.id === DataPeserta.id ? DataPeserta : item,
        ),
      );
      setEditPeserta(null);
    } else {
      setListPeserta([...listPeserta, DataPeserta]);
    }
  };
  const handleHapus = (id) => {
    setListPeserta(listPeserta.filter((item) => item.id !== id));
    if (id === editPeserta.id) {
      setEditPeserta(null);
    }
  };
  const [listPeserta, setListPeserta] = useState(Peserta);
  const [editPeserta, setEditPeserta] = useState(null);
  return (
    <>
      <FormPeserta onSimpan={handleSubmit} pesertaEdit={editPeserta} />
      {/* {map: looping juga} */}
      {listPeserta.map((item) => (
        <DataPeserta
          key={item.id}
          peserta={item}
          onEdit={setEditPeserta}
          onHapus={handleHapus}
        />
      ))}
    </>
  );
}

export default App;
