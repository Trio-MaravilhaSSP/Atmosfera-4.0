// Variável global para guardar a instância do gráfico
var graficoTendencia = null;

// // Inicializa o gráfico zerado ao carregar a página
// async function initGraficoTendencia(salaId) {
//     try {
//         const [salasResp, dadosResp] = await Promise.all([
//             fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/bancoDeSalas.json"),
//             fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json.json")
//         ])

//         const bancoDeSalas = await salasResp.json()
//         const bancoDeDados = await dadosResp.json()

//         const sala = bancoDeSalas.filter(s => s.id == salaId)
//         const dados = bancoDeDados.filter(i => i.id == sala[0]["id"]) || []

//         console.log(sala)
//         console.log(dados)

//         const ctxTemp = document.getElementById('graficoTempUmi');
//         if (!ctxTemp) return;

//         if (graficoTendencia) {
//             graficoTendencia.destroy()
//         }

//         let listaTemp = [];
//         let listaUmid = [];

//         let tempoPadrao = "08:00:00"
//         if (tempoPadrao == dados[0]["data"]) {
//             dados.forEach((e) => {
//                 listaTemp.push(e["temperatura"])
//                 listaUmid.push(e["umidade"])

//                 console.log(listaUmid, listaTemp)
//             })
//         } else {
//             console.log("Não apareceu")
//         }

//         // console.log(listaTemp)
        
//         graficoTendencia = new Chart(ctxTemp, {
//             type: 'line',
//             data: {
//                 // labels: [salaLabels],
//                 datasets: [
//                     {
//                         label: 'Temperatura (°C)',
//                         data: [listaTemp],
//                         borderColor: '#ff828a', // Cor de destaque
//                         backgroundColor: 'rgba(255, 130, 138, 0.1)',
//                         yAxisID: 'yTemp',
//                         tension: 0.4,
//                         fill: true
//                     },
//                     {
//                         label: 'Umidade (%)',
//                         data: [listaUmid],
//                         borderColor: '#38bdf8', // Azul Tailwind
//                         backgroundColor: 'rgba(56, 189, 248, 0.1)',
//                         yAxisID: 'yUmid',
//                         tension: 0.4,
//                         fill: true
//                     }
//                 ]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: {
//                         labels: { color: '#cbd5e1' }
//                     }
//                 },
//                 scales: {
//                     x: {
//                         ticks: { color: '#94a3b8' },
//                         grid: { color: 'rgba(255, 255, 255, 0.05)' }
//                     },
//                     yTemp: {
//                         type: 'linear',
//                         position: 'left',
//                         title: { display: true, text: 'Temp (°C)', color: '#ff828a' },
//                         ticks: { color: '#ff828a' },
//                         grid: { color: 'rgba(255, 255, 255, 0.05)' }
//                     },
//                     yUmid: {
//                         type: 'linear',
//                         position: 'right',
//                         title: { display: true, text: 'Umidade (%)', color: '#38bdf8' },
//                         ticks: { color: '#38bdf8' },
//                         grid: { drawOnChartArea: false }
//                     }
//                 }
//             }
//         });
//     } catch (erro) {
//         console.error("Erro ao sincronizar os dados: ", erro)
//         alert("Deu ruim mano!")
//         return [];
//     }
// }

// // Função para atualizar o gráfico com as métricas da sala selecionada
// function atualizarGrafico(nomeSala, temp, umid) {
//     if (!graficoTendencia) return;

//     const label = document.getElementById('labelSalaGrafico');
//     if (label) label.innerText = nomeSala;

//     let t = parseFloat(temp);
//     let u = parseFloat(umid);

//     // Gera o histórico proporcional com base no dado atual
//     graficoTendencia.data.datasets[0].data = [t - 2, t - 1, t - 0.5, t + 1, t - 0.2, t];
//     graficoTendencia.data.datasets[1].data = [u + 4, u + 2, u - 1, u - 3, u + 1, u];

//     graficoTendencia.update();
// }








// o que a IA falou:


async function initGraficoTendencia(salaId, dataAlvo = null) {
    try {
        const [salasResp, dadosResp] = await Promise.all([
            fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/bancoDeSalas.json"),
            fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json.json")
        ]);
        
        const bancoDeSalas = await salasResp.json();
        const bancoDeDados = await dadosResp.json();
        
        const sala = bancoDeSalas.find(s => s.id == salaId);
        if (!sala) return console.error("Sala não encontrada");

        // 1. DEFINIR O DIA COMPLETO (00:00 até 23:59)
        // Se dataAlvo não for passada, usa a data atual do sistema (Ex: '2026-10-22')
        const hojeStr = dataAlvo || new Date().toISOString().split('T')[0]; 
        const inicioDia = `${hojeStr}T00:00:00`;
        const fimDia = `${hojeStr}T23:59:59`;

        console.log("1")

        // 2. FILTRAR OS DADOS: Apenas da sala correta E que pertençam ao dia alvo
        const dadosFiltrados = bancoDeDados.filter(item => {
            return item.sala == sala.id && item.data && item.data.startsWith(hojeStr);
        });

        console.log("2")

        // 3. FORMATAR OS DADOS PARA O CHART.JS (Eixo X de tempo exige objeto {x, y})
        let dadosTemperatura = [];
        let dadosUmidade = [];

        dadosFiltrados.forEach(e => {
            // Substitui o espaço por 'T' para garantir compatibilidade ISO padrão no JS
            const timestampIso = e.data.replace(" ", "T"); 
            
            dadosTemperatura.push({ x: timestampIso, y: e.temperatura });
            dadosUmidade.push({ x: timestampIso, y: e.umidade });
        });

        console.log("3")

        const ctxTemp = document.getElementById('graficoTempUmi');
        if (!ctxTemp) return;
        
        if (graficoTendencia) {
            graficoTendencia.destroy();
        } 

        console.log("4")

        // 4. CONFIGURAÇÃO DO GRÁFICO
        graficoTendencia = new Chart(ctxTemp, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Temperatura (°C)',
                        data: dadosTemperatura, // Sem os colchetes por volta!
                        borderColor: '#ff828a',
                        backgroundColor: 'rgba(255, 130, 138, 0.1)',
                        yAxisID: 'yTemp',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Umidade (%)',
                        data: dadosUmidade,
                        borderColor: '#42a5f5',
                        backgroundColor: 'rgba(66, 165, 245, 0.1)',
                        yAxisID: 'yUmid', // Adicionado caso queira eixo duplo depois
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time', // Ativa o modo de tempo
                        time: {
                            parser: 'yyyy-MM-dd HH:mm:ss', // Formato de entrada do seu JSON
                            unit: 'hour',                  // Força a divisão por horas
                            displayFormats: {
                                hour: 'HH:mm'              // Formato de exibição no eixo X
                            }
                        },
                        min: inicioDia, // Força o gráfico a começar às 00:00 daquele dia
                        max: fimDia,    // Força o gráfico a terminar às 23:59 daquele dia
                        title: {
                            display: true,
                            text: `Dados do dia ${hojeStr.split('-').reverse().join('/')}`
                        }
                    },
                    yTemp: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Temperatura (°C)' }
                    },
                    yUmid: {
                        type: 'linear',
                        position: 'right',
                        grid: { drawOnChartArea: false }, // Evita linhas duplicadas no fundo
                        title: { display: true, text: 'Umidade (%)' }
                    }
                }
            }
        });

    } catch (error) {
        console.error("Erro ao inicializar o gráfico:", error);
        alert("Deu ruim mano")
        return [];
    }
}

initGraficoTendencia(2)