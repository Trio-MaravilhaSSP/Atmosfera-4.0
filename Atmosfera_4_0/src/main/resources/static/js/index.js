function textTooltip() {
    const pTema = document.getElementById('Tooltip-P-Tema');
    const pImage = document.getElementById('Tooltip-P-Image');
    const btn = document.getElementById('Tooltip-Btn-Image');

    let temaAtual = localStorage.getItem('tema') === 'light' ? 'Claro' : 'Escuro';
    pTema.innerHTML = `<b>Tema:</b> ${temaAtual}`;

    const imageStatus = localStorage.getItem('backgroundImage') === 'on' ? 'On' : 'Off';
    pImage.innerHTML = `<b>Imagem:</b> ${imageStatus}`;
    btn.textContent = imageStatus === 'On' ? 'Off' : 'On';
}

function toggleTooltipConfig() {
    const tooltip = document.querySelector('.Tooltip-Config');
    tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';

    textTooltip();
}

function trocarTema() {
    const body = document.body;

    body.classList.toggle('dark');
    body.classList.toggle('light');
    document.querySelector('main').classList.toggle('imageOnDark')

    const temaAtual = body.classList.contains('dark') ? 'dark' : 'light';

    localStorage.setItem('tema', temaAtual);
    changeIcon(temaAtual)
    textTooltip();
}

function toggleBackgroundImage() {
    const main = document.querySelector('main');

    main.classList.toggle('imageOff');
    main.classList.toggle('imageOn');
    main.style.backgroundColor = ''

    const imageStatus = main.classList.contains('imageOn') ? 'on' : 'off';
    localStorage.setItem('backgroundImage', imageStatus);

    textTooltip();
}

function changeIcon(indicadorTema) {
    const icons = document.querySelectorAll('.Icon')

    icons.forEach(img => {
        let srcAtual = img.src

        if (indicadorTema == 'dark') img.src = srcAtual.replace('-light', '-dark')
        else img.src = srcAtual.replace('-dark', '-light')
    })
}

function changeWindow(secao) {
    const secaoAtual = document.querySelector('section.active');
    const proximaSecao = document.querySelector(`#sec-${secao}`);
    const dashboard = document.querySelector('.Dashboard-Container');

    if (!proximaSecao) return;

    // Se a seção clicada já for a atual, cancela a execução
    if (secaoAtual === proximaSecao) return;

    dashboard.classList.toggle('tela-autenticacao-ativa', secao === 'cadastro' || secao === 'login');

    // ETAPA 1: Se existir uma seção ativa, faz o Fade-Out dela primeiro
    if (secaoAtual) {
        secaoAtual.classList.remove('fade-in');
        secaoAtual.classList.add('fade-out');

        // ETAPA 2: Espera a animação de saída terminar (300ms) para trocar o display
        setTimeout(() => {
            secaoAtual.classList.remove('active', 'fade-out');

            // Exibe a nova seção e ativa o Fade-In
            proximaSecao.classList.add('active', 'fade-in')
        }, 300); // 300ms (deve ser o mesmo tempo do animation no CSS)
    } else {
        // Se nenhuma estava ativa ainda (carregamento inicial)
        proximaSecao.classList.add('active', 'fade-in')
    }
}