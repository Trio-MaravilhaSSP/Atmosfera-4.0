async function loadCards(andarId) {
    try {
        // 1. Busca ambos os JSONs em paralelo
        const [salasResp, dadosResp] = await Promise.all([
            fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json/salas.json"),
            fetch("http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json/json.json")
        ]);

        const bancoDeSalas = await salasResp.json();
        const bancoDeDados = await dadosResp.json();

        // 2. Filtra apenas as salas que pertencem ao andar solicitado
        const salasDoAndar = bancoDeSalas.filter(s => s.andar === andarId);

        const planilha = document.getElementById('Jojo');
        planilha.innerHTML = '';

        // 3. Renderiza os cards cruzando a sala com os dados do sensor via ID
        salasDoAndar.forEach(sala => {
            // Busca a última medição correspondente à sala (compara ID numérico ou nome)
            const medicoes = bancoDeDados.filter(d =>
                d.sala === sala.id
            );

            // Pega o registro mais recente (último do array)
            const ultimaMedicao = medicoes.length > 0 ? medicoes[medicoes.length - 1] : null;

            // Define valores padrão caso não haja medição registrada
            const sinal = ultimaMedicao ? ultimaMedicao.sinal : null;
            const temp = ultimaMedicao ? ultimaMedicao.temperatura : '--';
            const umid = ultimaMedicao ? ultimaMedicao.umidade : '--';

            // Define as cores com base no sinal dBm
            let badgeColor = 'text-slate-400';
            let badgeBg = 'bg-slate-700/50';
            let badgeBr = 'border-slate-600';
            let sinalTexto = 'Sem Sinal';

            if (sinal !== null) {
                [badgeColor, badgeBg, badgeBr] = verifyColor(sinal);
                sinalTexto = `${sinal} dBm`;
            }

            // Cria o elemento HTML do Card
            const card = document.createElement('div');
            card.className = `planDiv h-full room-block bg-slate-800/80 border ${badgeBg} ${badgeBr} rounded-lg p-3 flex flex-col justify-between cursor-pointer hover:border-brand-accent transition-colors`;

            card.innerHTML = `
                <span class="text-xs font-bold text-slate-300">${sala.sala}</span>
                <div class="flex justify-between items-end">
                    <span class="text-[10px] font-mono dbmSpan ${badgeColor}">${sinalTexto}</span>
                    <span class="w-2 h-2 rounded-full dbmCircle ${badgeBg} ${badgeBr}"></span>
                </div>
                
                <div class="pin-wrapper" style="top: 0; right: -10px;">
                    <div class="pin-billboard cursor-pointer pinClicker">
                        <div class="bg-slate-900 border bg-white-800/20 border-white-800/20 text-white text-xs px-2 py-1 rounded-md shadow-xl flex items-center gap-1.5 hover:scale-110 transition-transform">
                            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                            <span class="font-bold">IoT ${sala.id}</span>
                        </div>
                    </div>
                </div>
            `;

            // Atribui o evento de clique direto ao Card criado
            card.addEventListener('click', () => {
                selecionarSala(sala.sala, sinal ?? 0, temp, umid);
            });

            planilha.appendChild(card);
        });

    } catch (erro) {
        console.error("Erro ao sincronizar os dados: ", erro);
        alert("Deu ruim mano!");
    }
}

// Funções auxiliares mantidas
function verifyColor(dbm) {
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

function selecionarSala(nome, dbm, temp, umid) {
    document.getElementById('salaNome').innerText = nome;
    document.getElementById('salaDbm').innerText = dbm ? `${dbm} dBm` : 'N/A';
    document.getElementById('salaTemp').innerText = temp;
    document.getElementById('salaUmid').innerText = umid;
    document.getElementById('salaConexao').innerHTML = '<span class="w-2 h-2 rounded-full bg-green-500 inline-block animate-ping"></span> Online (100ms)';

    let [badgeColor, badgeBg, badgeBr, status] = verifyColor(dbm);

    const badge = document.getElementById('salaBadge');
    badge.innerText = status;
    badge.className = `px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColor} text-slate-200 border ${badgeBg} ${badgeBr}`;
}

function simularRecarregamento(event) {
    const btn = event.target;
    btn.innerText = "Sincronizando...";

    // Atualiza os dados reais do andar 0
    loadCards(0).then(() => {
        setTimeout(() => {
            btn.innerText = "Sincronizar Dados";
        }, 800);
    });
}

// Inicialização
loadCards(0);