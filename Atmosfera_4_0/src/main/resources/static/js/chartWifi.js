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
function arredondarMinutos(date, minutos = 5) {
    const ms = 1000 * 60 * minutos;
    return new Date(Math.round(date.getTime() / ms) * ms);
}

function formatarHoraMinuto(date) {
    const horas = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${horas}:${mins}`;
}

function formatarDataHoraCompleta(date) {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const horas = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} ${horas}:${mins}`;
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
                label: 'Luminosidade (Lux)',
                data: valores,
                backgroundColor: 'rgba(255, 206, 86, 0.6)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 1.0,
                categoryPercentage: 1.0
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 0,
                        callback: function (val, index) {
                            return index % 12 === 0 ? this.getLabelForValue(val) : '';
                        }
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
        const nomeExibicao = sala.sala || sala.nome || `Laboratório ${sala.id}`;

        // Atualiza a interface com o seletor genérico por atributo ou id
        const elementoSeletor = document.querySelector('[data-seVa-1]');
        if (elementoSeletor) {
            elementoSeletor.innerText = modoAuto ? `Auto (${nomeExibicao})` : nomeExibicao;
        }

        const indicadorTitulo = document.querySelector('#indicadorSala') || document.querySelector('.titulo-sala');
        if (indicadorTitulo) {
            indicadorTitulo.innerText = nomeExibicao;
        }

        const dadosDaSala = bancoDeDados.filter(item => item.sala == sala.id && item.data);

        if (dadosDaSala.length === 0) {
            console.warn(`Sem registros para a sala ${sala.id}`);
            return;
        }

        // --- 2. Atualizar Manômetro (Sinal dBm) ---
        const ultimoRegistro = dadosDaSala[dadosDaSala.length - 1];
        const sinalAtual = ultimoRegistro?.sinal ?? -90;

        renderizarManometro(sinalAtual);

        // --- 3. Atualizar Indicadores Numéricos ---
        const elLumi = document.querySelector('#valorLuminosidade');
        if (elLumi && ultimoRegistro.luminosidade !== undefined) {
            elLumi.innerText = `${ultimoRegistro.luminosidade} Lux`;
        }

        // --- 4. Métrica de Tempo (Janela de 24h) ---
        let dataMaisRecente = null;
        dadosDaSala.forEach(item => {
            const d = parseDataJson(item.data);
            if (!dataMaisRecente || d > dataMaisRecente) dataMaisRecente = d;
        });

        const fimCiclo = arredondarMinutos(dataMaisRecente, 5);
        const inicioCiclo = new Date(fimCiclo.getTime() - (24 * 60 * 60 * 1000));

        const metrica24h = `${formatarDataHoraCompleta(inicioCiclo)} até ${formatarDataHoraCompleta(fimCiclo)}`;
        const elIntervalo24h = document.querySelector('#intervalo24h');
        if (elIntervalo24h) {
            elIntervalo24h.innerText = metrica24h;
        }

        // Montagem da Timeline em intervalos de 5 minutos
        const timelineMap = new Map();
        let ponteiroTempo = new Date(inicioCiclo);

        while (ponteiroTempo <= fimCiclo) {
            const labelHora = formatarHoraMinuto(ponteiroTempo);
            timelineMap.set(ponteiroTempo.getTime(), {
                horaFormatada: labelHora,
                luminosidade: null
            });
            ponteiroTempo.setMinutes(ponteiroTempo.getMinutes() + 5);
        }

        dadosDaSala.forEach(item => {
            const dataMedicao = parseDataJson(item.data);
            if (dataMedicao >= inicioCiclo && dataMedicao <= fimCiclo) {
                const chaveMs = arredondarMinutos(dataMedicao, 5).getTime();
                if (timelineMap.has(chaveMs)) {
                    timelineMap.get(chaveMs).luminosidade = item.luminosidade;
                }
            }
        });

        const slots = Array.from(timelineMap.values());

        // --- 5. Atualizar Gráfico de Luminosidade ---
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
    const elSeletor = document.querySelector('[data-seVa]') || document.getElementById('selected-value');
    if (elSeletor) elSeletor.innerText = exibir;

    await atualizarGraficoWifi(salaId, false);
}

// Inicializa no modo Auto por padrão
initGraficoWifi(-2, 'Auto');