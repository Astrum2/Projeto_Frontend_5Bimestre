import { Link } from "react-router-dom";
import "../estilo/Home.css";

function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-tag">Barbearia Corta Aí</p>
          <h1>O corte perfeito, no seu ritmo</h1>
          <p className="hero-subtitle">
            Ambiente moderno, profissionais experientes e agendamento rápido. Venha
            conquistar o visual que combina com você.
          </p>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Nossos diferenciais</h2>
          <div className="feature-grid">
            <article className="feature-card">
              <h3>Profissionais experientes</h3>
              <p>
                Equipe qualificada e antenada nas tendências para garantir um corte
                impecável.
              </p>
            </article>

            <article className="feature-card">
              <h3>Ambiente acolhedor</h3>
              <p>
                Espaço confortável, música agradável e atendimento personalizado do
                início ao fim.
              </p>
            </article>

            <article className="feature-card">
              <h3>Agendamento simples</h3>
              <p>
                Reserve seu horário em poucos cliques e evite filas.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="callout">
        <div className="container">
          <h2>Pronto para transformar seu visual?</h2>
          <p>Escolha o serviço ideal e agende agora com a gente.</p>
          <Link to="/Agendamento" className="btn primary">
            <strong>Agendar agora</strong>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;