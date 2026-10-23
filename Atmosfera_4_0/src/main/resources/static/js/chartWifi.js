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

    if (!elementoCanvas) return;
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
    if (!elementoCanvas) return;

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
        const { dispositivos, wifi } = await carregarDadosGerais();

        let dispositivo;
        if (typeof dispositivoIdOuObjeto === 'object') {
            dispositivo = dispositivoIdOuObjeto;
        } else {
            dispositivo = dispositivos.find(d => d.id == dispositivoIdOuObjeto);
        }

        if (!dispositivo) {
            console.error("Dispositivo não encontrado:", dispositivoIdOuObjeto);
            return;
        }

        // --- 1. ATUALIZAÇÃO DOS INDICADORES NA TELA ---
        const nomeExibicao = dispositivo.nome || `Dispositivo ${dispositivo.id}`;

        const elementoSeletor = document.querySelector('[data-seVa-1]');
        if (elementoSeletor) {
            elementoSeletor.innerHTML = modoAuto ? `Auto <br> (${nomeExibicao})` : nomeExibicao;
        }

        // Filtra os dados da tabela wifi.json usando a FK 'dispositivo'
        const dadosDoDispositivo = wifi.filter(item => item.dispositivo == dispositivo.id && item.data);

        if (dadosDoDispositivo.length === 0) {
            console.warn(`Sem registros para o dispositivo ${dispositivo.id}`);
            return;
        }

        // --- 2. DETERMINAR JANELA DE TEMPO (ÚLTIMAS 24 HORAS) ---
        let dataMaisRecente = null;
        dadosDoDispositivo.forEach(item => {
            const d = parseDataJson(item.data);
            if (!dataMaisRecente || d > dataMaisRecente) dataMaisRecente = d;
        });

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
            const dataMedicao = parseDataJson(item.data);
            if (dataMedicao >= inicioCiclo && dataMedicao <= fimCiclo) {
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
        console.error("Erro ao atualizar os gráficos de WiFi:", error);
    }
}

// =============================================================
// 4. INICIALIZADOR PRINCIPAL (DROPDOWN / MODO AUTO)
// =============================================================
export async function initGraficoWifi(dispositivoId, exibir) {
    if (intervalAuto) {
        clearInterval(intervalAuto);
        intervalAuto = null;
    }

    const dropOptions = document.querySelector('.dropdown-options');
    if (dropOptions) dropOptions.classList.remove('Select-active');

    const { dispositivos } = await carregarDadosGerais();

    // Popula o menu suspenso dinamicamente se a função utilitária existir
    if (typeof popularDropdownDispositivos === 'function') {
        popularDropdownDispositivos(dispositivos, 'initGraficoWifi', '#select-wifi .dropdown-options');
    }

    // MODO AUTOMÁTICO ('auto')
    if (dispositivoId === 'auto') {
        if (!dispositivos || dispositivos.length === 0) return;

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
}

// Expõe a função globalmente para compatibilidade com os 'onclick' do HTML
window.initGraficoWifi = initGraficoWifi;

// Auto-inicializa no carregamento do módulo
initGraficoWifi('auto', 'Auto');