// Variável global para guardar a instância do gráfico
var graficoTendencia = null;

// Inicializa o gráfico zerado ao carregar a página
async function initGraficoTendencia(andarId) {
    try {
        const [salasResp, dadosResp] = await Promise.all([
            fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/bancoDeSalas.json"),
            fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json.json")
        ])

        const ctxTemp = document.getElementById('graficoTempUmi');
        if (!ctxTemp) return;

        if (graficoTendencia) {
            graficoTendencia.destroy()
        }

        // const salaLabels = dados.map(item => item.sala)
        const listaTemp = dadosResp.map(item => item.temperatura)
        const listaUmid = dadosResp.map(item => item.umidade)

        graficoTendencia = new Chart(ctxTemp, {
            type: 'line',
            data: {
                // labels: [salaLabels],
                datasets: [
                    {
                        label: 'Temperatura (°C)',
                        data: [listaTemp],
                        borderColor: '#ff828a', // Cor de destaque
                        backgroundColor: 'rgba(255, 130, 138, 0.1)',
                        yAxisID: 'yTemp',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Umidade (%)',
                        data: [listaUmid],
                        borderColor: '#38bdf8', // Azul Tailwind
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        yAxisID: 'yUmid',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#cbd5e1' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    yTemp: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Temp (°C)', color: '#ff828a' },
                        ticks: { color: '#ff828a' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    yUmid: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Umidade (%)', color: '#38bdf8' },
                        ticks: { color: '#38bdf8' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    } catch (erro) {
        console.error("Erro ao sincronizar os dados: ", erro)
        alert("Deu ruim mano!")
        return [];
    }
}

// Função para atualizar o gráfico com as métricas da sala selecionada
function atualizarGrafico(nomeSala, temp, umid) {
    if (!graficoTendencia) return;

    const label = document.getElementById('labelSalaGrafico');
    if (label) label.innerText = nomeSala;

    let t = parseFloat(temp);
    let u = parseFloat(umid);

    // Gera o histórico proporcional com base no dado atual
    graficoTendencia.data.datasets[0].data = [t - 2, t - 1, t - 0.5, t + 1, t - 0.2, t];
    graficoTendencia.data.datasets[1].data = [u + 4, u + 2, u - 1, u - 3, u + 1, u];

    graficoTendencia.update();
}

initGraficoTendencia();
