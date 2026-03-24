import './Headers.css';
import { Link } from "react-router-dom";
import { useState } from 'react';

function Header(){
    const [isOpen, setIsOpen] = useState(false);

    return(
        <header className="header">

            <div className="logo">
                <Link to="/" className='logo-link'><img src="/imagens/Logo.png" alt="CortaAí" /></Link>
            </div>

        <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
            <span></span>
            <span></span>
            <span></span>
        </button>

        <nav className={`menu_header ${isOpen ? 'open' : ''}`}>
            <Link to="/" onClick={() => setIsOpen(false)}>Início</Link>
            <Link to="/Serviços" onClick={() => setIsOpen(false)}>Serviços</Link>
            <Link to="/Sobre" onClick={() => setIsOpen(false)}>Sobre</Link>
            <Link to="/Depoimentos" onClick={() => setIsOpen(false)}>Depoimentos</Link>
            <Link to="/Agendamento" onClick={() => setIsOpen(false)}>Agendamento</Link>

            <div className="buttons">
                <Link to="/Cadastro" className="cadastro_button" onClick={() => setIsOpen(false)}>Cadastrar</Link>
                <Link to="/Login" className="login_button" onClick={() => setIsOpen(false)}>Logar</Link>
            </div>
        </nav>
        </header>
    );
}

export default Header;