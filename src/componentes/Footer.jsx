import './Footer.css';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>CortaAí</h3>
          <p>Seu serviço de corte de cabelo de confiança.</p>
        </div>

        <div className="footer-section">
          <h3>Navegação</h3>
          <ul>
            <li><Link to="/">Início</Link></li>
            <li><Link to="/Produtos">Serviços</Link></li>
            <li><Link to="/Sobre">Sobre</Link></li>
            <li><Link to="/Agendamento">Agendamento</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contato</h3>
          <ul>
            <li>Email: contato@cortaai.com</li>
            <li>Telefone: (11) 9999-9999</li>
            <li>Endereço: Rua Principal, 123</li>
          </ul>
        </div>
      </div>

      <div className="footer-social">
        <h3>Redes Sociais</h3>
        <ul className="social-links">
          <li><a href="#facebook">Facebook</a></li>
          <li><a href="#instagram">Instagram</a></li>
          <li><a href="#whatsapp">WhatsApp</a></li>
        </ul>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 CortaAí. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;
