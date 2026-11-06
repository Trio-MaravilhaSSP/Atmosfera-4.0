// =============================================================
// simulador.js — Módulo de Simulação e Envio de Dados IoT (POST)
// =============================================================

const API_BASE_URL = "http://10.83.139.51:8080";

let timerSimulacao = null;
let simulacaoAtiva = false;

// Helper para gerar número aleatório com decimais configuráveis
function gerarValorAleatorio(min, max, decimais = 1) {
    const minNum = parseFloat(min);
    const maxNum = parseFloat(max);
    if (isNaN(minNum) || isNaN(maxNum)) return 0;
    const valor = Math.random() * (maxNum - minNum) + minNum;
    return parseFloat(valor.toFixed(decimais));
}

// Helper para formatar Data/Hora no formato ISO local ("YYYY-MM-DDTHH:MM:SS")
function obterDataHoraISO() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    const segundos = String(agora.getSeconds()).padStart(2, '0');

    return `${ano}-${mes}-${dia}T${horas}:${minutos}:${segundos}`;
}

// Helper para formatar Data/Hora amigável na tela ("DD/MM/YYYY HH:MM:SS")
function obterDataHoraFormatada() {
    return new Date().toLocaleString('pt-BR');
}

function defineNome(nome) {
    switch (nome) {
        case 'Athurmorgan': return 1;
        case 'DutchVanderLindim': return 2;
        default: return 1; // Fallback para não enviar undefined
    }
}

function converterParaTimestamp(dataInput = new Date()) {
    const data = dataInput instanceof Date ? dataInput : new Date(dataInput);
    return isNaN(data.getTime()) ? Date.now() : data.getTime();
}

// Main: Ciclo de Leitura, Renderização e Disparo do POST
async function executarCicloSimulacao() {
    try {
        // 1. Ler parâmetros configurados na tela
        const nomeDispositivo = document.getElementById('deviceName')?.value || "Robô Sensor Principal";

        const tempMin = document.getElementById('tempMin')?.value || 10;
        const tempMax = document.getElementById('tempMax')?.value || 30;

        const umidMin = document.getElementById('umidMin')?.value || 60;
        const umidMax = document.getElementById('umidMax')?.value || 95;

        const pressMin = document.getElementById('pressMin')?.value || 90;
        const pressMax = document.getElementById('pressMax')?.value || 95;

        const altiMin = document.getElementById('altiMin')?.value || 770;
        const altiMax = document.getElementById('altiMax')?.value || 800;

        const luxMin = document.getElementById('luxMin')?.value || 200;
        const luxMax = document.getElementById('luxMax')?.value || 500;

        // Estado do LED Único (busca o primeiro checkbox de LED ou id genérico 'ledStatus')
        const elLed = document.getElementById('led1') || document.getElementById('ledStatus') || document.querySelector('.leds-grid input[type="checkbox"]');
        const ledAtivo = elLed ? elLed.checked : false;

        // 2. Gerar valores simulados dentro do intervalo
        const dispSimulado = defineNome(nomeDispositivo)
        const temperaturaSimulada = gerarValorAleatorio(tempMin, tempMax, 1);
        const umidadeSimulada = Math.round(gerarValorAleatorio(umidMin, umidMax, 0));
        const pressaoSimulada = Math.round(gerarValorAleatorio(pressMin, pressMax, 0));
        const altitudeSimulada = Math.round(gerarValorAleatorio(altiMin, altiMax, 0));
        const luminosidadeSimulada = Math.round(gerarValorAleatorio(luxMin, luxMax, 0));
        const dataHoraISO = obterDataHoraISO();
        const timestampMs = converterParaTimestamp();

        // 3. Montar o Payload padrão do DTO do Spring Boot
        const payloadMedicao = {
            dispositivo: dispSimulado, // Ajuste o ID conforme o cadastrado no seu banco de dados
            timestamp: timestampMs,
            dataHora: dataHoraISO,
            temperatura: temperaturaSimulada,
            umidade: umidadeSimulada,
            pressao: pressaoSimulada,
            altitude: altitudeSimulada,
            luminosidade: luminosidadeSimulada,
            intensidadeWifi: 30,
            velVento: 0,
            direcaoVento: 50,
        };

        console.log("🚀 [SIMULADOR] Enviando medição ao backend:", payloadMedicao);

        // 4. Disparo da requisição POST para a API Java
        const response = await fetch(`${API_BASE_URL}/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadMedicao)
        });

        if (!response.ok) {
            throw new Error(`Falha no envio HTTP ${response.status}`);
        }

        // 5. Atualizar Indicadores na Interface (Coluna da Direita)
        const elTimestamp = document.getElementById('displayTimestamp');
        if (elTimestamp) elTimestamp.innerText = obterDataHoraFormatada();

        const elTemp = document.getElementById('displayTemp');
        if (elTemp) elTemp.innerText = `${temperaturaSimulada} °C`;

        const elUmid = document.getElementById('displayUmid');
        if (elUmid) elUmid.innerText = `${umidadeSimulada} %`;

        const elLux = document.getElementById('displayLux');
        if (elLux) elLux.innerText = `${luminosidadeSimulada} %`;

        const elAlti = document.getElementById('displayAlti');
        if (elAlti) elAlti.innerText = `${altitudeSimulada} %`;

        const elPressao = document.getElementById('displayPressao');
        if (elPressao) elPressao.innerText = `${pressaoSimulada} %`;

        const elSinal = document.getElementById('displaySinal');
        if (elSinal) elSinal.innerText = `30 dBm`;

        const elLeds = document.getElementById('displayLeds');
        if (elLeds) {
            elLeds.innerText = ledAtivo ? "LIGADO" : "DESLIGADO";
            elLeds.className = `card-value ${ledAtivo ? 'text-emerald-400' : 'text-rose-400'}`;
        }

        console.log("✅ [SIMULADOR] Registro processado e exibido com sucesso!");

    } catch (erro) {
        console.error("💥 [ERRO SIMULADOR] Falha ao enviar registro simulado:", erro);
    }
}

// Controles de Início e Parada da Simulação
export function iniciarSimulacao() {
    if (simulacaoAtiva) return;

    simulacaoAtiva = true;

    const btnStart = document.getElementById('btnStart');
    const btnStop = document.getElementById('btnStop');
    const statusBadge = document.getElementById('statusBadge');

    if (btnStart) btnStart.disabled = true;
    if (btnStop) btnStop.disabled = false;

    if (statusBadge) {
        statusBadge.innerText = "Executando";
        statusBadge.className = "status-badge running";
    }

    executarCicloSimulacao();
    timerSimulacao = setInterval(executarCicloSimulacao, 60000);
    console.log("▶️ [SIMULADOR] Simulação iniciada (Intervalo: 1min).");
}

export function pararSimulacao() {
    if (!simulacaoAtiva) return;

    simulacaoAtiva = false;
    if (timerSimulacao) {
        clearInterval(timerSimulacao);
        timerSimulacao = null;
    }

    const btnStart = document.getElementById('btnStart');
    const btnStop = document.getElementById('btnStop');
    const statusBadge = document.getElementById('statusBadge');

    if (btnStart) btnStart.disabled = false;
    if (btnStop) btnStop.disabled = true;

    if (statusBadge) {
        statusBadge.innerText = "Parado";
        statusBadge.className = "status-badge stopped";
    }

    console.log("⏹️ [SIMULADOR] Simulação interrompida.");
}

// Inicialização dos Event Listeners na DOM
document.addEventListener('DOMContentLoaded', () => {
    const btnStart = document.getElementById('btnStart');
    const btnStop = document.getElementById('btnStop');

    if (btnStart) {
        btnStart.addEventListener('click', iniciarSimulacao);
    }

    if (btnStop) {
        btnStop.addEventListener('click', pararSimulacao);
    }
});

// Expõe globalmente
window.iniciarSimulacao = iniciarSimulacao;
window.pararSimulacao = pararSimulacao;