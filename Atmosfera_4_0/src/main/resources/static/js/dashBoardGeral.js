// =============================================================
// VARIÁVEIS DE CONTROLE E CACHE GLOBAL
// =============================================================
var manometroChart = null;
var luminosidadeChart = null;
var graficoTendencia = null;
var graficoAltPress = null;
var ventoChart = null; // Instância global do gráfico de rosa dos ventos

var intervalAutoGeral = null;
var indiceDispositivoAuto = 0;
var modoManualAtivo = false;

var cacheDispositivos = null;
var cacheAtuadores = null;
var cacheWifi = null;
var cacheTemp = null;
var cacheAlti = null;

if (typeof Chart !== 'undefined') {
    if(localStorage.getItem("tema") == 'dark') Chart.defaults.color = '#ccc';
    else Chart.defaults.color = '#575757';

    Chart.defaults.font.family = 'Inter';
}

// =============================================================
// FUNÇÕES UTILITÁRIAS COMPARTILHADAS
// =============================================================

// Helper para converter graus em rumo cardeal (ex: 135° -> SE)
function formatarDirecaoVento(graus) {
    if (graus === null || graus === undefined || isNaN(graus)) return '--';
    const direcoes = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
    const idx = Math.round(((Number(graus) % 360) / 45)) % 8;
    return `${direcoes[idx]} (${graus}°)`;
}

// Helper para obter o ID do dispositivo de forma flexível do DTO
function obterIdDispositivo(item) {
    if (!item) return null;
    if (typeof item === 'number' || typeof item === 'string') return item;
    if (typeof item.dispositivo === 'object' && item.dispositivo !== null) {
        return item.dispositivo.id;
    }
    return item.dispositivo ?? item.dispositivoId ?? item.id_dispositivo ?? item.id_dispositivo_fk ?? item.id;
}

// Helper para obter o nome do dispositivo vindo do Spring Boot
function obterNomeDispositivo(disp) {
    if (!disp) return 'Dispositivo';
    return disp.nomeDispositivo || disp.nome || `Dispositivo ${disp.id}`;
}

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

function parseDataJson(dado) {
    if (!dado) return null;

    // Se passar o objeto inteiro, extrai a propriedade de data automaticamente
    if (typeof dado === 'object') {
        dado = dado.dataHora ?? dado.data ?? dado.timestamp ?? null;
        if (!dado) return null;
    }

    if (dado instanceof Date) return dado;

    let dataParsed = new Date(dado);
    if (!isNaN(dataParsed.getTime())) {
        return dataParsed;
    }

    const partes = String(dado).split(/[:\-\sT\/]/);
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

//Função para o teste local sem o backend
// Carrega os dados dos JSONs
// async function carregarTodosBancos() {
//     if (!cacheDispositivos || !cacheAtuadores || !cacheWifi || !cacheTemp || !cacheAlti) {
//         const baseUrl = "http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json/";
//         const [dispResp, atuaResp, wifiResp, tempResp, altiResp] = await Promise.all([
//             fetch(baseUrl + "dispositivo.json"),
//             fetch(baseUrl + "atuador.json"),
//             fetch(baseUrl + "wifi.json"),
//             fetch(baseUrl + "temp.json"),
//             fetch(baseUrl + "alti.json")
//         ]);

//         cacheDispositivos = await dispResp.json();
//         cacheAtuadores = await atuaResp.json();
//         cacheWifi = await wifiResp.json();
//         cacheTemp = await tempResp.json();
//         cacheAlti = await altiResp.json();
//     }
//     return {
//         bancoDispositivos: cacheDispositivos,
//         bancoAtuadores: cacheAtuadores,
//         bancoWifi: cacheWifi,
//         bancoTemp: cacheTemp,
//         bancoAlti: cacheAlti
//     };
// }

// Função para o teste com o backend
// Carrega os dados dos JSONs
async function carregarTodosBancos() {
    if (!cacheDispositivos || !cacheAtuadores || !cacheWifi || !cacheTemp || !cacheAlti) {
        const baseUrl = "http://10.83.139.51:8080/";
        const [dispResp, atuaResp, wifiResp, tempResp, altiResp] = await Promise.all([
            fetch(baseUrl + "dispositivo"),
            fetch(baseUrl + "atuador"),
            fetch(baseUrl + "dashboard/sinal"),
            fetch(baseUrl + "dashboard/temperatura"),
            fetch(baseUrl + "dashboard/altitude")
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

function popularDropdownSalas(dispositivos) {
    const dropOptions = document.querySelector('.dropdown-options');
    if (!dropOptions) return;

    let html = `<div class="option" onclick="initDashboardGeral('auto', 'Auto')">Auto</div>`;
    dispositivos.forEach(d => {
        const nome = obterNomeDispositivo(d);
        html += `<div class="option" onclick="initDashboardGeral('${d.id}', '${nome}')">${nome}</div>`;
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
    const ativos = bancoAtuadores ? bancoAtuadores.filter(a => a.status === true || a.status === 1) : [];

    const elAtuadoresVal = document.getElementById('kpiAtuadoresAtivos');
    const elAtuadorExemplo = document.getElementById('kpiAtuadorExemplo');

    if (elAtuadoresVal) elAtuadoresVal.innerText = `${ativos.length} / ${totalAtuadores}`;

    if (elAtuadorExemplo) {
        if (ativos.length > 0) {
            const primeiroAtivo = ativos[0];
            const fkDisp = obterIdDispositivo(primeiroAtivo);
            const dispAssociado = bancoDispositivos.find(d => d.id == fkDisp);
            const nomeDisp = dispAssociado ? obterNomeDispositivo(dispAssociado) : `Disp ${fkDisp}`;
            elAtuadorExemplo.innerText = `Ex: ${nomeDisp}: ATIVO`;
        } else {
            elAtuadorExemplo.innerText = "Nenhum atuador ativo";
        }
    }

    const elMediaCampus = document.getElementById('kpiMediaCampus');
    if (elMediaCampus && bancoTemp && bancoTemp.length > 0) {
        let somaTemp = 0, somaUmid = 0, totalRegistros = 0;

        bancoDispositivos.forEach(disp => {
            const dadosDisp = bancoTemp.filter(t => obterIdDispositivo(t) == disp.id);
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

    if (!elementoCanvas) {
        console.error("❌ [DOM ERRO] Canvas 'graficoSinal' não encontrado!");
        return;
    }
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
                x: {
                    grid: { display: false },
                    ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 }
                },
                y: { beginAtZero: true }
            }
        }
    });
}

function atualizarWifiELuminosidade(dadosDisp) {
    if (!dadosDisp || dadosDisp.length === 0) {
        renderizarManometro(-90);
        renderizarGraficoLuminosidade([]);
        return;
    }

    let dataMaisRecente = null;
    dadosDisp.forEach(item => {
        const d = parseDataJson(item);
        if (d && (!dataMaisRecente || d.getTime() > dataMaisRecente.getTime())) dataMaisRecente = d;
    });

    if (!dataMaisRecente) return;

    const fimCiclo = arredondarHoras(dataMaisRecente);
    const inicioCiclo = new Date(fimCiclo.getTime() - (23 * 60 * 60 * 1000));

    const timelineMap = new Map();
    for (let i = 0; i < 24; i++) {
        const slotData = new Date(inicioCiclo.getTime() + (i * 60 * 60 * 1000));
        timelineMap.set(slotData.getTime(), {
            horaFormatada: formatarHoraMinuto(slotData, false),
            somasLux: 0, qtdLux: 0,
            somasSinal: 0, qtdSinal: 0
        });
    }

    dadosDisp.forEach(item => {
        const d = parseDataJson(item);
        if (d) {
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
    if (!ctx) return;

    if (!dadosDisp || dadosDisp.length === 0) {
        if (graficoTendencia) graficoTendencia.destroy();
        return;
    }

    let dataMaisRecente = null;
    dadosDisp.forEach(item => {
        const d = parseDataJson(item);
        if (d && (!dataMaisRecente || d.getTime() > dataMaisRecente.getTime())) dataMaisRecente = d;
    });

    if (!dataMaisRecente) return;

    const fimCiclo = arredondarHoras(dataMaisRecente);
    const inicioCiclo = new Date(fimCiclo.getTime() - (23 * 60 * 60 * 1000));

    const timelineMap = new Map();
    for (let i = 0; i < 24; i++) {
        const slotData = new Date(inicioCiclo.getTime() + (i * 60 * 60 * 1000));
        timelineMap.set(slotData.getTime(), {
            horaFormatada: formatarHoraMinuto(slotData, false),
            somasTemp: 0, qtdTemp: 0,
            somasUmid: 0, qtdUmid: 0
        });
    }

    dadosDisp.forEach(item => {
        const d = parseDataJson(item);
        if (d) {
            const ms = arredondarHoras(d).getTime();
            if (timelineMap.has(ms)) {
                const slot = timelineMap.get(ms);
                if (item.temperatura != null) { slot.somasTemp += Number(item.temperatura); slot.qtdTemp++; }
                if (item.umidade != null) { slot.somasUmid += Number(item.umidade); slot.qtdUmid++; }
            }
        }
    });

    const slots = Array.from(timelineMap.values()).map(s => ({
        horaFormatada: s.horaFormatada,
        temperatura: s.qtdTemp > 0 ? Number((s.somasTemp / s.qtdTemp).toFixed(1)) : null,
        umidade: s.qtdUmid > 0 ? Math.round(s.somasUmid / s.qtdUmid) : null
    }));

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
                x: {
                    grid: { display: false },
                    ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 }
                },
                yTemp: { position: 'left', min: 0, max: 50 },
                yUmid: { position: 'right', min: 0, max: 100, grid: { drawOnChartArea: false } }
            }
        }
    });
}

function atualizarAltitudeEPressao(dadosDisp) {
    const ctx = document.getElementById('graficoAltitude');
    if (!ctx) return;

    if (!dadosDisp || dadosDisp.length === 0) {
        if (graficoAltPress) graficoAltPress.destroy();
        return;
    }

    let dataMaisRecente = null;
    dadosDisp.forEach(item => {
        const d = parseDataJson(item);
        if (d && (!dataMaisRecente || d.getTime() > dataMaisRecente.getTime())) dataMaisRecente = d;
    });

    if (!dataMaisRecente) return;

    const fimCiclo = arredondarHoras(dataMaisRecente);
    const inicioCiclo = new Date(fimCiclo.getTime() - (23 * 60 * 60 * 1000));

    const timelineMap = new Map();
    for (let i = 0; i < 24; i++) {
        const slotData = new Date(inicioCiclo.getTime() + (i * 60 * 60 * 1000));
        timelineMap.set(slotData.getTime(), {
            horaFormatada: formatarHoraMinuto(slotData, false),
            somasAltitude: 0, qtdAltitude: 0,
            somasPressao: 0, qtdPressao: 0
        });
    }

    dadosDisp.forEach(item => {
        const d = parseDataJson(item);
        if (d) {
            const ms = arredondarHoras(d).getTime();
            if (timelineMap.has(ms)) {
                const slot = timelineMap.get(ms);
                if (item.altitude != null) { slot.somasAltitude += Number(item.altitude); slot.qtdAltitude++; }
                if (item.pressao != null) { slot.somasPressao += Number(item.pressao); slot.qtdPressao++; }
            }
        }
    });

    const slots = Array.from(timelineMap.values()).map(s => ({
        horaFormatada: s.horaFormatada,
        altitude: s.qtdAltitude > 0 ? Number((s.somasAltitude / s.qtdAltitude).toFixed(1)) : null,
        pressao: s.qtdPressao > 0 ? Number((s.somasPressao / s.qtdPressao).toFixed(2)) : null
    }));

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
                x: {
                    grid: { display: false },
                    ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 }
                },
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
        // 1. Extrai todos os bancos de dados do cache unificado (incluindo o bancoVento)
        const { bancoDispositivos, bancoAtuadores, bancoWifi, bancoTemp, bancoAlti, bancoVento } = await carregarTodosBancos();

        popularDropdownSalas(bancoDispositivos);
        atualizarCardsKPI(bancoDispositivos, bancoAtuadores, bancoTemp);

        const dispositivo = typeof dispositivoId === 'object'
            ? dispositivoId
            : bancoDispositivos.find(d => d.id == dispositivoId);

        if (!dispositivo) {
            console.warn("⚠️ [AVISO] Dispositivo não encontrado para o ID:", dispositivoId);
            return;
        }

        const nomeExibicao = obterNomeDispositivo(dispositivo);

        const elSeletor = document.getElementById('selected-value');
        if (elSeletor) {
            elSeletor.innerHTML = modoAuto ? `Auto <br> (${nomeExibicao})` : nomeExibicao;
        }

        document.querySelectorAll('[data-seVa]').forEach(el => {
            el.innerHTML = modoAuto ? `Auto <br> (${nomeExibicao})` : nomeExibicao;
        });

        // 2. Filtragem flexível por FK e validação de data
        const dadosWifi = bancoWifi ? bancoWifi.filter(i => obterIdDispositivo(i) == dispositivo.id && parseDataJson(i) !== null) : [];
        const dadosTemp = bancoTemp ? bancoTemp.filter(i => obterIdDispositivo(i) == dispositivo.id && parseDataJson(i) !== null) : [];
        const dadosAlti = bancoAlti ? bancoAlti.filter(i => obterIdDispositivo(i) == dispositivo.id && parseDataJson(i) !== null) : [];
        const dadosVento = bancoVento ? bancoVento.filter(i => obterIdDispositivo(i) == dispositivo.id && parseDataJson(i) !== null) : [];

        // 3. Chamada dos renderizadores
        atualizarWifiELuminosidade(dadosWifi);
        atualizarTemperaturaEUmidade(dadosTemp);
        atualizarAltitudeEPressao(dadosAlti);
        atualizarVento(dadosVento); // Agora dadosVento está definido!

    } catch (e) {
        console.error("💥 Erro no Dashboard Geral:", e);
    }
}

async function initDashboardGeral(dispositivoId = 'auto') {
    const dropOptions = document.querySelector('.dropdown-options');
    if (dropOptions) dropOptions.classList.remove('Select-active');

    if (intervalAutoGeral) {
        clearInterval(intervalAutoGeral);
        intervalAutoGeral = null;
    }

    if (dispositivoId === 'auto' || dispositivoId === -2) {
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

    modoManualAtivo = true;
    await renderizarDashboardDispositivo(dispositivoId, false);
}

function atualizarVento(dadosVentoDisp) {
    const elVelo = document.getElementById('valorVeloVento');
    const elDire = document.getElementById('valorDireVento');
    const ctxVento = document.getElementById('graficoDirecaoVento');

    if (!dadosVentoDisp || dadosVentoDisp.length === 0) {
        if (elVelo) elVelo.innerText = '-- km/h';
        if (elDire) elDire.innerText = '--';
        if (ventoChart) ventoChart.destroy();
        return;
    }

    // Pega na medição mais recente do vento com data válida
    const ultimoRegistro = dadosVentoDisp[dadosVentoDisp.length - 1];

    const velocidade = ultimoRegistro.velocidade_vento ?? ultimoRegistro.velocidade ?? 0;
    const grausDirecao = ultimoRegistro.direcao_vento ?? ultimoRegistro.direcao ?? 0;

    if (elVelo) elVelo.innerText = `${velocidade} km/h`;
    if (elDire) elDire.innerText = formatarDirecaoVento(grausDirecao);

    if (!ctxVento) return;

    // Converte a direção em destaque na Rosa dos Ventos (8 direções)
    const direcoesLabels = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
    const idxAtivo = Math.round(((Number(grausDirecao) % 360) / 45)) % 8;

    // Destaca a direção atual com valor 100 e as outras com 10 no radar
    const valoresRadar = direcoesLabels.map((_, index) => index === idxAtivo ? 100 : 15);

    if (ventoChart) ventoChart.destroy();

    ventoChart = new Chart(ctxVento, {
        type: 'radar',
        data: {
            labels: direcoesLabels,
            datasets: [{
                label: 'Direção do Vento',
                data: valoresRadar,
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: '#2563eb',
                pointBackgroundColor: direcoesLabels.map((_, index) => index === idxAtivo ? '#da000d' : '#2563eb'),
                pointRadius: direcoesLabels.map((_, index) => index === idxAtivo ? 6 : 2),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: { display: false } // Oculta números para ficar limpo
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Expõe globalmente para botões/menus HTML
window.initDashboardGeral = initDashboardGeral;
window.toggleSelect = toggleSelect;

// Inicialização Automática ao carregar a página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initDashboardGeral('auto'));
} else {
    initDashboardGeral('auto');
}