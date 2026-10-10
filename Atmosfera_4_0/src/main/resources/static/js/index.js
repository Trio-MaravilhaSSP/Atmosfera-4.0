function textTooltip() {
    const pTema = document.getElementById('Tooltip-P-Tema');
    const pImage = document.getElementById('Tooltip-P-Image');
    const btn = document.getElementById('Tooltip-Btn-Image');

    let temaAtual = localStorage.getItem('tema') === 'light' ? 'Claro' : 'Escuro';
    pTema.textContent = `Tema: ${temaAtual}`;

    const imageStatus = localStorage.getItem('backgroundImage') === 'on' ? 'On' : 'Off';
    pImage.textContent = `Imagem: ${imageStatus}`;
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

    const temaAtual = body.classList.contains('dark') ? 'dark' : 'light';

    localStorage.setItem('tema', temaAtual);
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