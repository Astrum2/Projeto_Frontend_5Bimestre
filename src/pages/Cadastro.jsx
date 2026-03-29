import React, { useState } from 'react';
import '../estilo/Cadastro.css';
import { useNavigate } from 'react-router-dom';
import { setLoggedUser } from '../utils/auth';
import { requestJson } from '../utils/api';

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
  const [backendError, setBackendError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'cpf' ? formatCPF(value) : value;
    setFormData({
      ...formData,
      [name]: newValue
    });
  };

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf[10])) return false;
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    setBackendError('');

    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
    if (!formData.confirmarSenha) newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    else if (formData.senha !== formData.confirmarSenha) newErrors.confirmarSenha = 'Senhas não coincidem';
    if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
    else if (!validarCPF(formData.cpf)) newErrors.cpf = 'CPF inválido';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const cadastrarELogar = async () => {
      try {
        setIsSubmitting(true);

        await requestJson('/users', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.nome,
            email: formData.email,
            password: formData.senha,
            cpf: formData.cpf.replace(/\D/g, '')
          })
        });

        const loginResponse = await requestJson('/login', {
          method: 'POST',
          body: JSON.stringify({
            email: formData.email,
            password: formData.senha
          })
        });

        setLoggedUser({
          nome: formData.nome,
          email: formData.email,
          token: loginResponse?.token
        });

        alert('Cadastro realizado com sucesso!');
        navigate('/');
      } catch (error) {
        setBackendError(error.message || 'Nao foi possivel finalizar o cadastro.');
      } finally {
        setIsSubmitting(false);
      }
    };

    cadastrarELogar();
  };

  return (
    <div className="cadastro-container">
      <h2>Cadastro</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
          />
          {errors.nome && <span className="error">{errors.nome}</span>}
        </div>
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
        <div className="form-group">
          <label htmlFor="confirmarSenha">Confirmar Senha:</label>
          <input
            type="password"
            id="confirmarSenha"
            name="confirmarSenha"
            value={formData.confirmarSenha}
            onChange={handleChange}
          />
          {errors.confirmarSenha && <span className="error">{errors.confirmarSenha}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="cpf">CPF:</label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            placeholder="000.000.000-00"
          />
          {errors.cpf && <span className="error">{errors.cpf}</span>}
        </div>
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Cadastrando...' : 'Cadastrar'}</button>
        {backendError && <span className="error">{backendError}</span>}
      </form>
    </div>
  );
}

export default Cadastro;