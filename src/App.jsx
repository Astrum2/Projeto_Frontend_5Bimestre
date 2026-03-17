import Header from "./componentes/Headers";
import Sidebar from "./componentes/Sidebar";
import Footer from "./componentes/Footer";
import Agendamento from "./pages/Agendamento";
import Home from "./pages/Home";
import Produtos from "./pages/Produtos";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import { Route, Routes } from "react-router-dom";

function App() {
    return (
       <>
        <Header/>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Produtos" element={<Produtos />} />
            <Route path="/Agendamento" element={<Agendamento />} />
            <Route path="/Cadastro" element={<Cadastro />} />
            <Route path="/Login" element={<Login />} />
        </Routes>
        <Footer/>
       </>
    )
}

export default App;