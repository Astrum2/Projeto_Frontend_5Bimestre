import React, { useState } from 'react';
import '../estilo/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { setLoggedUser } from '../utils/auth';
import { requestJson } from '../utils/api';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });

  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    setBackendError('');

    if (!formData.email) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const loginResponse = await requestJson('/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.senha
        })
      });

      setLoggedUser({
        nome: formData.email.split('@')[0],
        email: formData.email,
        token: loginResponse?.token
      });

      alert('Login realizado com sucesso!');
      navigate('/');
    } catch (error) {
      setBackendError(error.message || 'Nao foi possivel realizar login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Entrando...' : 'Entrar'}</button>
        {backendError && <span className="error">{backendError}</span>}
      </form>

      <p className="login-signup-callout">
        se não possue conta{' '}
        <Link to="/Cadastro" className="login-signup-link">cadastra-se aqui!</Link>
      </p>

    </div>
  );
}

export default Login;