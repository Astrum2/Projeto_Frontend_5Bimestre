import '../estilo/MinhaConta.css';
import { useMinhaContaPage } from '../hooks/useMinhaContaPage';

function MinhaConta() {
  const {
    formData,
    errors,
    loading,
    backendMessage,
    isSubmitting,
    isAdmin,
    handleChange,
    handleSubmit,
  } = useMinhaContaPage();

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
        <input  type="text"  id="nome"  name="nome"  value={formData.nome}  onChange={handleChange} />
        {errors.nome && <span className="error">{errors.nome}</span>}

        <label htmlFor="email">Email</label>
        <input  type="email"  id="email"  name="email"  value={formData.email}  onChange={handleChange}  readOnly />
        {errors.email && <span className="error">{errors.email}</span>}

        <label htmlFor="cpf">CPF</label>
        <input  type="text"  id="cpf"  name="cpf"  value={formData.cpf}  onChange={handleChange}  maxLength={14}  placeholder="000.000.000-00" />
        {errors.cpf && <span className="error">{errors.cpf}</span>}

        {isAdmin && (
          <>
            <label htmlFor="telefone">Telefone</label>
            <input type="tel"  id="telefone"  name="telefone"  value={formData.telefone}  onChange={handleChange}  placeholder="(00) 00000-0000" />
            {errors.telefone && <span className="error">{errors.telefone}</span>}

            <label htmlFor="imagem">Imagem</label>
            <input type="file"  id="imagem"  name="imagem"  onChange={handleChange}  accept="image/*" />
            {formData.imagemNome && (
              <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                Arquivo selecionado: {formData.imagemNome}
              </p>
            )}
            {errors.imagem && <span className="error">{errors.imagem}</span>}

            <label htmlFor="ativo">
              <input  type="checkbox"  id="ativo"  name="ativo"  checked={formData.ativo}  onChange={handleChange} />
              Ativo
            </label>
            {errors.ativo && <span className="error">{errors.ativo}</span>}
          </>
        )}

        <label htmlFor="senha">Nova Senha</label>
        <input  type="password"  id="senha"  name="senha"  value={formData.senha}  onChange={handleChange}  placeholder="Deixe em branco para manter"  />
        {errors.senha && <span className="error">{errors.senha}</span>}

        <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
        <input  type="password"  id="confirmarSenha"  name="confirmarSenha"  value={formData.confirmarSenha}  onChange={handleChange}  />
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