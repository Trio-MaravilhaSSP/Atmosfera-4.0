// =============================================================
// chartInicio.js — Módulo do Painel Principal / Início
// =============================================================

import { carregarDadosGerais } from './chartAll.js';

// Helper inteligente para extrair o ID do dispositivo de qualquer DTO da API
function obterIdDispositivo(item) {
    if (!item) return null;
    
    // Se o item já for um número ou string representando o ID
    if (typeof item === 'number' || typeof item === 'string') return item;

    // Se o item for um objeto retornado pelo Spring Boot
    if (typeof item.dispositivo === 'object' && item.dispositivo !== null) {
        return item.dispositivo.id;
    }

    return item.dispositivo ?? item.id_dispositivo ?? item.dispositivoId ?? item.idDispositivoFK ?? item.id_dispositivo_fk ?? item.id;
}

// Helper para obter o registro mais recente garantindo a ordenação por data
function obterUltimoRegistro(registros) {
    if (!registros || registros.length === 0) return null;
    return [...registros].sort((a, b) => {
        const dataA = a.data ? new Date(a.data).getTime() : 0;
        const dataB = b.data ? new Date(b.data).getTime() : 0;
        return dataA - dataB;
    }).pop();
}

export async function atualizarSecaoInicio() {
    console.log("🔍 [DIAGNOSTICO] Iniciando atualizarSecaoInicio()...");

    try {
        const dados = await carregarDadosGerais();
        console.log("📦 [DIAGNOSTICO] Retorno de carregarDadosGerais():", dados);

        if (!dados) {
            console.error("❌ [ERRO] carregarDadosGerais() retornou null/undefined!");
            return;
        }

        const { dispositivos, atuadores, temp, wifi } = dados;

        // Helpers de escrita amigáveis
        const setTexto = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        };

        const setHTML = (id, html) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = html;
        };

        // -------------------------------------------------------------
        // 1. MÉDIA CAMPUS: TEMPERATURA E UMIDADE
        // -------------------------------------------------------------
        if (temp && temp.length > 0 && dispositivos && dispositivos.length > 0) {
            let somaTemp = 0;
            let somaUmid = 0;
            let totalValidos = 0;

            dispositivos.forEach(disp => {
                // Mapeia verificando tanto disp.id quanto as FKs da temperatura
                const registrosDisp = temp.filter(t => obterIdDispositivo(t) == disp.id);
                const ultimo = obterUltimoRegistro(registrosDisp);

                if (ultimo) {
                    if (ultimo.temperatura != null) somaTemp += Number(ultimo.temperatura);
                    if (ultimo.umidade != null) somaUmid += Number(ultimo.umidade);
                    totalValidos++;
                }
            });

            if (totalValidos > 0) {
                const mediaTemp = (somaTemp / totalValidos).toFixed(1);
                const mediaUmid = Math.round(somaUmid / totalValidos);

                setTexto('renderizarTemp', `${mediaTemp} °C`);
                setTexto('renderizarUmidade', `${mediaUmid}%`);
            } else {
                setTexto('renderizarTemp', '-- °C');
                setTexto('renderizarUmidade', '--%');
            }
        } else {
            setTexto('renderizarTemp', '-- °C');
            setTexto('renderizarUmidade', '--%');
        }

        // -------------------------------------------------------------
        // 2. DISPOSITIVOS (TOTAL E ONLINE)
        // -------------------------------------------------------------
        const totalDispositivos = dispositivos ? dispositivos.length : 0;
        setTexto('renderizarDisp', `${totalDispositivos}/${totalDispositivos}`);
        setTexto('statusDisp', 'Todos Online');

        // -------------------------------------------------------------
        // 3. ATUADORES ATIVOS
        // -------------------------------------------------------------
        const totalAtuadores = atuadores ? atuadores.length : 0;
        const ativos = atuadores ? atuadores.filter(a => a.status === true) : [];

        setTexto('renderizarAtua', `${ativos.length}/${totalAtuadores}`);

        if (ativos.length > 0) {
            const primeiroAtivo = ativos[0];
            const fkAtuador = obterIdDispositivo(primeiroAtivo);
            const dispAssociado = dispositivos.find(d => d.id == fkAtuador);
            
            // Usa 'nomeDispositivo' vindo do seu DTO Java (ou 'nome' como fallback)
            const nomeDisp = dispAssociado 
                ? (dispAssociado.nomeDispositivo || dispAssociado.nome) 
                : `Disp ${fkAtuador}`;

            setTexto('exemploAtua', `${nomeDisp}: ATIVO`);
        } else {
            setTexto('exemploAtua', 'Nenhum atuador ativo');
        }

        // -------------------------------------------------------------
        // 4. ALERTAS CRÍTICOS (SINAL E TEMPERATURA)
        // -------------------------------------------------------------
        let pendentes = 0;
        let avisos = 0;

        if (dispositivos) {
            dispositivos.forEach(disp => {
                const regWifi = wifi ? wifi.filter(w => obterIdDispositivo(w) == disp.id) : [];
                const regTemp = temp ? temp.filter(t => obterIdDispositivo(t) == disp.id) : [];

                const ultWifi = obterUltimoRegistro(regWifi);
                const ultTemp = obterUltimoRegistro(regTemp);

                if (ultWifi && ultWifi.sinal < -85) pendentes++;
                else if (ultWifi && ultWifi.sinal < -75) avisos++;

                if (ultTemp && ultTemp.temperatura > 40) pendentes++;
            });
        }

        setHTML('renderizarAlert', `<b>${pendentes} Pendente${pendentes !== 1 ? 's' : ''}</b>`);
        setTexto('statusAvisos', `${avisos} Aviso${avisos !== 1 ? 's' : ''}`);

        console.log("✅ [DIAGNOSTICO] atualizarSecaoInicio() executado com sucesso!");

    } catch (erro) {
        console.error("💥 [EXCEÇÃO CRÍTICA] Erro inesperado em atualizarSecaoInicio():", erro);
    }
}

// Expõe globalmente
window.atualizarSecaoInicio = atualizarSecaoInicio;

// Executa ao carregar
atualizarSecaoInicio();  