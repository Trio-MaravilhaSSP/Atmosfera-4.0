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

// Helper para obter o ID do dispositivo de forma flexível
function obterIdDispositivo(item) {
    if (!item) return null;
    if (typeof item === 'number' || typeof item === 'string') return item;
    if (typeof item.dispositivo === 'object' && item.dispositivo !== null) {
        return item.dispositivo.id;
    }
    return item.dispositivo ?? item.dispositivoId ?? item.id_dispositivo ?? item.idDispositivoFK ?? item.id;
}

// Helper para ler o nome do dispositivo do DTO Java (nomeDispositivo ou nome)
function obterNomeDispositivo(disp) {
    if (!disp) return 'Dispositivo';
    return disp.nomeDispositivo || disp.nome || `Dispositivo ${disp.id}`;
}

// =============================================================
// 1. ATUALIZADOR PRINCIPAL DO GRÁFICO DE ALTITUDE E PRESSÃO
// =============================================================
export async function atualizarGraficoAltPress(dispositivoIdOuObjeto, modoAuto = false) {
    try {
        const dadosGerais = await carregarDadosGerais();

        if (!dadosGerais) {
            console.error("❌ [ERRO ALTI] Não foi possível obter os dados de carregarDadosGerais().");
            return;
        }

        const { dispositivos, alti } = dadosGerais;

        let dispositivo;
        if (typeof dispositivoIdOuObjeto === 'object' && dispositivoIdOuObjeto !== null) {
            dispositivo = dispositivoIdOuObjeto;
        } else {
            dispositivo = dispositivos ? dispositivos.find(d => d.id == dispositivoIdOuObjeto) : null;
        }

        if (!dispositivo) {
            console.error("❌ [ERRO ALTI] Dispositivo não encontrado para ID/Objeto:", dispositivoIdOuObjeto);
            return;
        }

        // --- 1. ATUALIZAÇÃO DOS INDICADORES NA TELA ---
        const nomeExibicao = obterNomeDispositivo(dispositivo);

        const elementoSeletor = document.querySelector('[data-seVa-2]');
        if (elementoSeletor) {
            elementoSeletor.innerHTML = modoAuto ? `Auto <br> (${nomeExibicao})` : nomeExibicao;
        }

        const indicadorTitulo = document.querySelector('#indicadorSala') || document.querySelector('.titulo-sala');
        if (indicadorTitulo) {
            indicadorTitulo.innerText = nomeExibicao;
        }

        // Filtrar dados verificando a FK e presença de data válida via parseDataJson
        const dadosDoDispositivo = alti ? alti.filter(item => {
            const mesmoDisp = obterIdDispositivo(item) == dispositivo.id;
            const dataValida = parseDataJson(item) !== null;
            return mesmoDisp && dataValida;
        }) : [];

        if (dadosDoDispositivo.length === 0) {
            console.warn(`⚠️ [AVISO ALTI] Nenhum dado de Altitude/Pressão encontrado para o dispositivo ID ${dispositivo.id}`);
            if (graficoAltPress) graficoAltPress.destroy();
            return;
        }

        // Descobre o registro mais recente convertendo para timestamp
        let dataMaisRecente = null;
        dadosDoDispositivo.forEach(item => {
            const d = parseDataJson(item);
            if (d && (!dataMaisRecente || d.getTime() > dataMaisRecente.getTime())) {
                dataMaisRecente = d;
            }
        });

        if (!dataMaisRecente) {
            console.error(`❌ [ERRO ALTI] Nenhuma data válida encontrada no histórico do dispositivo ID ${dispositivo.id}`);
            if (graficoAltPress) graficoAltPress.destroy();
            return;
        }

        // --- 2. DEFINIR JANELA DE 24 HORAS DE 1 EM 1 HORA ---
        const fimCiclo = arredondarHoras(dataMaisRecente);
        const inicioCiclo = new Date(fimCiclo.getTime() - (23 * 60 * 60 * 1000)); // 24 slots exatos (0 a 23h)

        const metrica24h = `${formatarDataHoraCompleta(inicioCiclo)} até ${formatarDataHoraCompleta(fimCiclo)}`;
        const elIntervalo24h = document.querySelector('#intervalo24h');
        if (elIntervalo24h) {
            elIntervalo24h.innerText = metrica24h;
        }

        // --- 3. GERAR OS 24 SLOTS FIXOS DE 1 EM 1 HORA ---
        const timelineMap = new Map();

        for (let i = 0; i < 24; i++) {
            const slotData = new Date(inicioCiclo.getTime() + (i * 60 * 60 * 1000));
            const labelHora = formatarHoraMinuto(slotData, false);
            timelineMap.set(slotData.getTime(), {
                horaFormatada: labelHora,
                somasAltitude: 0,
                qtdAltitude: 0,
                somasPressao: 0,
                qtdPressao: 0
            });
        }

        // --- 4. AGRUPAR DADOS NO SLOT CORRESPONDENTE ---
        dadosDoDispositivo.forEach(item => {
            const dataMedicao = parseDataJson(item);
            if (dataMedicao) {
                const chaveMs = arredondarHoras(dataMedicao).getTime();

                if (timelineMap.has(chaveMs)) {
                    const slot = timelineMap.get(chaveMs);

                    if (item.altitude !== undefined && item.altitude !== null) {
                        slot.somasAltitude += Number(item.altitude);
                        slot.qtdAltitude += 1;
                    }
                    if (item.pressao !== undefined && item.pressao !== null) {
                        slot.somasPressao += Number(item.pressao);
                        slot.qtdPressao += 1;
                    }
                }
            }
        });

        // --- 5. PREPARAR DADOS CONSOLIDADOS PARA O CHART.JS ---
        const slots = Array.from(timelineMap.values()).map(slot => {
            return {
                horaFormatada: slot.horaFormatada,
                altitude: slot.qtdAltitude > 0 ? Number((slot.somasAltitude / slot.qtdAltitude).toFixed(1)) : null,
                pressao: slot.qtdPressao > 0 ? Number((slot.somasPressao / slot.qtdPressao).toFixed(2)) : null
            };
        });

        const labels = slots.map(s => s.horaFormatada);
        const dadosAltitude = slots.map(s => s.altitude);
        const dadosPressao = slots.map(s => s.pressao);

        // --- 6. RENDERIZAÇÃO DO GRÁFICO DE BARRAS DUPLAS ---
        const ctxAltPress = document.getElementById('graficoAltitude');
        if (!ctxAltPress) {
            console.error("❌ [DOM ERRO] Canvas com ID 'graficoAltitude' não foi encontrado no HTML!");
            return;
        }

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
                            autoSkip: false,           // FORÇA A EXIBIÇÃO DE TODOS OS LABELS DE 1H
                            maxRotation: 45,
                            minRotation: 0,
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
        console.error("💥 [EXCEÇÃO CRÍTICA] Erro no gráfico de Altitude e Pressão:", error);
    }
}

// =============================================================
// 2. INICIALIZADOR PRINCIPAL (DROPDOWN / MODO AUTO)
// =============================================================
export async function initGraficoAlt(dispositivoId = 'auto', exibir = 'Auto') {
    try {
        if (intervalAutoAltPress) {
            clearInterval(intervalAutoAltPress);
            intervalAutoAltPress = null;
        }

        const dropOptions = document.querySelector('.dropdown-options');
        if (dropOptions) dropOptions.classList.remove('Select-active');

        const dadosGerais = await carregarDadosGerais();
        const dispositivos = dadosGerais ? dadosGerais.dispositivos : [];

        // Popula o menu suspenso dinamicamente
        if (typeof popularDropdownDispositivos === 'function') {
            popularDropdownDispositivos(dispositivos, 'initGraficoAlt', '#select-alti .dropdown-options');
        }

        // MODO AUTOMÁTICO ('auto' ou -2)
        if (dispositivoId === 'auto' || dispositivoId === -2) {
            if (!dispositivos || dispositivos.length === 0) {
                console.warn("⚠️ [AVISO ALTI] Nenhum dispositivo disponível para o modo automático.");
                return;
            }

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

    } catch (erroInit) {
        console.error("💥 [EXCEÇÃO CRÍTICA] Erro no initGraficoAlt():", erroInit);
    }
}

// Expõe a função globalmente
window.initGraficoAlt = initGraficoAlt;