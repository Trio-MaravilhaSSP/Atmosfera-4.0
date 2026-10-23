// =============================================================
// VARIÁVEIS DE CONTROLE GLOBAL
// =============================================================
var manometroChart = null;
var luminosidadeChart = null;

var intervalAuto = null;
var indiceSalaAuto = 0;

// Caches em memória dos JSONs
var cacheSalas = null;
var cacheDados = null;

// =============================================================
// FUNÇÕES UTILITÁRIAS DE DATA E FORMATOS
// =============================================================
function arredondarHoras(date) {
    const ms = 1000 * 60 * 60;
    return new Date(Math.round(date.getTime() / ms) * ms);
}

function formatarHoraMinuto(date) {
    const horas = String(date.getHours()).padStart(2, '0');
    return `${horas}:00`;
}

function formatarDataHoraCompleta(date) {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const horas = String(date.getHours()).padStart(2, '0');
    return `${dia}/${mes} ${horas}:00`;
}

function parseDataJson(dataStr) {
    if (!dataStr) return null;
    const partes = dataStr.split(/[:\-\sT\/]/);
    return new Date(
        partes[0],
        partes[1] - 1,
        partes[2],
        partes[3] || 0,
        partes[4] || 0,
        partes[5] || 0
    );
}

function dbmParaPorcentagem(dbm) {
    const minDbm = -90;
    const maxDbm = -30;

    if (dbm <= minDbm) return 0;
    if (dbm >= maxDbm) return 100;

    return ((dbm - minDbm) / (maxDbm - minDbm)) * 100;
}

async function carregarBancoDeDados() {
    if (!cacheSalas || !cacheDados) {
        const [salasResp, dadosResp] = await Promise.all([
            fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json/salas.json"),
            fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json/wifi.json")
        ]);
        cacheSalas = await salasResp.json();
        cacheDados = await dadosResp.json();
    }
    return { bancoDeSalas: cacheSalas, bancoDeDados: cacheDados };
}

// =============================================================
// 1. MANÔMETRO DE SINAL (dBm)
// =============================================================
var gaugeNeedle = {
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

function renderizarManometro(valorSinalDbm) {
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
function renderizarGraficoLuminosidade(historicoLuminosidade) {
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
// 3. ATUALIZADOR PRINCIPAL DE TODOS OS GRÁFICOS E INDICADORES
// =============================================================
async function atualizarGraficoWifi(salaIdOuObjeto, modoAuto = false) {
    try {
        const { bancoDeSalas, bancoDeDados } = await carregarBancoDeDados();

        let sala;
        if (typeof salaIdOuObjeto === 'object') {
            sala = salaIdOuObjeto;
        } else {
            sala = bancoDeSalas.find(s => s.id == salaIdOuObjeto);
        }

        if (!sala) {
            console.error("Sala não encontrada:", salaIdOuObjeto);
            return;
        }

        // --- 1. ATUALIZAÇÃO DOS INDICADORES NA TELA ---
        const nomeExibicao = sala.sala || `Laboratório ${sala.id}`;

        const elementoSeletor = document.querySelector('[data-seVa-1]');
        if (elementoSeletor) {
            elementoSeletor.innerText = modoAuto ? `Auto (${nomeExibicao})` : nomeExibicao;
        }

        const dadosDaSala = bancoDeDados.filter(item => item.sala == sala.id && item.data);

        if (dadosDaSala.length === 0) {
            console.warn(`Sem registros para a sala ${sala.id}`);
            return;
        }

        // --- 2. DETERMINAR JANELA DE TEMPO (ÚLTIMAS 24 HORAS) ---
        let dataMaisRecente = null;
        dadosDaSala.forEach(item => {
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
            const labelHora = formatarHoraMinuto(ponteiroTempo);
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
        dadosDaSala.forEach(item => {
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
        console.error("Erro ao atualizar os gráficos:", error);
    }
}

// =============================================================
// 4. INICIALIZADOR PRINCIPAL (DROPDOWN / MODO AUTO)
// =============================================================
async function initGraficoWifi(salaId, exibir) {
    if (intervalAuto) {
        clearInterval(intervalAuto);
        intervalAuto = null;
    }

    const dropOptions = document.querySelector('.dropdown-options');
    if (dropOptions) dropOptions.classList.remove('Select-active');

    // MODO AUTOMÁTICO (-2)
    if (salaId === -2) {
        const { bancoDeSalas } = await carregarBancoDeDados();

        if (!bancoDeSalas || bancoDeSalas.length === 0) return;

        const rodarCicloAuto = async () => {
            const salaAtual = bancoDeSalas[indiceSalaAuto];
            await atualizarGraficoWifi(salaAtual, true);
            indiceSalaAuto = (indiceSalaAuto + 1) % bancoDeSalas.length;
        };

        await rodarCicloAuto();
        intervalAuto = setInterval(rodarCicloAuto, 15000);

        return;
    }

    // MODO SELEÇÃO MANUAL
    const elSeletor = document.querySelector('[data-seVa-1]');
    if (elSeletor) elSeletor.innerText = exibir;

    await atualizarGraficoWifi(salaId, false);
}

// Inicializa no modo Auto por padrão
initGraficoWifi(-2, 'Auto');