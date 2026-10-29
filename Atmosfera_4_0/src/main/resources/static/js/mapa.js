// =============================================================
// mapaCards.js — Módulo do Mapa 2D/3D e Cards de Dispositivos
// =============================================================

import {
    carregarDadosGerais,
    parseDataJson
} from './chartAll.js';

// Helper para obter o ID do dispositivo de forma flexível a partir de qualquer DTO
function obterIdDispositivo(item) {
    if (!item) return null;
    if (typeof item === 'number' || typeof item === 'string') return item;
    if (typeof item.dispositivo === 'object' && item.dispositivo !== null) {
        return item.dispositivo.id;
    }
    return item.dispositivo ?? item.dispositivoId ?? item.id_dispositivo ?? item.idDispositivoFK ?? item.id;
}

// Helper para obter o nome do dispositivo vindo do Spring Boot (nomeDispositivo ou nome)
function obterNomeDispositivo(disp) {
    if (!disp) return 'Dispositivo';
    return disp.nomeDispositivo || disp.nome || `Dispositivo ${disp.id}`;
}

// Helper para converter graus do vento em direção (ex: 135° -> SE)
function formatarDirecaoVento(graus) {
    if (graus === null || graus === undefined || isNaN(graus)) return '--';
    const direcoes = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
    const idx = Math.round(((Number(graus) % 360) / 45)) % 8;
    return `${direcoes[idx]} (${graus}°)`;
}

export async function loadCards(andarId = "0") {
    try {
        // 1. Carrega os dados base do backend
        const dadosGerais = await carregarDadosGerais();
        if (!dadosGerais) {
            console.error("❌ [ERRO MAPA] Não foi possível carregar dados em carregarDadosGerais().");
            return;
        }

        const { dispositivos = [], wifi = [], temp = [], alti = [] } = dadosGerais;

        // 2. Busca os dados de vento com fallback seguro
        let vento = [];
        try {
            const respVento = await fetch("http://10.83.139.51:8080/dashboard/vento");
            if (respVento.ok) {
                vento = await respVento.json();
            }
        } catch (err) {
            console.warn("⚠️ Não foi possível carregar o endpoint do vento:", err);
        }

        // 3. Filtra os dispositivos do andar (usando == para ignorar diferenças de string/number)
        const dispositivosDoAndar = dispositivos.filter(d => d.localizacao == andarId);

        const planilha = document.getElementById('Jojo');
        if (!planilha) {
            console.error("❌ [DOM ERRO] Elemento do mapa com ID 'Jojo' não foi encontrado no HTML!");
            return;
        }
        planilha.innerHTML = '';

        // 4. Renderiza cada dispositivo nos cards do mapa
        dispositivosDoAndar.forEach(disp => {
            // Filtra medições verificando a FK e se possuem dataValida (dataHora ou data)
            const dadosWifi = wifi.filter(w => obterIdDispositivo(w) == disp.id && parseDataJson(w) !== null);
            const dadosTemp = temp.filter(t => obterIdDispositivo(t) == disp.id && parseDataJson(t) !== null);
            const dadosAlti = alti.filter(a => obterIdDispositivo(a) == disp.id && parseDataJson(a) !== null);
            const dadosVento = vento.filter(v => obterIdDispositivo(v) == disp.id && parseDataJson(v) !== null);

            // Pega os últimos registros de cada array
            const ultWifi = dadosWifi.length > 0 ? dadosWifi[dadosWifi.length - 1] : null;
            const ultTemp = dadosTemp.length > 0 ? dadosTemp[dadosTemp.length - 1] : null;
            const ultAlti = dadosAlti.length > 0 ? dadosAlti[dadosAlti.length - 1] : null;
            const ultVento = dadosVento.length > 0 ? dadosVento[dadosVento.length - 1] : null;

            // Extrai e formata os valores para exibição
            const sinal = ultWifi ? ultWifi.intensidadeWifi : null;
            const lux = (ultWifi && ultWifi.luminosidade !== undefined) ? `${ultWifi.luminosidade}` : '--';
            const temperatura = ultTemp ? `${ultTemp.temperatura} °C` : '--';
            const umidade = ultTemp ? `${ultTemp.umidade}%` : '--';
            const pressao = ultAlti ? `${ultAlti.pressao} hPa` : '--';
            const altitude = ultAlti ? `${ultAlti.altitude} m` : '--';

            // Propriedades do Vento
            const veloVento = (ultVento && ultVento.velocidade_vento !== undefined)
                ? `${ultVento.velocidade_vento} km/h`
                : '--';

            const direVento = (ultVento && ultVento.direcao_vento !== undefined)
                ? formatarDirecaoVento(ultVento.direcao_vento)
                : '--';

            // Obter o nome formatado do DTO Spring Boot
            const nomeExibicao = obterNomeDispositivo(disp);

            // Cores baseadas no nível de sinal (dBm)
            let badgeColor = 'text-slate-400';
            let badgeBg = 'bg-slate-700/50';
            let badgeBr = 'border-slate-600';
            let sinalTexto = 'Sem Sinal';

            if (sinal !== null) {
                [badgeColor, badgeBg, badgeBr] = verifyColor(sinal);
                sinalTexto = `${sinal} dBm`;
            }

            // Elemento Container do Card no Mapa
            const card = document.createElement('div');
            card.className = `planDiv h-full room-block bg-slate-800/80 border ${badgeBg} ${badgeBr} rounded-lg p-3 flex flex-col justify-between cursor-pointer hover:border-brand-accent transition-colors`;

            card.innerHTML = `
                <span class="text-xs font-bold text-slate-300">${nomeExibicao}</span>
                <div class="flex justify-between items-end">
                    <span class="text-[10px] font-mono dbmSpan ${badgeColor}">${sinalTexto}</span>
                    <span class="w-2 h-2 rounded-full dbmCircle ${badgeBg} ${badgeBr}"></span>
                </div>
                
                <div class="pin-wrapper" style="top: 0; right: -10px;">
                    <div class="pin-billboard cursor-pointer pinClicker">
                        <div class="bg-slate-900 border bg-white-800/20 border-white-800/20 text-white text-xs px-2 py-1 rounded-md shadow-xl flex items-center gap-1.5 hover:scale-110 transition-transform">
                            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                            <span class="font-bold">IoT ${disp.id}</span>
                        </div>
                    </div>
                </div>
            `;

            // Clique no Card envia TODAS as métricas ao painel lateral
            card.addEventListener('click', () => {
                selecionarSala(
                    nomeExibicao,
                    sinal,
                    temperatura,
                    umidade,
                    pressao,
                    altitude,
                    lux !== '--' ? `${lux} Lux` : '--',
                    veloVento,
                    direVento
                );
            });

            planilha.appendChild(card);
        });

    } catch (erro) {
        console.error("💥 [EXCEÇÃO CRÍTICA] Erro ao sincronizar os dados do mapa: ", erro);
    }
}

// =============================================================
// FUNÇÕES AUXILIARES DE CORES E SELEÇÃO
// =============================================================
export function verifyColor(dbm) {
    let status = 'Fraco';
    let badgeColor = 'text-rose-400';
    let badgeBg = 'bg-rose-500/20';
    let badgeBr = 'border-rose-500/40';

    if (dbm >= -55) {
        status = 'Excelente';
        badgeColor = 'text-emerald-400';
        badgeBg = 'bg-emerald-500/20';
        badgeBr = 'border-emerald-500/40';
    } else if (dbm >= -72) {
        status = 'Atenção';
        badgeColor = 'text-amber-400';
        badgeBg = 'bg-amber-500/20';
        badgeBr = 'border-amber-500/40';
    }

    return [badgeColor, badgeBg, badgeBr, status];
}

export function selecionarSala(nome, dbm, temp, umid, press, alti, lux, velo, dire) {
    const setTexto = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val !== undefined && val !== null ? val : '--';
    };

    setTexto('salaNome', nome);
    setTexto('salaDbm', dbm ? `${dbm} dBm` : 'N/A');
    setTexto('salaTemp', temp);
    setTexto('salaUmid', umid);
    setTexto('salaPress', press);
    setTexto('salaAlti', alti);
    setTexto('salaLux', lux);
    setTexto('salaVelo', velo);
    setTexto('salaDire', dire);

    const containerVento = document.querySelectorAll('#containerVento');
    if (containerVento && containerVento.length > 0) {
        const ePatio = nome.toLowerCase().includes('pátio') || nome.toLowerCase().includes('patio');
        const mapViewport = document.getElementById('viewport');
        const detailViewport = document.getElementById('viewportDetail');

        containerVento.forEach(i => {
            if (ePatio) {
                if (mapViewport) mapViewport.style.height = '688px';
                if (detailViewport) detailViewport.style.height = '688px';
                i.classList.remove('hidden');
            } else {
                if (mapViewport) mapViewport.style.height = '590px';
                if (detailViewport) detailViewport.style.height = '590px';
                i.classList.add('hidden');
            }
        });
    }

    const elConexao = document.getElementById('salaConexao');
    if (elConexao) {
        elConexao.innerHTML = '<span class="w-2 h-2 rounded-full bg-green-500 inline-block animate-ping"></span> Online (100ms)';
    }

    const [badgeColor, badgeBg, badgeBr, status] = verifyColor(dbm ?? -90);

    const badge = document.getElementById('salaBadge');
    if (badge) {
        badge.innerText = status;
        badge.className = `px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColor} text-slate-200 border ${badgeBg} ${badgeBr}`;
    }
}

export function simularRecarregamento(event) {
    const btn = event ? event.target : null;
    if (btn) btn.innerText = "Sincronizando...";

    loadCards("0").then(() => {
        if (btn) {
            setTimeout(() => {
                btn.innerText = "Sincronizar Dados";
            }, 800);
        }
    });
}

// Expõe globalmente para chamadas via atributos HTML (onclick)
window.loadCards = loadCards;
window.simularRecarregamento = simularRecarregamento;