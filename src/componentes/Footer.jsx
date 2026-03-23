import './Footer.css';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
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
