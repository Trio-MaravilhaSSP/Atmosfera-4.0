// =============================================================
// VARIÁVEIS DE CONTROLE E CACHE GLOBAL
// =============================================================
var manometroChart = null;
var luminosidadeChart = null;
var graficoTendencia = null;
var graficoAltPress = null;

var intervalAutoGeral = null;
var indiceDispositivoAuto = 0;
var modoManualAtivo = false;

var cacheDispositivos = null;
var cacheAtuadores = null;
var cacheWifi = null;
var cacheTemp = null;
var cacheAlti = null;

// =============================================================
// FUNÇÕES UTILITÁRIAS COMPARTILHADAS
// =============================================================
function arredondarHoras(date) {
    const ms = 1000 * 60 * 60;
    return new Date(Math.round(date.getTime() / ms) * ms);
}

function arredondarMinutos(date, minutos = 5) {
    const ms = 1000 * 60 * minutos;
    return new Date(Math.round(date.getTime() / ms) * ms);
}

function formatarHoraMinuto(date, incluirMinutos = false) {
    const horas = String(date.getHours()).padStart(2, '0');
    if (!incluirMinutos) return `${horas}:00`;
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${horas}:${mins}`;
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

// Carrega os dados dos JSONs
async function carregarTodosBancos() {
    if (!cacheDispositivos || !cacheAtuadores || !cacheWifi || !cacheTemp || !cacheAlti) {
        const baseUrl = "http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json/";
        const [dispResp, atuaResp, wifiResp, tempResp, altiResp] = await Promise.all([
            fetch(baseUrl + "dispositivo.json"),
            fetch(baseUrl + "atuador.json"),
            fetch(baseUrl + "wifi.json"),
            fetch(baseUrl + "temp.json"),
            fetch(baseUrl + "alti.json")
        ]);

        cacheDispositivos = await dispResp.json();
        cacheAtuadores = await atuaResp.json();
        cacheWifi = await wifiResp.json();
        cacheTemp = await tempResp.json();
        cacheAlti = await altiResp.json();
    }
    return {
        bancoDispositivos: cacheDispositivos,
        bancoAtuadores: cacheAtuadores,
        bancoWifi: cacheWifi,
        bancoTemp: cacheTemp,
        bancoAlti: cacheAlti
    };
}

// =============================================================
// CONTROLE DO DROPDOWN SELECT
// =============================================================
function toggleSelect() {
    const drop = document.querySelector('.dropdown-options');
    if (drop) drop.classList.toggle('Select-active');
}

// Popula o menu de opções dinamicamente com base em dispositivo.json
function popularDropdownSalas(dispositivos) {
    const dropOptions = document.querySelector('.dropdown-options');
    if (!dropOptions) return;

    let html = `<div class="option" onclick="initDashboardGeral('auto', 'Auto')">Auto</div>`;
    dispositivos.forEach(d => {
        html += `<div class="option" onclick="initDashboardGeral('${d.id}', '${d.nome}')">${d.nome}</div>`;
    });

    dropOptions.innerHTML = html;
}

// =============================================================
// CARDS SUPERIORES KPI
// =============================================================
function atualizarCardsKPI(bancoDispositivos, bancoAtuadores, bancoTemp) {
    const totalDisp = bancoDispositivos ? bancoDispositivos.length : 0;
    const elTotalDisp = document.getElementById('kpiTotalDispositivos');
    const elStatusDisp = document.getElementById('kpiDispositivosStatus');

    if (elTotalDisp) elTotalDisp.innerText = totalDisp;
    if (elStatusDisp) elStatusDisp.innerText = "Todos Online";

    const totalAtuadores = bancoAtuadores ? bancoAtuadores.length : 0;
    const ativos = bancoAtuadores ? bancoAtuadores.filter(a => a.status === true) : [];

    const elAtuadoresVal = document.getElementById('kpiAtuadoresAtivos');
    const elAtuadorExemplo = document.getElementById('kpiAtuadorExemplo');

    if (elAtuadoresVal) elAtuadoresVal.innerText = `${ativos.length} / ${totalAtuadores}`;

    if (elAtuadorExemplo) {
        if (ativos.length > 0) {
            const primeiroAtivo = ativos[0];
            const dispAssociado = bancoDispositivos.find(d => d.id == primeiroAtivo.id_dispositivo_fk);
            const nomeDisp = dispAssociado ? dispAssociado.nome : `Disp ${primeiroAtivo.id_dispositivo_fk}`;
            elAtuadorExemplo.innerText = `Ex: ${nomeDisp}: ATIVO`;
        } else {
            elAtuadorExemplo.innerText = "Nenhum atuador ativo";
        }
    }

    const elMediaCampus = document.getElementById('kpiMediaCampus');
    if (elMediaCampus && bancoTemp && bancoTemp.length > 0) {
        let somaTemp = 0, somaUmid = 0, totalRegistros = 0;

        bancoDispositivos.forEach(disp => {
            const dadosDisp = bancoTemp.filter(t => t.dispositivo == disp.id);
            if (dadosDisp.length > 0) {
                const ultimoReg = dadosDisp[dadosDisp.length - 1];
                if (ultimoReg.temperatura != null) somaTemp += Number(ultimoReg.temperatura);
                if (ultimoReg.umidade != null) somaUmid += Number(ultimoReg.umidade);
                totalRegistros++;
            }
        });

        if (totalRegistros > 0) {
            const mediaTemp = (somaTemp / totalRegistros).toFixed(1);
            const mediaUmid = Math.round(somaUmid / totalRegistros);
            elMediaCampus.innerText = `${mediaTemp} °C / ${mediaUmid}%`;
        } else {
            elMediaCampus.innerText = "-- °C / --%";
        }
    }
}

// =============================================================
// RENDERIZADORES DOS GRÁFICOS
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
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#94a3b8';
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
                label: 'Lux',
                data: valores,
                backgroundColor: 'rgba(255, 206, 86, 0.7)',
                borderRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
                y: { beginAtZero: true }
            }
        }
    });
}

function atualizarWifiELuminosidade(dadosDisp) {
    if (!dadosDisp || dadosDisp.length === 0) return;

    let dataMaisRecente = null;
    dadosDisp.forEach(item => {
        const d = parseDataJson(item.data);
        if (!dataMaisRecente || d > dataMaisRecente) dataMaisRecente = d;
    });

    const fimCiclo = arredondarHoras(dataMaisRecente);
    const inicioCiclo = new Date(fimCiclo.getTime() - (24 * 60 * 60 * 1000));

    const timelineMap = new Map();
    let pTempo = new Date(inicioCiclo);

    while (pTempo <= fimCiclo) {
        timelineMap.set(pTempo.getTime(), {
            horaFormatada: formatarHoraMinuto(pTempo, false),
            somasLux: 0, qtdLux: 0,
            somasSinal: 0, qtdSinal: 0
        });
        pTempo.setHours(pTempo.getHours() + 1);
    }

    dadosDisp.forEach(item => {
        const d = parseDataJson(item.data);
        if (d >= inicioCiclo && d <= fimCiclo) {
            const ms = arredondarHoras(d).getTime();
            if (timelineMap.has(ms)) {
                const slot = timelineMap.get(ms);
                if (item.luminosidade != null) { slot.somasLux += Number(item.luminosidade); slot.qtdLux++; }
                if (item.sinal != null) { slot.somasSinal += Number(item.sinal); slot.qtdSinal++; }
            }
        }
    });

    const slots = Array.from(timelineMap.values()).map(s => ({
        horaFormatada: s.horaFormatada,
        luminosidade: s.qtdLux > 0 ? Math.round(s.somasLux / s.qtdLux) : 0,
        sinal: s.qtdSinal > 0 ? Math.round(s.somasSinal / s.qtdSinal) : null
    }));

    const slotsComSinal = slots.filter(s => s.sinal !== null);
    const ultimo = slotsComSinal.length > 0 ? slotsComSinal[slotsComSinal.length - 1] : null;

    renderizarManometro(ultimo ? ultimo.sinal : -90);
    const elLumi = document.querySelector('#valorLuminosidade');
    if (elLumi) elLumi.innerText = `${ultimo ? ultimo.luminosidade : 0} Lux`;

    renderizarGraficoLuminosidade(slots);
}

function atualizarTemperaturaEUmidade(dadosDisp) {
    const ctx = document.getElementById('graficoTempUmi');
    if (!ctx || !dadosDisp || dadosDisp.length === 0) return;

    let dataMaisRecente = null;
    dadosDisp.forEach(item => {
        const d = parseDataJson(item.data);
        if (!dataMaisRecente || d > dataMaisRecente) dataMaisRecente = d;
    });

    const fimCiclo = arredondarMinutos(dataMaisRecente, 5);
    const inicioCiclo = new Date(fimCiclo.getTime() - (24 * 60 * 60 * 1000));

    const timelineMap = new Map();
    let pTempo = new Date(inicioCiclo);

    while (pTempo <= fimCiclo) {
        timelineMap.set(pTempo.getTime(), { horaFormatada: formatarHoraMinuto(pTempo, true) });
        pTempo.setMinutes(pTempo.getMinutes() + 5);
    }

    dadosDisp.forEach(item => {
        const d = parseDataJson(item.data);
        if (d >= inicioCiclo && d <= fimCiclo) {
            const ms = arredondarMinutos(d, 5).getTime();
            if (timelineMap.has(ms)) {
                timelineMap.get(ms).temperatura = item.temperatura;
                timelineMap.get(ms).umidade = item.umidade;
            }
        }
    });

    const slots = Array.from(timelineMap.values());
    const labels = slots.map(s => s.horaFormatada);

    if (graficoTendencia) graficoTendencia.destroy();

    graficoTendencia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Temp (°C)', data: slots.map(s => s.temperatura), borderColor: '#ff828a', backgroundColor: 'rgba(255, 130, 138, 0.15)', fill: true, yAxisID: 'yTemp', tension: 0.3, spanGaps: true },
                { label: 'Umidade (%)', data: slots.map(s => s.umidade), borderColor: '#42a5f5', backgroundColor: 'rgba(66, 165, 245, 0.15)', fill: true, yAxisID: 'yUmid', tension: 0.3, spanGaps: true }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: { display: false }, ticks: { callback: (val, idx) => idx % 12 === 0 ? labels[val] : '' } },
                yTemp: { position: 'left', min: 0, max: 50 },
                yUmid: { position: 'right', min: 0, max: 100, grid: { drawOnChartArea: false } }
            }
        }
    });
}

function atualizarAltitudeEPressao(dadosDisp) {
    const ctx = document.getElementById('graficoAltitude');
    if (!ctx || !dadosDisp || dadosDisp.length === 0) return;

    let dataMaisRecente = null;
    dadosDisp.forEach(item => {
        const d = parseDataJson(item.data);
        if (!dataMaisRecente || d > dataMaisRecente) dataMaisRecente = d;
    });

    const fimCiclo = arredondarHoras(dataMaisRecente);
    const inicioCiclo = new Date(fimCiclo.getTime() - (24 * 60 * 60 * 1000));

    const timelineMap = new Map();
    let pTempo = new Date(inicioCiclo);

    while (pTempo <= fimCiclo) {
        timelineMap.set(pTempo.getTime(), { horaFormatada: formatarHoraMinuto(pTempo, false) });
        pTempo.setHours(pTempo.getHours() + 1);
    }

    dadosDisp.forEach(item => {
        const d = parseDataJson(item.data);
        if (d >= inicioCiclo && d <= fimCiclo) {
            const ms = arredondarHoras(d).getTime();
            if (timelineMap.has(ms)) {
                timelineMap.get(ms).altitude = item.altitude;
                timelineMap.get(ms).pressao = item.pressao;
            }
        }
    });

    const slots = Array.from(timelineMap.values());
    const labels = slots.map(s => s.horaFormatada);

    if (graficoAltPress) graficoAltPress.destroy();

    graficoAltPress = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Altitude (m)', data: slots.map(s => s.altitude), backgroundColor: 'rgba(75, 192, 192, 0.7)', yAxisID: 'yAlt' },
                { label: 'Pressão (hPa)', data: slots.map(s => s.pressao), backgroundColor: 'rgba(153, 102, 255, 0.7)', yAxisID: 'yPress' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: { display: false } },
                yAlt: { position: 'left', min: 700, max: 800 },
                yPress: { position: 'right', min: 0.88, max: 0.98, grid: { drawOnChartArea: false } }
            }
        }
    });
}

// =============================================================
// CONTROLADOR PRINCIPAL DO DASHBOARD
// =============================================================
async function renderizarDashboardDispositivo(dispositivoId, modoAuto = false) {
    try {
        const { bancoDispositivos, bancoAtuadores, bancoWifi, bancoTemp, bancoAlti } = await carregarTodosBancos();

        // Garante que o menu suspenso carregue todas as salas direto do dispositivo.json
        popularDropdownSalas(bancoDispositivos);

        // Atualiza os três cards KPI do topo
        atualizarCardsKPI(bancoDispositivos, bancoAtuadores, bancoTemp);

        const dispositivo = typeof dispositivoId === 'object'
            ? dispositivoId
            : bancoDispositivos.find(d => d.id == dispositivoId);

        if (!dispositivo) return;

        // Atualiza o texto do selector principal
        const elSeletor = document.getElementById('selected-value');
        if (elSeletor) {
            elSeletor.innerHTML = modoAuto ? `Auto <br> (${dispositivo.nome})` : dispositivo.nome;
        }

        // Atualiza títulos secundários caso existam
        document.querySelectorAll('[data-seVa]').forEach(el => {
            el.innerHTML = modoAuto ? `Auto <br> (${dispositivo.nome})` : dispositivo.nome;
        });

        // Filtragem por dispositivo.id (FK)
        const dadosWifi = bancoWifi.filter(i => i.dispositivo == dispositivo.id && i.data);
        const dadosTemp = bancoTemp.filter(i => i.dispositivo == dispositivo.id && i.data);
        const dadosAlti = bancoAlti.filter(i => i.dispositivo == dispositivo.id && i.data);

        // Renderiza gráficos
        atualizarWifiELuminosidade(dadosWifi);
        atualizarTemperaturaEUmidade(dadosTemp);
        atualizarAltitudeEPressao(dadosAlti);

    } catch (e) {
        console.error("Erro no Dashboard Geral:", e);
    }
}

// Inicializador invocado pelo evento onclick das opções
async function initDashboardGeral(dispositivoId) {
    const dropOptions = document.querySelector('.dropdown-options');
    if (dropOptions) dropOptions.classList.remove('Select-active');

    // Cancela o intervalo automático atual se existir
    if (intervalAutoGeral) {
        clearInterval(intervalAutoGeral);
        intervalAutoGeral = null;
    }

    // MODO AUTOMÁTICO
    if (dispositivoId === 'auto') {
        modoManualAtivo = false;
        const { bancoDispositivos } = await carregarTodosBancos();
        if (!bancoDispositivos || bancoDispositivos.length === 0) return;

        const rodarCicloAuto = async () => {
            const dispAtual = bancoDispositivos[indiceDispositivoAuto];
            await renderizarDashboardDispositivo(dispAtual, true);
            indiceDispositivoAuto = (indiceDispositivoAuto + 1) % bancoDispositivos.length;
        };

        await rodarCicloAuto();
        intervalAutoGeral = setInterval(rodarCicloAuto, 15000);
        return;
    }

    // MODO SELEÇÃO MANUAL DE DISPOSITIVO/LABORATÓRIO
    modoManualAtivo = true;
    await renderizarDashboardDispositivo(dispositivoId, false);
}

function toggleSelect() {
    document.querySelector('.dropdown-options').classList.toggle('Select-active');
}

// Inicialização Automática ao carregar a página
initDashboardGeral('auto');