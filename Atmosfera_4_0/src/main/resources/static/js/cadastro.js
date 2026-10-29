const formularioCadastro = document.getElementById("Cadastro");

if (formularioCadastro) {
    const botaoLimparCadastro = document.getElementById("limparForm");
    const campoTurma = document.getElementById("turma");
    const campoSenha = document.getElementById("senha");
    const botaoExibirSenha = document.getElementById("exibirSenha");
    const iconeSenha = botaoExibirSenha.querySelector("img");
    const statusCadastro = document.getElementById("statusCadastro");
    statusCadastro.style.color = '#ff0514'
    const camposFormulario = formularioCadastro.querySelectorAll("input");
    const formatoTurma = /^[0-4][A-Z]{3,6}-[A-Z]$/;
    const mensagemErroTurma = "Insira o código da turma. Exemplo: 1AAA-A.";

    function atualizarBotaoSenha(mostrarSenha) {
        botaoExibirSenha.setAttribute("aria-label", mostrarSenha ? "Ocultar senha" : "Mostrar senha");
        botaoExibirSenha.setAttribute("aria-pressed", String(mostrarSenha));
        iconeSenha.src = mostrarSenha
            ? "../static/images/icons/olho.svg"
            : "../static/images/icons/olho-fechado.svg";
    }

    function atualizarMensagemErro(campo) {
        const nomeCampo = campo.id.charAt(0).toUpperCase() + campo.id.slice(1);
        const mensagemErro = document.getElementById(`mensagemErro${nomeCampo}`);

        if (campo.validity.valid) {
            campo.classList.remove("campoInvalido");
            mensagemErro.hidden = true;
            return;
        }

        campo.classList.add("campoInvalido");
        mensagemErro.textContent = campo.validity.valueMissing
            ? "Preencha este campo."
            : campo.id === "email" && campo.validity.typeMismatch
                ? "Digite um endereço de e-mail válido."
                : campo === campoTurma && !formatoTurma.test(campo.value)
                    ? mensagemErroTurma
                    : campo.validationMessage;
        mensagemErro.hidden = false;
    }

    botaoLimparCadastro.addEventListener("click", () => formularioCadastro.reset());

    campoTurma.addEventListener("input", () => {
        campoTurma.value = campoTurma.value.toUpperCase();
        campoTurma.setCustomValidity(
            campoTurma.value && !formatoTurma.test(campoTurma.value) ? mensagemErroTurma : ""
        );
        if (campoTurma.value) {
            atualizarMensagemErro(campoTurma);
        } else {
            campoTurma.classList.remove("campoInvalido");
            document.getElementById("mensagemErroTurma").hidden = true;
        }
    });

    camposFormulario.forEach((campo) => {
        campo.addEventListener("invalid", (evento) => {
            evento.preventDefault();
            atualizarMensagemErro(campo);
        });

        campo.addEventListener("input", () => {
            if (campo.validity.valid) {
                campo.classList.remove("campoInvalido");
                document.getElementById(
                    `mensagemErro${campo.id.charAt(0).toUpperCase()}${campo.id.slice(1)}`
                ).hidden = true;
            }
        });
    });

    formularioCadastro.addEventListener("reset", () => {
        campoTurma.setCustomValidity("");
        formularioCadastro.querySelectorAll(".mensagemErro").forEach((mensagem) => {
            mensagem.hidden = true;
        });
        camposFormulario.forEach((campo) => campo.classList.remove("campoInvalido"));
        statusCadastro.textContent = "";
        campoSenha.type = "password";
        atualizarBotaoSenha(false);
    });

    botaoExibirSenha.addEventListener("click", () => {
        const mostrarSenha = campoSenha.type === "password";
        campoSenha.type = mostrarSenha ? "text" : "password";
        atualizarBotaoSenha(mostrarSenha);
    });

    formularioCadastro.addEventListener("submit", (evento) => {
        evento.preventDefault();
        statusCadastro.textContent =
            "Dados validados. O cadastro ainda não está conectado a um serviço de armazenamento.";
    });
}

const formularioLogin = document.getElementById("formLogin");

if (formularioLogin) {
    const senhaLogin = document.getElementById("senhaLogin");
    const botaoExibirSenhaLogin = document.querySelector(".exibirSenhaLogin");
    const iconeSenhaLogin = botaoExibirSenhaLogin.querySelector("img");
    const statusLogin = document.getElementById("statusLogin");
    const camposLogin = formularioLogin.querySelectorAll("input");

    function atualizarErroLogin(campo) {
        const nomeCampo = campo.id.charAt(0).toUpperCase() + campo.id.slice(1);
        const mensagemErro = document.getElementById(`mensagemErro${nomeCampo}`);

        if (campo.validity.valid) {
            campo.classList.remove("campoInvalido");
            mensagemErro.hidden = true;
            return;
        }

        campo.classList.add("campoInvalido");
        mensagemErro.textContent = campo.validity.valueMissing
            ? "Preencha este campo."
            : campo.type === "email" && campo.validity.typeMismatch
                ? "Digite um endereço de e-mail válido."
                : campo.validationMessage;
        mensagemErro.hidden = false;
    }

    function atualizarVisibilidadeSenhaLogin(mostrarSenha) {
        botaoExibirSenhaLogin.setAttribute("aria-label", mostrarSenha ? "Ocultar senha" : "Mostrar senha");
        botaoExibirSenhaLogin.setAttribute("aria-pressed", String(mostrarSenha));
        iconeSenhaLogin.src = mostrarSenha
            ? "../static/images/icons/olho.svg"
            : "../static/images/icons/olho-fechado.svg";
    }

    camposLogin.forEach((campo) => {
        campo.addEventListener("invalid", (evento) => {
            evento.preventDefault();
            atualizarErroLogin(campo);
        });

        campo.addEventListener("input", () => atualizarErroLogin(campo));
    });

    botaoExibirSenhaLogin.addEventListener("click", () => {
        const mostrarSenha = senhaLogin.type === "password";
        senhaLogin.type = mostrarSenha ? "text" : "password";
        atualizarVisibilidadeSenhaLogin(mostrarSenha);
    });

    formularioLogin.addEventListener("reset", () => {
        camposLogin.forEach((campo) => {
            campo.classList.remove("campoInvalido");
            const nomeCampo = campo.id.charAt(0).toUpperCase() + campo.id.slice(1);
            document.getElementById(`mensagemErro${nomeCampo}`).hidden = true;
        });
        senhaLogin.type = "password";
        atualizarVisibilidadeSenhaLogin(false);
        statusLogin.textContent = "";
    });

    formularioLogin.addEventListener("submit", (evento) => {
        evento.preventDefault();
        statusLogin.textContent =
            "Dados validados. O login ainda não está conectado a um serviço de autenticação.";
    });
}
