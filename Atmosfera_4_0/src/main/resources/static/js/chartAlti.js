// =============================================================
// VARIÁVEIS DE CONTROLE GLOBAL
// =============================================================
var graficoAltPress = null;
var intervalAutoAltPress = null;
var indiceSalaAutoAltPress = 0;

// Caches em memória dos JSONs
var cacheSalasAltPress = null;
var cacheDadosAltPress = null;

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

async function carregarBancoDeDadosAltPress() {
    if (!cacheSalasAltPress || !cacheDadosAltPress) {
        const [salasResp, dadosResp] = await Promise.all([
            fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json/salas.json"),
            fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json/alti.json")
        ]);
        cacheSalasAltPress = await salasResp.json();
        cacheDadosAltPress = await dadosResp.json();
    }
    return { bancoDeSalas: cacheSalasAltPress, bancoDeDados: cacheDadosAltPress };
}

// =============================================================
// 1. ATUALIZADOR PRINCIPAL DO GRÁFICO DE ALTITUDE E PRESSÃO
// =============================================================
async function atualizarGraficoAltPress(salaIdOuObjeto, modoAuto = false) {
    try {
        const { bancoDeSalas, bancoDeDados } = await carregarBancoDeDadosAltPress();

        let sala;
        if (typeof salaIdOuObjeto === 'object') {
            sala = salaIdOuObjeto;
        } else {
            sala = bancoDeSalas.find(s => s.id == salaIdOuObjeto);
        }

        if (!sala) {
            console.error("Sala não encontrada (Altitude/Pressão): ", salaIdOuObjeto);
            return;
        }

        // --- 1. ATUALIZAÇÃO DOS INDICADORES NA TELA ---
        const nomeExibicao = sala.sala || `Laboratório ${sala.id}`;

        const elementoSeletor = document.querySelector('[data-seVa-2]');
        if (elementoSeletor) {
            elementoSeletor.innerText = modoAuto ? `Auto (${nomeExibicao})` : nomeExibicao;
        }

        const indicadorTitulo = document.querySelector('#indicadorSala') || document.querySelector('.titulo-sala');
        if (indicadorTitulo) {
            indicadorTitulo.innerText = nomeExibicao;
        }

        // Filtrar dados da sala
        const dadosDaSala = bancoDeDados.filter(item => item.sala == sala.id && item.data);

        if (dadosDaSala.length === 0) {
            console.warn(`Nenhum dado encontrado para a sala ${sala.id}`);
            if (graficoAltPress) graficoAltPress.destroy();
            return;
        }

        // Descobre o registro mais recente
        let dataMaisRecente = null;
        dadosDaSala.forEach(item => {
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
            const labelHora = formatarHoraMinuto(ponteiroTempo);
            timelineMap.set(ponteiroTempo.getTime(), {
                horaFormatada: labelHora,
                altitude: null,
                pressao: null
            });
            ponteiroTempo.setHours(ponteiroTempo.getHours() + 1); // Avança de 1 em 1 hora
        }

        // --- 4. ALOCAR OS DADOS ARREDONDANDO PARA A HORA MAIS PRÓXIMA ---
        dadosDaSala.forEach(item => {
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
                                // Exibe todas as 24 horas no eixo X
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
async function initGraficoAlt(salaId, exibir) {
    if (intervalAutoAltPress) {
        clearInterval(intervalAutoAltPress);
        intervalAutoAltPress = null;
    }

    const dropOptions = document.querySelector('.dropdown-options');
    if (dropOptions) dropOptions.classList.remove('Select-active');

    // MODO AUTOMÁTICO (-2)
    if (salaId === -2) {
        const { bancoDeSalas } = await carregarBancoDeDadosAltPress();

        if (!bancoDeSalas || bancoDeSalas.length === 0) return;

        const rodarCicloAuto = async () => {
            const salaAtual = bancoDeSalas[indiceSalaAutoAltPress];
            await atualizarGraficoAltPress(salaAtual, true);
            indiceSalaAutoAltPress = (indiceSalaAutoAltPress + 1) % bancoDeSalas.length;
        };

        await rodarCicloAuto();
        intervalAutoAltPress = setInterval(rodarCicloAuto, 15000);

        return;
    }

    // MODO SELEÇÃO MANUAL
    const elSeletor = document.querySelector('[data-seVa-2]');
    if (elSeletor) elSeletor.innerText = exibir;

    await atualizarGraficoAltPress(salaId, false);
}

// Inicialização automática ao carregar
initGraficoAlt(-2, 'Auto');