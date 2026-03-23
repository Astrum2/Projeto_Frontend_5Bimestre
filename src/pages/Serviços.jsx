import React from 'react';
import '../estilo/Serviços.css';

function Serviços() {
  const servicos = [
    {
      nome: 'Corte Masculino',
      descricao: 'Corte de cabelo moderno e estiloso para homens.',
      preco: 30
    },
    {
      nome: 'Corte Feminino',
      descricao: 'Corte de cabelo elegante para mulheres.',
      preco: 40
    },
    {
      nome: 'Barba',
      descricao: 'Aparar e modelar a barba.',
      preco: 20
    },
    {
      nome: 'Sobrancelha',
      descricao: 'Depilação e modelagem das sobrancelhas.',
      preco: 15
    },
    {
      nome: 'Corte Infantil',
      descricao: 'Corte de cabelo para crianças.',
      preco: 25
    },
    {
      nome: 'Tratamento Capilar',
      descricao: 'Tratamento para cabelos danificados.',
      preco: 50
    }
  ];

  return (
    <div className="servicos-container">
      <h1>Nossos Serviços</h1>
      <div className="servicos-grid">
        {servicos.map((servico, index) => (
          <div key={index} className="servico-card">
            <h2>{servico.nome}</h2>
            <p>{servico.descricao}</p>
            <p className="preco">Preço: R${servico.preco}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Serviços;
