import React from 'react';
import '../estilo/Login.css';
import { Link } from 'react-router-dom';
import MessageBanner from '../componentes/MessageBanner';
import { useLoginPage } from '../hooks/useLoginPage';

function Login() {
  const {
    formData,
    errors,
    message,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useLoginPage();

  return (
    <div className="login-container">
      <h2>Login</h2>
      <MessageBanner type={message?.type}>{message?.text}</MessageBanner>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="senha">Senha:</label>
          <input
            type="password"
            id="senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
          />
          {errors.senha && <span className="error">{errors.senha}</span>}
        </div>
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Entrando...' : 'Entrar'}</button>
      </form>

      <p className="auth-switch-callout">
        Não possui conta?{' '}
        <Link to="/Cadastro" className="auth-switch-link">Cadastre-se aqui</Link>
      </p>

    </div>
  );
}

export default Login;