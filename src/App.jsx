import Header from "./componentes/Headers";
import Sidebar from "./componentes/Sidebar";
import Footer from "./componentes/Footer";
import Agendamento from "./pages/Agendamento";
import Home from "./pages/Home";
import Sobre from "./pages/Sobre";
import Serviços from "./pages/Serviços";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import MinhaConta from "./pages/MinhaConta";
import AgendamentoUsuario from "./pages/AgendamentoUsuario";
import { Route, Routes } from "react-router-dom";

function App() {
    return (
       <>
        <Header/>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Sobre" element={<Sobre />} />
            <Route path="/Serviços" element={<Serviços />} />
            <Route path="/Agendamento" element={<Agendamento />} />
            <Route path="/Cadastro" element={<Cadastro />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/MinhaConta" element={<MinhaConta />} />
            <Route path="/AgendamentoUsuario" element={<AgendamentoUsuario />} />
        </Routes>
        <Footer/>
       </>
    )
}

export default App;