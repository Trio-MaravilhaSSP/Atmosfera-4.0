// =============================================================
// chartInicio.js — Módulo do Painel Principal / Início
// =============================================================

import { carregarDadosGerais } from './chartAll.js';

export async function atualizarSecaoInicio() {
    try {
        const { dispositivos, atuadores, wifi, temp } = await carregarDadosGerais();

        // Helper rápido para alterar texto do DOM
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
                const registrosDisp = temp.filter(t => t.dispositivo == disp.id && t.data);
                if (registrosDisp.length > 0) {
                    const ultimo = registrosDisp[registrosDisp.length - 1];
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
            const dispAssociado = dispositivos.find(d => d.id == primeiroAtivo.id_dispositivo_fk);
            const nomeDisp = dispAssociado ? dispAssociado.nome : `Disp ${primeiroAtivo.id_dispositivo_fk}`;
            setTexto('exemploAtua', `${nomeDisp}: ATIVO`);
        } else {
            setTexto('exemploAtua', 'Nenhum atuador ativo');
        }

        // -------------------------------------------------------------
        // 4. ALERTAS CRÍTICOS (EXEMPLO DE LEITURA BASEADA EM SINAL/TEMP)
        // -------------------------------------------------------------
        let pendentes = 0;
        let avisos = 0;

        // Regra de exemplo: checa sinais fracos e temperaturas muito elevadas
        dispositivos.forEach(disp => {
            const regWifi = wifi.filter(w => w.dispositivo == disp.id);
            const regTemp = temp.filter(t => t.dispositivo == disp.id);

            const ultWifi = regWifi.length > 0 ? regWifi[regWifi.length - 1] : null;
            const ultTemp = regTemp.length > 0 ? regTemp[regTemp.length - 1] : null;

            if (ultWifi && ultWifi.sinal < -85) pendentes++; // Sinal muito fraco
            else if (ultWifi && ultWifi.sinal < -75) avisos++;

            if (ultTemp && ultTemp.temperatura > 40) pendentes++; // Temperatura crítica
        });

        setHTML('renderizarAlert', `<b>${pendentes} Pendente${pendentes !== 1 ? 's' : ''}</b>`);
        setTexto('statusAvisos', `${avisos} Aviso${avisos !== 1 ? 's' : ''}`);

    } catch (erro) {
        console.error("Erro ao carregar dados do painel Início:", erro);
    }
}

// Expõe a função globalmente se necessário
window.atualizarSecaoInicio = atualizarSecaoInicio;

// Inicializa automaticamente no carregamento
atualizarSecaoInicio();