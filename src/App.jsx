import './App.css';
import Header from "./componentes/Headers";
import Footer from "./componentes/Footer";
import Agendamento from "./pages/Agendamento";
import Home from "./pages/Home";
import Sobre from "./pages/Sobre";
import Serviços from "./pages/Serviços";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import MinhaConta from "./pages/MinhaConta";
import AgendamentoUsuario from "./pages/AgendamentoUsuario";
import AgendaBarbeiro from "./pages/AgendaBarbeiro";
import { Route, Routes } from "react-router-dom";

function App() {
    return (
       <div className="app-shell">
        <Header />
        <main className="app-content">
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Sobre" element={<Sobre />} />
              <Route path="/Serviços" element={<Serviços />} />
              <Route path="/Agendamento" element={<Agendamento />} />
              <Route path="/Cadastro" element={<Cadastro />} />
              <Route path="/Login" element={<Login />} />
              <Route path="/MinhaConta" element={<MinhaConta />} />
              <Route path="/AgendamentoUsuario" element={<AgendamentoUsuario />} />
              <Route path="/AgendaBarbeiro" element={<AgendaBarbeiro />} />
          </Routes>
        </main>
        <Footer />
       </div>
    )
}

export default App;