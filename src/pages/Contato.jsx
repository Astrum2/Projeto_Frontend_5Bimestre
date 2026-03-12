import { useState } from "react";
import "../estilo/Contato.css";

function Contato(){
    //Criando estados para armazenar dos dados do forms
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [envioSucesso, setEnvioSucesso] = useState(false);

    //Criar uma função para lidar com o envio do formulário
    function handleSubmit(event){
        event.preventDefault(); //impede o fluxo de reload da página.
        console.log("Nome enviado do forms:", nome);
        console.log("Email enviado do forms:", email);
        console.log("Mensagem enviada do forms:", mensagem);

        //Marcando como os campos serão enviados e limpa os campos do formulário
        setEnvioSucesso(true);
        setNome("");
        setEmail("");
        setMensagem("");
    }

    return(
        <main className="pagina-contato">
            <h1>Fale conosco</h1>
            <p className="subtitulo-pagina-contato">Envie sua dúvida e responderemos 
                em breve</p>
            <form className="formulario-contato" onSubmit={handleSubmit}>
                <label htmlFor="nome">Nome:</label>
                <input 
                    id="nome"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}>    
                </input>

                <label htmlFor="email">Email:</label>
                <input 
                    id="email"
                    type="email"
                    placeholder="email@gmail.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}>
                </input>

                <label htmlFor="mensagem">Mensagem:</label>
                <textarea 
                    id="mensagem"
                    placeholder="Digite sua mensagem aqui"
                    value={mensagem}
                    onChange={(event) => setMensagem(event.target.value)}>
                </textarea>

                <button type="submit" className="botao-enviar">Enviar</button>
                {envioSucesso && <p className="mensagem-sucesso">Mensagem enviada com sucesso!</p>}
                {/*/Limpando a mensagem de sucesso/*/}
                    {envioSucesso && setTimeout(() => setEnvioSucesso(false), 3000)}

           </form>
        </main>
    )}

    export default Contato;