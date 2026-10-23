// =============================================================
// VARIÁVEIS DE CONTROLE GLOBAL
// =============================================================
var graficoTendencia = null;
var intervalAutoTemp = null;
var indiceSalaAutoTemp = 0;

// Caches em memória dos JSONs
var cacheSalasTemp = null;
var cacheDadosTemp = null;

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

async function carregarBancoDeDadosTemp() {
    if (!cacheSalasTemp || !cacheDadosTemp) {
        const [salasResp, dadosResp] = await Promise.all([
            fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json/salas.json"),
            fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json/temp.json")
        ]);
        cacheSalasTemp = await salasResp.json();
        cacheDadosTemp = await dadosResp.json();
    }
    return { bancoDeSalas: cacheSalasTemp, bancoDeDados: cacheDadosTemp };
}

// =============================================================
// 1. ATUALIZADOR PRINCIPAL DO GRÁFICO DE TEMPERATURA E UMIDADE
// =============================================================
async function atualizarGraficoTemp(salaIdOuObjeto, modoAuto = false) {
    try {
        const { bancoDeSalas, bancoDeDados } = await carregarBancoDeDadosTemp();

        let sala;
        if (typeof salaIdOuObjeto === 'object') {
            sala = salaIdOuObjeto;
        } else {
            sala = bancoDeSalas.find(s => s.id == salaIdOuObjeto);
        }

        if (!sala) {
            console.error("Sala não encontrada (Temp):", salaIdOuObjeto);
            return;
        }

        // --- 1. ATUALIZAÇÃO DOS INDICADORES NA TELA ---
        const nomeExibicao = sala.sala || sala.nome || `Laboratório ${sala.id}`;

        const elementoSeletor = document.querySelector('[data-seVa-0]');
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
            console.warn(`Nenhum dado de temperatura encontrado para a sala ${sala.id}`);
            if (graficoTendencia) graficoTendencia.destroy();
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

        // --- 2. DEFINIR JANELA DE 24 HORAS ---
        const fimCiclo = arredondarMinutos(dataMaisRecente, 5);
        const inicioCiclo = new Date(fimCiclo.getTime() - (24 * 60 * 60 * 1000));

        const metrica24h = `${formatarDataHoraCompleta(inicioCiclo)} até ${formatarDataHoraCompleta(fimCiclo)}`;
        const elIntervalo24h = document.querySelector('#intervalo24h');
        if (elIntervalo24h) {
            elIntervalo24h.innerText = metrica24h;
        }

        // --- 3. GERAR SLOTS DE 5 EM 5 MINUTOS ---
        const timelineMap = new Map();
        let ponteiroTempo = new Date(inicioCiclo);

        while (ponteiroTempo <= fimCiclo) {
            const labelHora = formatarHoraMinuto(ponteiroTempo);
            timelineMap.set(ponteiroTempo.getTime(), {
                horaFormatada: labelHora,
            });
            ponteiroTempo.setMinutes(ponteiroTempo.getMinutes() + 5);
        }

        // --- 4. PREENCHER OS SLOTS ---
        dadosDaSala.forEach(item => {
            const dataMedicao = parseDataJson(item.data);

            if (dataMedicao >= inicioCiclo && dataMedicao <= fimCiclo) {
                const chaveMs = arredondarMinutos(dataMedicao, 5).getTime();

                if (timelineMap.has(chaveMs)) {
                    timelineMap.get(chaveMs).temperatura = item.temperatura;
                    timelineMap.get(chaveMs).umidade = item.umidade;
                }
            }
        });

        // --- 5. PREPARAR DADOS PARA O CHART.JS ---
        const slots = Array.from(timelineMap.values());
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
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            maxRotation: 0,
                            callback: function (val, index) {
                                return index % 12 === 0 ? this.getLabelForValue(val) : '';
                            }
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
        console.error("Erro ao renderizar o gráfico de Temperatura:", error);
    }
}

// =============================================================
// 2. INICIALIZADOR PRINCIPAL (DROPDOWN / MODO AUTO)
// =============================================================
async function initGraficoTemp(salaId, exibir) {
    if (intervalAutoTemp) {
        clearInterval(intervalAutoTemp);
        intervalAutoTemp = null;
    }

    const dropOptions = document.querySelector('.dropdown-options');
    if (dropOptions) dropOptions.classList.remove('Select-active');

    // MODO AUTOMÁTICO (-2)
    if (salaId === -2) {
        const { bancoDeSalas } = await carregarBancoDeDadosTemp();

        if (!bancoDeSalas || bancoDeSalas.length === 0) return;

        const rodarCicloAuto = async () => {
            const salaAtual = bancoDeSalas[indiceSalaAutoTemp];
            await atualizarGraficoTemp(salaAtual, true);
            indiceSalaAutoTemp = (indiceSalaAutoTemp + 1) % bancoDeSalas.length;
        };

        await rodarCicloAuto();
        intervalAutoTemp = setInterval(rodarCicloAuto, 15000);

        return;
    }

    // MODO SELEÇÃO MANUAL
    const elSeletor = document.querySelector('[data-seVa]') || document.getElementById('selected-value');
    if (elSeletor) elSeletor.innerText = exibir;

    await atualizarGraficoTemp(salaId, false);
}

// Inicialização automática ao carregar
initGraficoTemp(-2, 'Auto');