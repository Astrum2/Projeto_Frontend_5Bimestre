import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../estilo/MinhaConta.css';
import { getLoggedUser, setLoggedUser } from '../utils/auth';
import { requestJson } from '../utils/api';

function MinhaConta() {
  const navigate = useNavigate();
  const [authUser] = useState(getLoggedUser());

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    senha: '',
    confirmarSenha: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [backendMessage, setBackendMessage] = useState('');
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

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i], 10) * (10 - i);
    }

    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf[9], 10)) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i], 10) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf[10], 10)) return false;

    return true;
  };

  const validarSenha = (senha) => {
    const hasUpperCase = /[A-Z]/.test(senha);
    const hasNumber = /\d/.test(senha);
    const hasSpecial = /[^A-Za-z0-9]/.test(senha);

    return senha.length >= 7 && hasUpperCase && hasNumber && hasSpecial;
  };

  useEffect(() => {
    if (!authUser?.id || !authUser?.token) {
      navigate('/Login');
      return;
    }

    const carregarPerfil = async () => {
      try {
        const profile = await requestJson(`/users/${authUser.id}`, {
          headers: {
            Authorization: `Bearer ${authUser.token}`
          }
        });

        setFormData((prev) => ({
          ...prev,
          nome: profile?.name || authUser.nome || '',
          email: profile?.email || authUser.email || '',
          cpf: formatCPF(profile?.cpf || authUser.cpf || '')
        }));
      } catch (error) {
        setBackendMessage(error.message || 'Nao foi possivel carregar seus dados.');
      } finally {
        setLoading(false);
      }
    };

    carregarPerfil();
  }, [authUser, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const newValue = name === 'cpf' ? formatCPF(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!authUser?.id || !authUser?.token) {
      navigate('/Login');
      return;
    }

    const newErrors = {};
    setBackendMessage('');

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validarCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (formData.senha && !validarSenha(formData.senha)) {
      newErrors.senha =
        'A senha deve conter no mínimo 7 caracteres, uma letra maiúscula, um número e um caractere especial';
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.nome.trim(),
        email: formData.email.trim(),
        cpf: formData.cpf
      };

      if (formData.senha) {
        payload.password = formData.senha;
      }

      const updatedProfile = await requestJson(`/users/${authUser.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authUser.token}`
        },
        body: JSON.stringify(payload)
      });

      setLoggedUser({
        id: authUser.id,
        token: authUser.token,
        admin: authUser.admin,
        nome: updatedProfile?.name || formData.nome.trim(),
        email: updatedProfile?.email || formData.email.trim(),
        cpf: updatedProfile?.cpf || formData.cpf
      });

      setFormData((prev) => ({
        ...prev,
        senha: '',
        confirmarSenha: ''
      }));

      setBackendMessage('Informações atualizadas com sucesso!');
    } catch (error) {
      setBackendMessage(error.message || 'Nao foi possivel atualizar suas informações.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="minha-conta-container">
        <p>Carregando informações da conta...</p>
      </main>
    );
  }

  return (
    <main className="minha-conta-container">
      <h1>Minha Conta</h1>
      <p>Atualize seus dados de perfil abaixo.</p>

      <form className="minha-conta-form" onSubmit={handleSubmit}>
        <label htmlFor="nome">Nome</label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
        />
        {errors.nome && <span className="error">{errors.nome}</span>}

        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error">{errors.email}</span>}

        <label htmlFor="cpf">CPF</label>
        <input
          type="text"
          id="cpf"
          name="cpf"
          value={formData.cpf}
          onChange={handleChange}
          maxLength={14}
          placeholder="000.000.000-00"
        />
        {errors.cpf && <span className="error">{errors.cpf}</span>}

        <label htmlFor="senha">Nova Senha</label>
        <input
          type="password"
          id="senha"
          name="senha"
          value={formData.senha}
          onChange={handleChange}
          placeholder="Deixe em branco para manter"
        />
        {errors.senha && <span className="error">{errors.senha}</span>}

        <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
        <input
          type="password"
          id="confirmarSenha"
          name="confirmarSenha"
          value={formData.confirmarSenha}
          onChange={handleChange}
        />
        {errors.confirmarSenha && <span className="error">{errors.confirmarSenha}</span>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        </button>

        {backendMessage && <p className="mensagem-status">{backendMessage}</p>}
      </form>
    </main>
  );
}

export default MinhaConta;
