import React from 'react';
import '../estilo/Cadastro.css';
import { Link } from 'react-router-dom';
import MessageBanner from '../componentes/MessageBanner';
import { useCadastroPage } from '../hooks/useCadastroPage';

function Cadastro() {
  const {
    formData,
    errors,
    message,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useCadastroPage();

  return (
    <div className="cadastro-container">
      <h2>Cadastro</h2>
      <MessageBanner type={message?.type}>{message?.text}</MessageBanner>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome">Nome:</label>
          <input  type="text"  id="nome" name="nome"  value={formData.nome}  onChange={handleChange} />
          {errors.nome && <span className="error">{errors.nome}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="senha">Senha:</label>
          <input type="password" id="senha" name="senha" value={formData.senha} onChange={handleChange} />
          {errors.senha && <span className="error">{errors.senha}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmarSenha">Confirmar Senha:</label>
          <input type="password" id="confirmarSenha" name="confirmarSenha" value={formData.confirmarSenha} onChange={handleChange} />
          {errors.confirmarSenha && (
            <span className="error">{errors.confirmarSenha}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="cpf">CPF:</label>
          <input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} />
          {errors.cpf && <span className="error">{errors.cpf}</span>}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <p className="auth-switch-callout">
        Já tem uma conta?{' '}
        <Link to="/Login" className="auth-switch-link">Faça login</Link>
      </p>
    </div>
  );
}

export default Cadastro;