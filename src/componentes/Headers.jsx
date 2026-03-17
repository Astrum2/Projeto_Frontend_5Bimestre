import './Headers.css';
import { Link } from "react-router-dom";

function Header(){
    return(
        <header className="header">
        {/* ÁREA DA LOGO E DO NOME DA LOJA */}
            <div className="logo">
                <Link to="/" className='logo-link'><img src="/imagens/Logo.png" alt="CortaAí" /></Link>
            </div>

        {/* ÁREA DO MENU DE NAVEGAÇÃO NO MEIO */}
        <nav className="menu_header">
            <Link to="/">Início</Link>
            <Link to="/Produtos">Serviços</Link>
            <Link to="/Sobre">Sobre</Link>
            <Link to="/Depoimentos">Depoimentos</Link>
            <Link to="/Agendamento">Agendamento</Link>
        </nav>

        {/* BOTÃO DE LOGIN */}
        <div className="buttons">
            <Link to="/Cadastro" className="cadastro_button">Cadastrar</Link>
            <Link to="/Login" className="login_button">Logar</Link>
        </div>
        </header>
    );
}

export default Header;