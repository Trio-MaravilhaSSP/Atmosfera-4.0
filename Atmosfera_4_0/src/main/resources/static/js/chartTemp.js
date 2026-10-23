// Instâncias globais de controle
var graficoTendencia = null;
var intervalAuto = null;
var salaAtualAuto = 0;

// Caches globais para não refazer fetch a cada 15 segundos
var cacheSalas = null;
var cacheDados = null;

function arredondarMinutos(date, minutos = 5) {
    const ms = 1000 * 60 * minutos;
    return new Date(Math.round(date.getTime() / ms) * ms);
}

function formatarHoraMinuto(date) {
    const horas = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${horas}:${mins}`;
}

/**
 * Converte string 'YYYY-MM-DD HH:mm:ss' em objeto Date no fuso local
 */
function parseDataJson(dataStr) {
    if (!dataStr) return null;
    const partes = dataStr.split(/[- :]/);
    return new Date(
        partes[0],
        partes[1] - 1,
        partes[2],
        partes[3] || 0,
        partes[4] || 0,
        partes[5] || 0
    );
}

/**
 * Busca os dados dos JSONs (Apenas na primeira vez)
 */
async function carregarBancoDeDados() {
    if (!cacheSalas || !cacheDados) {
        const [salasResp, dadosResp] = await Promise.all([
            fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/bancoDeSalas.json"),
            fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json.json")
        ]);
        cacheSalas = await salasResp.json();
        cacheDados = await dadosResp.json();
    }
    return { bancoDeSalas: cacheSalas, bancoDeDados: cacheDados };
}

/**
 * Monta e renderiza o gráfico para a sala informada
 */
async function renderizarGrafico(salaId) {
    try {
        const { bancoDeSalas, bancoDeDados } = await carregarBancoDeDados();

        const sala = bancoDeSalas.find(s => s.id == salaId);
        if (!sala) return console.error("Sala não encontrada com id:", salaId);

        // 1. FILTRAR DADOS DA SALA
        const dadosDaSala = bancoDeDados.filter(item => item.sala == sala.id && item.data);

        if (dadosDaSala.length === 0) {
            console.warn(`Nenhum dado encontrado para a sala ${salaId}`);
            if (graficoTendencia) graficoTendencia.destroy();
            return;
        }

        // Descobre a data/hora do registro mais recente
        let dataMaisRecente = null;
        dadosDaSala.forEach(item => {
            const d = parseDataJson(item.data);
            if (!dataMaisRecente || d > dataMaisRecente) {
                dataMaisRecente = d;
            }
        });

        // 2. DEFINIR JANELA DE 24 HORAS (Do momento mais recente até 24h atrás)
        const fimCiclo = arredondarMinutos(dataMaisRecente, 5);
        const inicioCiclo = new Date(fimCiclo.getTime() - (24 * 60 * 60 * 1000));

        // 3. GERAR SLOTS DE 5 EM 5 MINUTOS (Eixo X)
        const timelineMap = new Map();
        let ponteiroTempo = new Date(inicioCiclo);

        while (ponteiroTempo <= fimCiclo) {
            const labelHora = formatarHoraMinuto(ponteiroTempo);
            timelineMap.set(ponteiroTempo.getTime(), {
                horaFormatada: labelHora,
                temperatura: null,
                umidade: null
            });
            ponteiroTempo.setMinutes(ponteiroTempo.getMinutes() + 5);
        }

        // 4. PREENCHER OS SLOTS COM OS DADOS DAS 24H
        dadosDaSala.forEach(item => {
            const dataMedicao = parseDataJson(item.data);

            if (dataMedicao >= inicioCiclo && dataMedicao <= fimCiclo) {
                const dataArredondada = arredondarMinutos(dataMedicao, 5);
                const chaveMs = dataArredondada.getTime();

                if (timelineMap.has(chaveMs)) {
                    timelineMap.get(chaveMs).temperatura = item.temperatura;
                    timelineMap.get(chaveMs).umidade = item.umidade;
                }
            }
        });

        // 5. SEPARAR EM ARRAYS PARA O CHART.JS
        const slots = Array.from(timelineMap.values());
        const labels = slots.map(s => s.horaFormatada);
        const dadosTemperatura = slots.map(s => s.temperatura);
        const dadosUmidade = slots.map(s => s.umidade);

        // 6. RENDERIZAÇÃO
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
                            text: `Últimas 24h — ${sala.nome || 'Sala ' + salaId} (${inicioCiclo.toLocaleDateString('pt-BR')} ${formatarHoraMinuto(inicioCiclo)} até ${fimCiclo.toLocaleDateString('pt-BR')} ${formatarHoraMinuto(fimCiclo)})`
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
        console.error("Erro ao renderizar o gráfico:", error);
    }
}

/**
 * Função chamada pelos botões/dropdown da interface
 */
async function initGraficoTendencia(salaId, exibir) {
    // 1. Limpa o intervalo automático se o usuário trocar manual/auto
    if (intervalAuto) {
        clearInterval(intervalAuto);
        intervalAuto = null;
    }

    // Fecha o menu dropdown visualmente
    const dropOptions = document.querySelector('.dropdown-options');
    if (dropOptions) dropOptions.classList.remove('Select-active');

    // 2. MODO AUTOMÁTICO (-2)
    if (salaId === -2) {
        const labNome = `Laboratório ${salaAtualAuto}`;
        document.querySelector('#selected-value').innerText = `Auto (${labNome})`;

        await renderizarGrafico(salaAtualAuto);

        intervalAuto = setInterval(async () => {
            salaAtualAuto = (salaAtualAuto + 1) % 16;
            const proximoLab = `Laboratório ${salaAtualAuto}`;
            document.querySelector('#selected-value').innerText = `Auto (${proximoLab})`;

            await renderizarGrafico(salaAtualAuto);
        }, 15000);

        return;
    }

    // 3. MODO SELEÇÃO MANUAL
    document.querySelector('#selected-value').innerText = exibir;
    await renderizarGrafico(salaId);
}

// Inicialização automática ao carregar
initGraficoTendencia(-2, 'Auto');