import './Headers.css';
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from 'react';
import { authChangedEvent, clearLoggedUser, getLoggedUser } from '../utils/auth';

function Header(){
    const [isOpen, setIsOpen] = useState(false);
    const [loggedUser, setLoggedUser] = useState(getLoggedUser());
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const syncAuthState = () => setLoggedUser(getLoggedUser());

        window.addEventListener('storage', syncAuthState);
        window.addEventListener(authChangedEvent, syncAuthState);

        return () => {
            window.removeEventListener('storage', syncAuthState);
            window.removeEventListener(authChangedEvent, syncAuthState);
        };
    }, []);

    useEffect(() => {
        const closeOnOutsideClick = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', closeOnOutsideClick);
        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, []);

    const userInitial = loggedUser?.nome?.charAt(0)?.toUpperCase() || 'U';

    const handleLogout = () => {
        clearLoggedUser();
        setIsUserMenuOpen(false);
        setIsOpen(false);
    };

    return(
        <header className="header">

            <div className="logo">
                <Link to="/" className='logo-link'><img src="/imagens/Logo.png" alt="CortaAí" /></Link>
            </div>

        <button className="hamburger" onClick={() => setIsOpen(!isOpen)}><span></span><span></span><span></span></button>

        <nav className={`menu_header ${isOpen ? 'open' : ''}`}>
            <Link to="/" onClick={() => setIsOpen(false)}>Início</Link>
            <Link to="/Serviços" onClick={() => setIsOpen(false)}>Serviços</Link>
            <Link to="/Sobre" onClick={() => setIsOpen(false)}>Sobre</Link>
            <Link to="/Depoimentos" onClick={() => setIsOpen(false)}>Depoimentos</Link>
            <Link to="/Agendamento" onClick={() => setIsOpen(false)}>Agendamento</Link>


            {loggedUser ? (
                <div className="user-menu-wrapper" ref={userMenuRef}>
                    <button className="avatar-button" type="button" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} aria-label="Abrir menu de usuário">{userInitial}</button>

                    {isUserMenuOpen && (
                        <div className="user-dropdown">
                            <p className="user-name">{loggedUser.nome || loggedUser.email}</p>
                            <Link
                                className="profile-link"
                                to="/MinhaConta"
                                onClick={() => {
                                    setIsUserMenuOpen(false);
                                    setIsOpen(false);
                                }}
                            >
                                Minha Conta
                            </Link>
                            <Link
                                className="profile-link"
                                to="/AgendamentoUsuario"
                                onClick={() => {
                                    setIsUserMenuOpen(false);
                                    setIsOpen(false);
                                }}
                            >
                                Meu Agendamentos
                            </Link>
                            {loggedUser?.admin && (
                                <Link
                                    className="profile-link"
                                    to="/AgendaBarbeiro"
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        setIsOpen(false);
                                    }}
                                >
                                    Agenda Barbeiro
                                </Link>
                            )}
                            <button className="logout-button" type="button" onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="buttons">
                    <Link to="/Cadastro" className="agendamento_button" onClick={() => setIsOpen(false)}>Cadastro</Link>
                    <Link to="/Login" className="login_button" onClick={() => setIsOpen(false)}>Logar</Link>
                </div>
            )}
        </nav>
        </header>
    );
}

export default Header;