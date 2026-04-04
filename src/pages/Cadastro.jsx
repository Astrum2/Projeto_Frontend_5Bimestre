import React, { useEffect, useRef, useState } from 'react';
import '../estilo/Cadastro.css';
import { Link, useNavigate } from 'react-router-dom';
import { setLoggedUser } from '../utils/auth';
import { requestJson } from '../utils/api';
import { formatCPF, isValidEmail, validarCPF, validarSenha } from '../utils/validators';
import MessageBanner from '../componentes/MessageBanner';

function Cadastro() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cpf: ''
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'cpf' ? formatCPF(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    setMessage(null);

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (!validarSenha(formData.senha)) {
      newErrors.senha =
        'A senha deve conter no mínimo 7 caracteres, uma letra maiúscula, um número e um caractere especial';
    }

    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validarCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      await requestJson('/users', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.nome.trim(),
          email: formData.email.trim(),
          password: formData.senha,
          cpf: formData.cpf
        })
      });

      const loginResponse = await requestJson('/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.senha
        })
      });

      setLoggedUser({
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        token: loginResponse?.token
      });

      setMessage({ type: 'success', text: 'Cadastro realizado com sucesso!' });
      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Nao foi possivel finalizar o cadastro.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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