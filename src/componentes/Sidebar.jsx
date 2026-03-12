import "./Sidebar.css";

function Sidebar(){
    return(
        <aside className="sidebar">
            <h2>Menu</h2>
            <ul>
                <li><a href="#inicio">Início</a></li>
                <li><a href="#servicos">Serviços</a></li>
                <li><a href="#sobre">Sobre</a></li>
                <li><a href="#depoimentos">Depoimentos</a></li>
                <li><a href="#contatos">Contatos</a></li>
            </ul>
        </aside>
    );
}

export default Sidebar;