import React, { useEffect, useRef, useState } from 'react';
import '../estilo/Cadastro.css';
import { useNavigate } from 'react-router-dom';
import { setLoggedUser } from '../utils/auth';
import { requestJson } from '../utils/api';
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

  const formatCPF = (cpf) => {
    const digits = cpf.replace(/\D/g, '').slice(0, 11);
    const parts = [];

    if (digits.length > 0) parts.push(digits.slice(0, 3));
    if (digits.length > 3) parts.push(digits.slice(3, 6));
    if (digits.length > 6) parts.push(digits.slice(6, 9));

    let formatted = '';
    if (parts.length > 0) formatted = parts[0];
    if (parts.length > 1) formatted += '.' + parts[1];
    if (parts.length > 2) formatted += '.' + parts[2];
    if (digits.length > 9) formatted += '-' + digits.slice(9, 11);

    return formatted;
  };

  const normalizeCPF = (value) => {
    return value?.replace(/\D/g, '') ?? '';
  };

  const validarCPF = (cpf) => {
    const normalizedCpf = normalizeCPF(cpf);

    if (!normalizedCpf || normalizedCpf.length !== 11) {
      return false;
    }

    if (/^(\d)\1{10}$/.test(normalizedCpf)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(normalizedCpf[i], 10) * (10 - i);
    }

    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(normalizedCpf[9], 10)) {
      return false;
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(normalizedCpf[i], 10) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(normalizedCpf[10], 10)) {
      return false;
    }

    return true;
  };

  const validarSenha = (senha) => {
    const hasUpperCase = /[A-Z]/.test(senha);
    const hasNumber = /\d/.test(senha);
    const hasSpecial = /[^A-Za-z0-9]/.test(senha);

    return senha.length >= 7 && hasUpperCase && hasNumber && hasSpecial;
  };

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
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
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

      <span
        className="auth-switch-link"
        role="button"
        tabIndex={0}
        onClick={() => navigate('/login')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            navigate('/login');
          }
        }}
      >
        Já tem uma conta? Faça login
      </span>
    </div>
  );
}

export default Cadastro;