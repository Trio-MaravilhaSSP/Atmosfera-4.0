// =============================================================
// chartTemp.js — Módulo do Gráfico de Temperatura e Umidade (1h)
// =============================================================

import { 
    carregarDadosGerais, 
    parseDataJson, 
    arredondarHoras, 
    formatarHoraMinuto, 
    formatarDataHoraCompleta,
    popularDropdownDispositivos,
    obterIdDispositivo,
    obterNomeDispositivo
} from './chartAll.js';

// Instância local do gráfico do Chart.js
let graficoTendencia = null;
let intervalAutoTemp = null;
let indiceDispositivoAutoTemp = 0;

if (typeof Chart !== 'undefined') {
    if (localStorage.getItem("tema") == 'dark') Chart.defaults.color = '#ccc';
    else Chart.defaults.color = '#575757';

    Chart.defaults.font.family = 'Inter';
}

export async function atualizarGraficoTemp(dispositivoIdOuObjeto, modoAuto = false) {
    try {
        const { dispositivos, temp } = await carregarDadosGerais();

        let dispositivo;
        if (typeof dispositivoIdOuObjeto === 'object') {
            dispositivo = dispositivoIdOuObjeto;
        } else {
            dispositivo = dispositivos.find(d => d.id == dispositivoIdOuObjeto);
        }

        if (!dispositivo) {
            console.error("Dispositivo não encontrado (Temp):", dispositivoIdOuObjeto);
            return;
        }

        // --- 1. ATUALIZAÇÃO DOS INDICADORES NA TELA ---
        const nomeExibicao = obterNomeDispositivo(dispositivo);

        const elementoSeletor = document.querySelector('[data-seVa-0]');
        if (elementoSeletor) {
            elementoSeletor.innerHTML = modoAuto ? `Auto <br> (${nomeExibicao})` : nomeExibicao;
        }

        const indicadorTitulo = document.querySelector('#indicadorSala') || document.querySelector('.titulo-sala');
        if (indicadorTitulo) {
            indicadorTitulo.innerText = nomeExibicao;
        }

        // Filtrar dados usando helpers seguros (trata dataHora e ID flexível)
        const dadosDoDispositivo = temp.filter(item => {
            return obterIdDispositivo(item) == dispositivo.id && parseDataJson(item) !== null;
        });

        if (dadosDoDispositivo.length === 0) {
            console.warn(`Nenhum dado de temperatura encontrado para o dispositivo ${dispositivo.id}`);
            if (graficoTendencia) graficoTendencia.destroy();
            return;
        }

        // Descobre o registro mais recente com validação de segurança
        let dataMaisRecente = null;
        dadosDoDispositivo.forEach(item => {
            const d = parseDataJson(item);
            if (d && (!dataMaisRecente || d > dataMaisRecente)) {
                dataMaisRecente = d;
            }
        });

        if (!dataMaisRecente) {
            console.warn("Sem data válida para Temperatura.");
            if (graficoTendencia) graficoTendencia.destroy();
            return;
        }

        // --- 2. DEFINIR JANELA DE 24 HORAS (INTERVALO DE 1 HORA) ---
        const fimCiclo = arredondarHoras(dataMaisRecente);
        const inicioCiclo = new Date(fimCiclo.getTime() - (24 * 60 * 60 * 1000));

        const metrica24h = `${formatarDataHoraCompleta(inicioCiclo)} até ${formatarDataHoraCompleta(fimCiclo)}`;
        const elIntervalo24h = document.querySelector('#intervalo24h');
        if (elIntervalo24h) {
            elIntervalo24h.innerText = metrica24h;
        }

        // --- 3. GERAR OS SLOTS DE 1 EM 1 HORA ---
        const timelineMap = new Map();
        let ponteiroTempo = new Date(inicioCiclo);

        while (ponteiroTempo <= fimCiclo) {
            const labelHora = formatarHoraMinuto(ponteiroTempo, false);
            timelineMap.set(ponteiroTempo.getTime(), {
                horaFormatada: labelHora,
                somasTemp: 0,
                qtdTemp: 0,
                somasUmid: 0,
                qtdUmid: 0,
                temperatura: null,
                umidade: null
            });
            ponteiroTempo.setHours(ponteiroTempo.getHours() + 1);
        }

        // --- 4. AGRUPAR DADOS DE 1 EM 1 HORA E CALCULAR MÉDIAS ---
        dadosDoDispositivo.forEach(item => {
            const dataMedicao = parseDataJson(item);

            if (dataMedicao && dataMedicao >= inicioCiclo && dataMedicao <= fimCiclo) {
                const chaveMs = arredondarHoras(dataMedicao).getTime();

                if (timelineMap.has(chaveMs)) {
                    const slot = timelineMap.get(chaveMs);

                    if (item.temperatura !== undefined && item.temperatura !== null) {
                        slot.somasTemp += Number(item.temperatura);
                        slot.qtdTemp += 1;
                    }
                    if (item.umidade !== undefined && item.umidade !== null) {
                        slot.somasUmid += Number(item.umidade);
                        slot.qtdUmid += 1;
                    }
                }
            }
        });

        // --- 5. PREPARAR DADOS CONSOLIDADOS PARA O CHART.JS ---
        const slots = Array.from(timelineMap.values()).map(slot => {
            return {
                horaFormatada: slot.horaFormatada,
                temperatura: slot.qtdTemp > 0 ? Number((slot.somasTemp / slot.qtdTemp).toFixed(1)) : null,
                umidade: slot.qtdUmid > 0 ? Math.round(slot.somasUmid / slot.qtdUmid) : null
            };
        });

        const labels = slots.map(s => s.horaFormatada);
        const dadosTemperatura = slots.map(s => s.temperatura);
        const dadosUmidade = slots.map(s => s.umidade);

        // --- 6. RENDERIZAÇÃO DO GRÁFICO ---
        const ctxTemp = document.getElementById('graficoTempUmi');
        if (!ctxTemp) return;

        if (graficoTendencia) {
            graficoTendencia.destroy();
        }

        graficoTendencia = new Chart(ctxTemp, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Temperatura (°C)',
                        data: dadosTemperatura,
                        borderColor: '#ff828a',
                        backgroundColor: 'rgba(255, 130, 138, 0.15)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true,
                        yAxisID: 'yTemp',
                        spanGaps: true
                    },
                    {
                        label: 'Umidade (%)',
                        data: dadosUmidade,
                        borderColor: '#42a5f5',
                        backgroundColor: 'rgba(66, 165, 245, 0.15)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true,
                        yAxisID: 'yUmid',
                        spanGaps: true
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
                        ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 },
                        title: { display: true, text: `Últimas 24h — ${nomeExibicao} (${metrica24h})` }
                    },
                    yTemp: {
                        type: 'linear',
                        position: 'left',
                        min: 0,
                        max: 50,
                        title: { display: true, text: 'Temperatura (°C)' }
                    },
                    yUmid: {
                        type: 'linear',
                        position: 'right',
                        min: 0,
                        max: 100,
                        grid: { drawOnChartArea: false },
                        title: { display: true, text: 'Umidade (%)' }
                    }
                }
            }
        });

    } catch (error) {
        console.error("Erro ao renderizar o gráfico de Temperatura:", error);
    }
}

export async function initGraficoTemp(dispositivoId = 'auto', exibir = 'Auto') {
    if (intervalAutoTemp) {
        clearInterval(intervalAutoTemp);
        intervalAutoTemp = null;
    }

    const dropOptions = document.querySelector('.dropdown-options');
    if (dropOptions) dropOptions.classList.remove('Select-active');

    const { dispositivos } = await carregarDadosGerais();

    if (typeof popularDropdownDispositivos === 'function') {
        popularDropdownDispositivos(dispositivos, 'initGraficoTemp', '#select-temp .dropdown-options');
    }

    if (dispositivoId === 'auto' || dispositivoId === -2) {
        if (!dispositivos || dispositivos.length === 0) return;

        const rodarCicloAuto = async () => {
            const dispAtual = dispositivos[indiceDispositivoAutoTemp];
            await atualizarGraficoTemp(dispAtual, true);
            indiceDispositivoAutoTemp = (indiceDispositivoAutoTemp + 1) % dispositivos.length;
        };

        await rodarCicloAuto();
        intervalAutoTemp = setInterval(rodarCicloAuto, 15000);
        return;
    }

    const elSeletor = document.querySelector('[data-seVa-0]');
    if (elSeletor) elSeletor.innerText = exibir;

    await atualizarGraficoTemp(dispositivoId, false);
}

window.initGraficoTemp = initGraficoTemp;