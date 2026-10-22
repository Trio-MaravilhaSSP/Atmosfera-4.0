function dbmParaPorcentagem(dbm) {
    const minDbm = -90
    const maxDbm = -30

    if (dbm <= minDbm) return 0
    if (dbm >= maxDbm) return 100

    return ((dbm - minDbm) / (maxDbm - minDbm)) * 100;
}

var manometroChart = null;

// 1. Plugin customizado para desenhar a Agulha (Ponteiro)
var gaugeNeedle = {
    id: 'gaugeNeedle',
    afterDatasetDraw(chart, args, options) {
        const { ctx, config, chartArea: { top, bottom, left, right, width, height } } = chart;

        // Pega o valor atual direto das opções do próprio gráfico
        const dbmAtual = config.options.valorDbm ?? -90;

        ctx.save();

        const cx = width / 2 + left;
        const cy = chart.getDatasetMeta(0).data[0].y;

        // Converte dBm e calcula o ângulo
        const percentual = dbmParaPorcentagem(dbmAtual);
        const percentualInvertido = 100 - percentual;
        const anguloRad = Math.PI + (percentualInvertido / 100) * Math.PI;

        const needleRadius = (height / 1.6);

        // Desenhar a Agulha
        ctx.translate(cx, cy);
        ctx.rotate(anguloRad);

        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(needleRadius, 0);
        ctx.lineTo(0, 6);
        ctx.fillStyle = '#94a3b8';
        ctx.fill();

        ctx.rotate(-anguloRad);
        ctx.translate(-cx, -cy);

        // Centro do ponteiro
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#94a3b8';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        ctx.restore();
    }
};

function initManometro() {
    const elementoCanvas = document.getElementById('meuManometro')

    if (!elementoCanvas) return

    const ctxCanvas = elementoCanvas.getContext('2d')

    if (manometroChart) manometroChart.destroy()

    manometroChart = new Chart(ctxCanvas, {
        type: 'doughnut',
        data: {
            datasets: [{
                // 3 fatias iguais
                data: [1, 1, 1],
                backgroundColor: [
                    '#28e66e', // Verde
                    '#ffe100', // Amarelo
                    '#ff0514', // Vermelho
                ],
                // borderWidth: 3,
                borderColor: 'transparent'
            }]
        },
        options: {
            valorDbm: -60,
            rotation: -90,
            circumference: 180,
            cutout: '65%',
            aspectRatio: 1.4,
            plugins: {
                tooltip: { enabled: false }
            }
        },
        plugins: [gaugeNeedle] // Injeta o plugin da agulha
    });
}

// Função para atualizar dinamicamente o valor do ponteiro
var cont = 0;
function atualizarValor() {
    let novoValor = -30
    if (cont == 0) {
        novoValor = -50
        cont++;
    } else if (cont == 1) {
        novoValor = -70
        cont++;
    } else if (cont == 2) {
        novoValor = -30
        cont = 3;
    } else if (cont == 3) {
        novoValor = -80
        cont = 0;
    }

    manometroChart.options.valorDbm = novoValor;
    document.getElementById('valorTexto').innerText = `${novoValor} dBm`;
    manometroChart.update();
}

document.addEventListener("DOMContentLoaded", () => {
    initManometro();
})