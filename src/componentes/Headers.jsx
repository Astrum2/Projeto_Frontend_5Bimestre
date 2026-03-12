import './Headers.css';
import { Link } from "react-router-dom";

function Header(){
    return(
        <header className="header">
        {/* ÁREA DA LOGO E DO NOME DA LOJA */}
            <div className="logo">
                <Link to="/" className='logo-link'>CortaAí</Link>
            </div>

        {/* ÁREA DO MENU DE NAVEGAÇÃO NO MEIO */}
        <nav className="menu_header">
            <Link to="/">Início</Link>
            <Link to="/Produtos">Serviços</Link>
            <Link to="/Sobre">Sobre</Link>
            <Link to="/Depoimentos">Depoimentos</Link>
            <Link to="/Contatos">Contatos</Link>
        </nav>

        {/* BOTÃO DE LOGIN */}
        <button className="login_button">Logar</button>
        </header>
    );
}

export default Header;