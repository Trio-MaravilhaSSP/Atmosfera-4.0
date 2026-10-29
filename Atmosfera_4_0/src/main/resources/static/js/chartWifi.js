// =============================================================
// chartWifi.js — Módulo do Manômetro (dBm) e Luminosidade (Lux)
// =============================================================

import {
    carregarDadosGerais,
    parseDataJson,
    arredondarHoras,
    formatarHoraMinuto,
    formatarDataHoraCompleta,
    dbmParaPorcentagem,
    popularDropdownDispositivos
} from './chartAll.js';

// Instâncias locais dos gráficos do Chart.js
let manometroChart = null;
let luminosidadeChart = null;

let intervalAuto = null;
let indiceDispositivoAuto = 0;

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
// 1. MANÔMETRO DE SINAL (dBm)
// =============================================================
const gaugeNeedle = {
    id: 'gaugeNeedle',
    afterDatasetDraw(chart) {
        const { ctx, config, chartArea: { left, width, height } } = chart;
        const dbmAtual = config.options.valorDbm ?? -90;

        ctx.save();

        const cx = width / 2 + left;
        const cy = chart.getDatasetMeta(0).data[0].y;

        const percentual = dbmParaPorcentagem(dbmAtual);
        const percentualInvertido = 100 - percentual;
        const anguloRad = Math.PI + (percentualInvertido / 100) * Math.PI;

        const needleRadius = (height / 1.5);

        ctx.translate(cx, cy);
        ctx.rotate(anguloRad);

        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(needleRadius, 0);
        ctx.lineTo(0, 5);
        ctx.fillStyle = '#94a3b8';
        ctx.fill();

        ctx.rotate(-anguloRad);
        ctx.translate(-cx, -cy);

        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#94a3b8';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
    }
};

export function renderizarManometro(valorSinalDbm) {
    const elementoCanvas = document.getElementById('graficoSinal');
    const valorTexto = document.getElementById('valorTexto');

    if (!elementoCanvas) {
        console.error("❌ [DOM ERRO] Canvas com ID 'graficoSinal' não foi encontrado no HTML!");
        return;
    }

    if (valorTexto) valorTexto.innerText = `${valorSinalDbm} dBm`;

    if (manometroChart) {
        manometroChart.options.valorDbm = valorSinalDbm;
        manometroChart.update();
        return;
    }

    manometroChart = new Chart(elementoCanvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [1, 1, 1],
                backgroundColor: ['#ff0514', '#ffe100', '#28e66e'],
                borderColor: 'transparent'
            }]
        },
        options: {
            valorDbm: valorSinalDbm,
            rotation: -90,
            circumference: 180,
            cutout: '70%',
            aspectRatio: 1.5,
            plugins: { tooltip: { enabled: false } }
        },
        plugins: [gaugeNeedle]
    });
}

// =============================================================
// 2. BARRAS DE LUMINOSIDADE (LUX)
// =============================================================
export function renderizarGraficoLuminosidade(historicoLuminosidade) {
    const elementoCanvas = document.getElementById('graficoLuminosidade');
    if (!elementoCanvas) {
        console.error("❌ [DOM ERRO] Canvas com ID 'graficoLuminosidade' não foi encontrado no HTML!");
        return;
    }

    const labels = historicoLuminosidade.map(item => item.horaFormatada);
    const valores = historicoLuminosidade.map(item => item.luminosidade);

    if (luminosidadeChart) {
        luminosidadeChart.data.labels = labels;
        luminosidadeChart.data.datasets[0].data = valores;
        luminosidadeChart.update();
        return;
    }

    luminosidadeChart = new Chart(elementoCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Luminosidade Média (Lux)',
                data: valores,
                backgroundColor: 'rgba(255, 206, 86, 0.6)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
                borderRadius: 2,
                barPercentage: 0.8,
                categoryPercentage: 0.9
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    autoSkip: false,
                    stepSize: 1,
                    grid: { display: false },
                    ticks: {
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 24
                    }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Lux' }
                }
            }
        }
    });
}

// =============================================================
// 3. ATUALIZADOR PRINCIPAL DO MÓDULO WIFI & LUMINOSIDADE
// =============================================================
export async function atualizarGraficoWifi(dispositivoIdOuObjeto, modoAuto = false) {
    try {
        const dadosGerais = await carregarDadosGerais();

        if (!dadosGerais) {
            console.error("❌ [ERRO WIFI] Não foi possível obter os dados de carregarDadosGerais().");
            return;
        }

        const { dispositivos, wifi } = dadosGerais;

        let dispositivo;
        if (typeof dispositivoIdOuObjeto === 'object' && dispositivoIdOuObjeto !== null) {
            dispositivo = dispositivoIdOuObjeto;
        } else {
            dispositivo = dispositivos ? dispositivos.find(d => d.id == dispositivoIdOuObjeto) : null;
        }

        if (!dispositivo) {
            console.error("❌ [ERRO WIFI] Dispositivo não encontrado para ID/Objeto:", dispositivoIdOuObjeto);
            return;
        }

        // --- 1. ATUALIZAÇÃO DOS INDICADORES NA TELA ---
        const nomeExibicao = obterNomeDispositivo(dispositivo);

        const elementoSeletor = document.querySelector('[data-seVa-1]');
        if (elementoSeletor) {
            elementoSeletor.innerHTML = modoAuto ? `Auto <br> (${nomeExibicao})` : nomeExibicao;
        }

        // Filtra os dados da tabela wifi verificando FK e presença de data/dataHora via parseDataJson
        const dadosDoDispositivo = wifi ? wifi.filter(item => {
            const mesmoDisp = obterIdDispositivo(item) == dispositivo.id;
            const dataValida = parseDataJson(item) !== null;
            return mesmoDisp && dataValida;
        }) : [];

        if (dadosDoDispositivo.length === 0) {
            console.warn(`⚠️ [AVISO WIFI] Nenhum dado com data válida encontrado para o dispositivo ID ${dispositivo.id}`);
            renderizarManometro(-90);
            renderizarGraficoLuminosidade([]);
            return;
        }

        // --- 2. DETERMINAR JANELA DE TEMPO (ÚLTIMAS 24 HORAS) ---
        let dataMaisRecente = null;
        dadosDoDispositivo.forEach(item => {
            const d = parseDataJson(item);
            if (d && (!dataMaisRecente || d.getTime() > dataMaisRecente.getTime())) {
                dataMaisRecente = d;
            }
        });

        if (!dataMaisRecente) {
            console.error(`❌ [ERRO WIFI] Nenhuma data válida encontrada no histórico do dispositivo ID ${dispositivo.id}`);
            return;
        }

        const fimCiclo = arredondarHoras(dataMaisRecente);
        const inicioCiclo = new Date(fimCiclo.getTime() - (24 * 60 * 60 * 1000));

        const metrica24h = `${formatarDataHoraCompleta(inicioCiclo)} até ${formatarDataHoraCompleta(fimCiclo)}`;
        const elIntervalo24h = document.querySelector('#intervalo24h');
        if (elIntervalo24h) {
            elIntervalo24h.innerText = metrica24h;
        }

        // --- 3. CRIAR OS 24 SLOTS HORÁRIOS ---
        const timelineMap = new Map();
        let ponteiroTempo = new Date(inicioCiclo);

        while (ponteiroTempo <= fimCiclo) {
            const labelHora = formatarHoraMinuto(ponteiroTempo, false);
            timelineMap.set(ponteiroTempo.getTime(), {
                horaFormatada: labelHora,
                somasLuminosidade: 0,
                qtdLuminosidade: 0,
                somasSinal: 0,
                qtdSinal: 0,
                luminosidade: null,
                sinal: null
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

                    if (item.luminosidade !== undefined && item.luminosidade !== null) {
                        slot.somasLuminosidade += Number(item.luminosidade);
                        slot.qtdLuminosidade += 1;
                    }
                    if (item.sinal !== undefined && item.sinal !== null) {
                        slot.somasSinal += Number(item.sinal);
                        slot.qtdSinal += 1;
                    }
                }
            }
        });

        // Consolida os valores das médias calculadas em cada hora
        const slots = Array.from(timelineMap.values()).map(slot => {
            return {
                horaFormatada: slot.horaFormatada,
                luminosidade: slot.qtdLuminosidade > 0 ? Math.round(slot.somasLuminosidade / slot.qtdLuminosidade) : 0,
                sinal: slot.qtdSinal > 0 ? Math.round(slot.somasSinal / slot.qtdSinal) : null
            };
        });

        // --- 5. ATUALIZAR INDICADORES COM O ÚLTIMO SLOT COM DADOS ---
        const slotsComDados = slots.filter(s => s.sinal !== null);
        const ultimoSlot = slotsComDados.length > 0 ? slotsComDados[slotsComDados.length - 1] : null;

        const sinalExibicao = ultimoSlot ? ultimoSlot.sinal : -90;
        const luxExibicao = ultimoSlot ? ultimoSlot.luminosidade : 0;

        renderizarManometro(sinalExibicao);

        const elLumi = document.querySelector('#valorLuminosidade');
        if (elLumi) {
            elLumi.innerText = `${luxExibicao} Lux`;
        }

        // --- 6. ATUALIZAR GRÁFICO DE LUMINOSIDADE (BARRAS DE 1H) ---
        renderizarGraficoLuminosidade(slots);

    } catch (error) {
        console.error("💥 [EXCEÇÃO CRÍTICA] Erro ao atualizar os gráficos de WiFi:", error);
    }
}

// =============================================================
// 4. INICIALIZADOR PRINCIPAL (DROPDOWN / MODO AUTO)
// =============================================================
export async function initGraficoWifi(dispositivoId = 'auto', exibir = 'Auto') {
    try {
        if (intervalAuto) {
            clearInterval(intervalAuto);
            intervalAuto = null;
        }

        const dropOptions = document.querySelector('.dropdown-options');
        if (dropOptions) dropOptions.classList.remove('Select-active');

        const dadosGerais = await carregarDadosGerais();
        const dispositivos = dadosGerais ? dadosGerais.dispositivos : [];

        // Popula o menu suspenso dinamicamente se a função utilitária existir
        if (typeof popularDropdownDispositivos === 'function') {
            popularDropdownDispositivos(dispositivos, 'initGraficoWifi', '#select-wifi .dropdown-options');
        }

        // MODO AUTOMÁTICO ('auto')
        if (dispositivoId === 'auto' || dispositivoId === -2) {
            if (!dispositivos || dispositivos.length === 0) {
                console.warn("⚠️ [AVISO WIFI] Nenhum dispositivo disponível para o modo automático.");
                return;
            }

            const rodarCicloAuto = async () => {
                const dispAtual = dispositivos[indiceDispositivoAuto];
                await atualizarGraficoWifi(dispAtual, true);
                indiceDispositivoAuto = (indiceDispositivoAuto + 1) % dispositivos.length;
            };

            await rodarCicloAuto();
            intervalAuto = setInterval(rodarCicloAuto, 15000);
            return;
        }

        // MODO SELEÇÃO MANUAL DE DISPOSITIVO
        const elSeletor = document.querySelector('[data-seVa-1]');
        if (elSeletor) elSeletor.innerText = exibir;

        await atualizarGraficoWifi(dispositivoId, false);

    } catch (erroInit) {
        console.error("💥 [EXCEÇÃO CRÍTICA] Erro na inicialização do initGraficoWifi():", erroInit);
    }
}

// Expõe a função globalmente para compatibilidade com os 'onclick' do HTML
window.initGraficoWifi = initGraficoWifi;