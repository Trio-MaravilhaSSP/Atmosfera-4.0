// chartAll.js

// Caches globais compartilhados no módulo
let cache = {
    dispositivos: null,
    atuadores: null,
    wifi: null,
    temp: null,
    alti: null
};

/*
// Função para teste local sem o backend
export async function carregarDadosGerais() {
    if (!cache.dispositivos || !cache.wifi || !cache.temp || !cache.alti) {
        const baseUrl = "http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json/";
        const [disp, atua, wifi, temp, alti] = await Promise.all([
            fetch(baseUrl + "dispositivo.json").then(r => r.json()),
            fetch(baseUrl + "atuador.json").then(r => r.json()),
            fetch(baseUrl + "wifi.json").then(r => r.json()),
            fetch(baseUrl + "temp.json").then(r => r.json()),
            fetch(baseUrl + "alti.json").then(r => r.json())
        ]);

        cache = { dispositivos: disp, atuadores: atua, wifi, temp, alti };
    }
    return cache;
}*/

// Função para o teste com o backend
export async function carregarDadosGerais() {
    if (!cache.dispositivos || !cache.wifi || !cache.temp || !cache.alti) {
        const baseUrl = "http://10.83.139.51:8080/";
        const [disp, atua, wifi, temp, alti] = await Promise.all([
            fetch(baseUrl + "dispositivo").then(r => r.json()),
            fetch(baseUrl + "atuador").then(r => r.json()),
            fetch(baseUrl + "dashboard/sinal").then(r => r.json()),
            fetch(baseUrl + "dashboard/temperatura").then(r => r.json()),
            fetch(baseUrl + "dashboard/altitude").then(r => r.json())
        ]);

        cache = { dispositivos: disp, atuadores: atua, wifi, temp, alti };
    }
    return cache;
}

export function parseDataJson(dado) {
    if (!dado) return null;

    // Se passou o objeto inteiro (ex: item), extrai a propriedade de data automaticamente
    if (typeof dado === 'object') {
        dado = dado.dataHora ?? dado.data ?? dado.data_hora ?? null;
        if (!dado) return null;
    }

    // Se já for uma instância de Date
    if (dado instanceof Date) return dado;

    // Converte formato ISO nativamente ("2026-10-09T15:40:04")
    const dataParsed = new Date(dado);
    if (!isNaN(dataParsed.getTime())) {
        return dataParsed;
    }

    // Fallback manual para formatos sem 'T' (ex: "2026-10-09 15:40:04")
    const partes = String(dado).split(/[:\-\sT\/]/);
    return new Date(
        partes[0],
        partes[1] - 1,
        partes[2],
        partes[3] || 0,
        partes[4] || 0,
        partes[5] || 0
    );
}

export function arredondarHoras(date) {
    const ms = 1000 * 60 * 60;
    return new Date(Math.round(date.getTime() / ms) * ms);
}

export function formatarDataHoraCompleta(date) {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const horas = String(date.getHours()).padStart(2, '0');
    return `${dia}/${mes} ${horas}:00`;
}

export function formatarHoraMinuto(date, incluirMinutos = false) {
    const horas = String(date.getHours()).padStart(2, '0');
    if (!incluirMinutos) return `${horas}:00`;
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${horas}:${mins}`;
}

export function dbmParaPorcentagem(dbm) {
    const minDbm = -90, maxDbm = -30;
    if (dbm <= minDbm) return 0;
    if (dbm >= maxDbm) return 100;
    return ((dbm - minDbm) / (maxDbm - minDbm)) * 100;
}

// chartAll.js

/**
 * Preenche o elemento HTML do Dropdown com os dispositivos vindos do dispositivo.json
 * @param {Array} listaDispositivos - Array de objetos do dispositivo.json
 * @param {String} nomeFuncaoCallback - Nome da função JS a ser chamada no onclick (ex: 'initGraficoWifi')
 */
// chartAll.js
export function popularDropdownDispositivos(listaDispositivos, nomeFuncaoCallback, seletorContainer) {
    // Procura APENAS o dropdown do card específico
    const dropOptions = document.querySelector(seletorContainer);
    if (!dropOptions || !listaDispositivos) return;

    let htmlOptions = `
        <div class="option" onclick="${nomeFuncaoCallback}('auto', 'Auto')">
            Auto
        </div>
    `;

    listaDispositivos.forEach(dispositivo => {
        const nomeFormatado = dispositivo.nome || `Dispositivo ${dispositivo.id}`;

        htmlOptions += `
            <div class="option" onclick="${nomeFuncaoCallback}('${dispositivo.id}', '${nomeFormatado}')">
                ${nomeFormatado}
            </div>
        `;
    });

    dropOptions.innerHTML = htmlOptions;
}