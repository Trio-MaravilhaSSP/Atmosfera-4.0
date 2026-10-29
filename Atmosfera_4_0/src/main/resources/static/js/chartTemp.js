// =============================================================
// chartTemp.js — Módulo do Gráfico de Temperatura e Umidade (1h)
// =============================================================

import {
    carregarDadosGerais,
    parseDataJson,
    arredondarHoras,
    formatarHoraMinuto,
    formatarDataHoraCompleta,
    popularDropdownDispositivos
} from './chartAll.js';

let graficoTendencia = null;
let intervalAutoTemp = null;
let indiceDispositivoAutoTemp = 0;

function obterIdDispositivo(item) {
    if (!item) return null;
    if (typeof item === 'number' || typeof item === 'string') return item;
    if (typeof item.dispositivo === 'object' && item.dispositivo !== null) {
        return item.dispositivo.id;
    }
    return item.dispositivo ?? item.dispositivoId ?? item.id_dispositivo ?? item.idDispositivoFK ?? item.id;
}

function obterNomeDispositivo(disp) {
    if (!disp) return 'Dispositivo';
    return disp.nomeDispositivo || disp.nome || `Dispositivo ${disp.id}`;
}

export async function atualizarGraficoTemp(dispositivoIdOuObjeto, modoAuto = false) {
    try {
        const dadosGerais = await carregarDadosGerais();
        if (!dadosGerais) return;

        const { dispositivos, temp } = dadosGerais;

        let dispositivo;
        if (typeof dispositivoIdOuObjeto === 'object' && dispositivoIdOuObjeto !== null) {
            dispositivo = dispositivoIdOuObjeto;
        } else {
            dispositivo = dispositivos ? dispositivos.find(d => d.id == dispositivoIdOuObjeto) : null;
        }

        if (!dispositivo) return;

        const nomeExibicao = obterNomeDispositivo(dispositivo);

        const elementoSeletor = document.querySelector('[data-seVa-0]');
        if (elementoSeletor) {
            elementoSeletor.innerHTML = modoAuto ? `Auto <br> (${nomeExibicao})` : nomeExibicao;
        }

        const indicadorTitulo = document.querySelector('#indicadorSala') || document.querySelector('.titulo-sala');
        if (indicadorTitulo) {
            indicadorTitulo.innerText = nomeExibicao;
        }

        const dadosDoDispositivo = temp ? temp.filter(item => {
            const mesmoDisp = obterIdDispositivo(item) == dispositivo.id;
            const temData = parseDataJson(item) !== null;
            return mesmoDisp && temData;
        }) : [];

        if (dadosDoDispositivo.length === 0) {
            if (graficoTendencia) graficoTendencia.destroy();
            return;
        }

        let dataMaisRecente = null;
        dadosDoDispositivo.forEach(item => {
            const d = parseDataJson(item);
            if (d && (!dataMaisRecente || d.getTime() > dataMaisRecente.getTime())) {
                dataMaisRecente = d;
            }
        });

        if (!dataMaisRecente) return;

        // --- DEFINIR JANELA EXATA DE 24 HORAS DE 1 EM 1 HORA ---
        const fimCiclo = arredondarHoras(dataMaisRecente);
        const inicioCiclo = new Date(fimCiclo.getTime() - (23 * 60 * 60 * 1000)); // 24 slots exatos (0 a 23h)

        const metrica24h = `${formatarDataHoraCompleta(inicioCiclo)} até ${formatarDataHoraCompleta(fimCiclo)}`;
        const elIntervalo24h = document.querySelector('#intervalo24h');
        if (elIntervalo24h) {
            elIntervalo24h.innerText = metrica24h;
        }

        // --- GERAR OS 24 SLOTS FIXOS DE 1 EM 1 HORA ---
        const timelineMap = new Map();

        for (let i = 0; i < 24; i++) {
            const slotData = new Date(inicioCiclo.getTime() + (i * 60 * 60 * 1000));
            const labelHora = formatarHoraMinuto(slotData, false);
            timelineMap.set(slotData.getTime(), {
                horaFormatada: labelHora,
                somasTemp: 0,
                qtdTemp: 0,
                somasUmid: 0,
                qtdUmid: 0
            });
        }

        // --- AGRUPAR DADOS NO SLOT CORRESPONDENTE ---
        dadosDoDispositivo.forEach(item => {
            const dataMedicao = parseDataJson(item);
            if (dataMedicao) {
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
                        tension: 0.3,
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
                        tension: 0.3,
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
                        ticks: {
                            autoSkip: false,           // FORÇA O CHART.JS A EXIBIR TODOS OS LABELS
                            maxRotation: 45,           // ROTAÇÃO SUAVE PARA NÃO AMASSAR O TEXTO
                            minRotation: 0
                        },
                        title: {
                            display: true,
                            text: `Últimas 24h — ${nomeExibicao} (${metrica24h})`
                        }
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
        console.error("💥 [EXCEÇÃO CRÍTICA] Erro no gráfico de Temperatura:", error);
    }
}

export async function initGraficoTemp(dispositivoId = 'auto', exibir = 'Auto') {
    try {
        if (intervalAutoTemp) {
            clearInterval(intervalAutoTemp);
            intervalAutoTemp = null;
        }

        const dropOptions = document.querySelector('.dropdown-options');
        if (dropOptions) dropOptions.classList.remove('Select-active');

        const dadosGerais = await carregarDadosGerais();
        const dispositivos = dadosGerais ? dadosGerais.dispositivos : [];

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

    } catch (erroInit) {
        console.error("💥 Erro no initGraficoTemp():", erroInit);
    }
}

window.initGraficoTemp = initGraficoTemp;