import Header from "./componentes/Headers";
import Sidebar from "./componentes/Sidebar";
import Contato from "./pages/Contato";
import Home from "./pages/Home";
import Produtos from "./pages/Produtos";
import { Route, Routes } from "react-router-dom";

function App() {
    return (
       <>
        <Header/>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Produtos" element={<Produtos />} />
            <Route path="/Contatos" element={<Contato />} />
        </Routes>
       </>
    )
}

export default App;