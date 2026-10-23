// =============================================================
// chartAlti.js — Módulo do Gráfico de Altitude e Pressão
// =============================================================

import { 
    carregarDadosGerais, 
    parseDataJson, 
    arredondarHoras, 
    formatarHoraMinuto, 
    formatarDataHoraCompleta,
    popularDropdownDispositivos
} from './chartAll.js';

// Instância local do gráfico do Chart.js
let graficoAltPress = null;
let intervalAutoAltPress = null;
let indiceDispositivoAutoAltPress = 0;

// =============================================================
// 1. ATUALIZADOR PRINCIPAL DO GRÁFICO DE ALTITUDE E PRESSÃO
// =============================================================
export async function atualizarGraficoAltPress(dispositivoIdOuObjeto, modoAuto = false) {
    try {
        const { dispositivos, alti } = await carregarDadosGerais();

        let dispositivo;
        if (typeof dispositivoIdOuObjeto === 'object') {
            dispositivo = dispositivoIdOuObjeto;
        } else {
            dispositivo = dispositivos.find(d => d.id == dispositivoIdOuObjeto);
        }

        if (!dispositivo) {
            console.error("Dispositivo não encontrado (Altitude/Pressão):", dispositivoIdOuObjeto);
            return;
        }

        // --- 1. ATUALIZAÇÃO DOS INDICADORES NA TELA ---
        const nomeExibicao = dispositivo.nome || `Dispositivo ${dispositivo.id}`;

        const elementoSeletor = document.querySelector('[data-seVa-2]');
        if (elementoSeletor) {
            elementoSeletor.innerHTML = modoAuto ? `Auto <br> (${nomeExibicao})` : nomeExibicao;
        }

        const indicadorTitulo = document.querySelector('#indicadorSala') || document.querySelector('.titulo-sala');
        if (indicadorTitulo) {
            indicadorTitulo.innerText = nomeExibicao;
        }

        // Filtrar dados do alti.json usando a FK 'dispositivo'
        const dadosDoDispositivo = alti.filter(item => item.dispositivo == dispositivo.id && item.data);

        if (dadosDoDispositivo.length === 0) {
            console.warn(`Nenhum dado de Altitude/Pressão encontrado para o dispositivo ${dispositivo.id}`);
            if (graficoAltPress) graficoAltPress.destroy();
            return;
        }

        // Descobre o registro mais recente
        let dataMaisRecente = null;
        dadosDoDispositivo.forEach(item => {
            const d = parseDataJson(item.data);
            if (!dataMaisRecente || d > dataMaisRecente) {
                dataMaisRecente = d;
            }
        });

        // --- 2. DEFINIR JANELA DE 24 HORAS (INTERVALO DE 1 HORA) ---
        const fimCiclo = arredondarHoras(dataMaisRecente);
        const inicioCiclo = new Date(fimCiclo.getTime() - (24 * 60 * 60 * 1000));

        const metrica24h = `${formatarDataHoraCompleta(inicioCiclo)} até ${formatarDataHoraCompleta(fimCiclo)}`;
        const elIntervalo24h = document.querySelector('#intervalo24h');
        if (elIntervalo24h) {
            elIntervalo24h.innerText = metrica24h;
        }

        // --- 3. GERAR OS SLOTS DE 1 EM 1 HORA (24 SLOTS NO TOTAL) ---
        const timelineMap = new Map();
        let ponteiroTempo = new Date(inicioCiclo);

        while (ponteiroTempo <= fimCiclo) {
            const labelHora = formatarHoraMinuto(ponteiroTempo, false);
            timelineMap.set(ponteiroTempo.getTime(), {
                horaFormatada: labelHora,
                altitude: null,
                pressao: null
            });
            ponteiroTempo.setHours(ponteiroTempo.getHours() + 1);
        }

        // --- 4. ALOCAR OS DADOS ARREDONDANDO PARA A HORA MAIS PRÓXIMA ---
        dadosDoDispositivo.forEach(item => {
            const dataMedicao = parseDataJson(item.data);
            if (dataMedicao >= inicioCiclo && dataMedicao <= fimCiclo) {
                const chaveMs = arredondarHoras(dataMedicao).getTime();
                if (timelineMap.has(chaveMs)) {
                    timelineMap.get(chaveMs).altitude = item.altitude;
                    timelineMap.get(chaveMs).pressao = item.pressao;
                }
            }
        });

        // --- 5. PREPARAR DADOS PARA O CHART.JS ---
        const slots = Array.from(timelineMap.values());
        const labels = slots.map(s => s.horaFormatada);
        const dadosAltitude = slots.map(s => s.altitude);
        const dadosPressao = slots.map(s => s.pressao);

        // --- 6. RENDERIZAÇÃO DO GRÁFICO DE BARRAS DUPLAS ---
        const ctxAltPress = document.getElementById('graficoAltitude');
        if (!ctxAltPress) return;

        if (graficoAltPress) {
            graficoAltPress.destroy();
        }

        graficoAltPress = new Chart(ctxAltPress, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Altitude (m)',
                        data: dadosAltitude,
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        borderRadius: 2,
                        yAxisID: 'yAltitude',
                        barPercentage: 0.9,
                        categoryPercentage: 0.9
                    },
                    {
                        label: 'Pressão (hPa)',
                        data: dadosPressao,
                        backgroundColor: 'rgba(153, 102, 255, 0.7)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1,
                        borderRadius: 2,
                        yAxisID: 'yPressao',
                        barPercentage: 0.9,
                        categoryPercentage: 0.9
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            maxRotation: 0,
                            callback: function (val) {
                                return this.getLabelForValue(val);
                            }
                        }
                    },
                    yAltitude: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: false,
                        min: 700,
                        max: 800,
                        title: { display: true, text: 'Altitude (Metros)' }
                    },
                    yPressao: {
                        type: 'linear',
                        position: 'right',
                        beginAtZero: false,
                        min: 0.88,
                        max: 0.98,
                        grid: { drawOnChartArea: false },
                        title: { display: true, text: 'Pressão (hPa)' }
                    }
                }
            }
        });

    } catch (error) {
        console.error("Erro ao renderizar o gráfico de Altitude e Pressão:", error);
    }
}

// =============================================================
// 2. INICIALIZADOR PRINCIPAL (DROPDOWN / MODO AUTO)
// =============================================================
export async function initGraficoAlt(dispositivoId = 'auto', exibir = 'Auto') {
    if (intervalAutoAltPress) {
        clearInterval(intervalAutoAltPress);
        intervalAutoAltPress = null;
    }

    const dropOptions = document.querySelector('.dropdown-options');
    if (dropOptions) dropOptions.classList.remove('Select-active');

    const { dispositivos } = await carregarDadosGerais();

    // Popula o menu suspenso dinamicamente com as opções
    if (typeof popularDropdownDispositivos === 'function') {
        popularDropdownDispositivos(dispositivos, 'initGraficoAlt', '#select-alti .dropdown-options');
    }

    // MODO AUTOMÁTICO ('auto' ou -2)
    if (dispositivoId === 'auto' || dispositivoId === -2) {
        if (!dispositivos || dispositivos.length === 0) return;

        const rodarCicloAuto = async () => {
            const dispAtual = dispositivos[indiceDispositivoAutoAltPress];
            await atualizarGraficoAltPress(dispAtual, true);
            indiceDispositivoAutoAltPress = (indiceDispositivoAutoAltPress + 1) % dispositivos.length;
        };

        await rodarCicloAuto();
        intervalAutoAltPress = setInterval(rodarCicloAuto, 15000);
        return;
    }

    // MODO SELEÇÃO MANUAL DE DISPOSITIVO
    const elSeletor = document.querySelector('[data-seVa-2]');
    if (elSeletor) elSeletor.innerText = exibir;

    await atualizarGraficoAltPress(dispositivoId, false);
}

// Expõe a função globalmente para compatibilidade com eventos onclick do HTML
window.initGraficoAlt = initGraficoAlt;

// Auto-inicialização automática ao carregar o módulo
initGraficoAlt('auto', 'Auto');