const bancoDeDados = [
    {
        "id": 1,
        "sala": "Laboratorio 1",
        "andar": 1,
        "temperatura": 22,
        "umidade": 88,
        "sinal": -48,
        "altitude": 780,
        "luminosidade": 450,
        "pressao": 0.94,
    },
    {
        "id": 2,
        "sala": "Laboratorio 2",
        "andar": 1,
        "temperatura": 22,
        "umidade": 88,
        "sinal": -48,
        "altitude": 780,
        "luminosidade": 450,
        "pressao": 0.94,
    },
    {
        "id": 3,
        "sala": "Laboratorio 3",
        "andar": 1,
        "temperatura": 22,
        "umidade": 88,
        "sinal": -48,
        "altitude": 780,
        "luminosidade": 450,
        "pressao": 0.94,
    },
    {
        "id": 4,
        "sala": "Laboratorio 4",
        "andar": 1,
        "temperatura": 22,
        "umidade": 88,
        "sinal": -88,
        "altitude": 780,
        "luminosidade": 450,
        "pressao": 0.94,
    },
    {
        "id": 5,
        "sala": "Laboratorio 5",
        "andar": 1,
        "temperatura": 22,
        "umidade": 88,
        "sinal": -80,
        "altitude": 780,
        "luminosidade": 450,
        "pressao": 0.94,
    },
    {
        "id": 6,
        "sala": "Laboratorio 6",
        "andar": 1,
        "temperatura": 22,
        "umidade": 88,
        "sinal": -67,
        "altitude": 780,
        "luminosidade": 450,
        "pressao": 0.94,
    },
    {
        "id": 7,
        "sala": "Refeitório",
        "andar": 0,
        "temperatura": 18,
        "umidade": 70,
        "sinal": -70,
        "altitude": 778,
        "luminosidade": 480,
        "pressao": 0.93,
    },
    {
        "id": 8,
        "sala": "Pátio",
        "andar": 0,
        "temperatura": 16,
        "umidade": 89,
        "sinal": -88,
        "altitude": 776,
        "luminosidade": 60000,
        "pressao": 0.93,
    }
]

function loadCards(andarId) {
    const dados = bancoDeDados.filter(i => i.andar === andarId);
    const planilha = document.getElementById('Jojo')

    planilha.innerHTML = '';

    dados.forEach(item => {
        let [badgeColor, badgeBg, ] = verifyColor(item.sinal)

        planilha.innerHTML += `
            <div class="h-full room-block bg-slate-800/80 border ${badgeBg} border-slate-600 rounded-lg p-3 flex flex-col justify-between cursor-pointer hover:border-brand-accent" onclick="selecionarSala('lab${item.id}', '${item.sala}', ${item.sinal}, '${item.temperatura}', '${item.umidade}')">
                <span class="text-xs font-bold text-slate-300">${item.sala}</span>
                <div class="flex justify-between items-end">
                    <span class="text-[10px] ${badgeColor} font-mono">${item.sinal} dBm</span>
                    <span class="w-2 h-2 rounded-full ${badgeBg}"></span>
                </div>
                
                <div class="pin-wrapper" style="top: 0; right: -10px;">
                    <div class="pin-billboard cursor-pointer" onclick="selecionarSala('lab${item.id}', '${item.sala}', ${item.sinal}, '${item.temperatura}', '${item.umidade}')">
                        <div class="bg-slate-900 border ${badgeBg} ${badgeColor} text-xs px-2 py-1 rounded-md shadow-xl flex items-center gap-1.5 hover:scale-110 transition-transform">
                            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                            <span class="font-bold">IoT ${item.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    })
}
loadCards(1)

function verifyColor(dbm) {
    let status = 'Fraco'
    let badgeColor = 'text-rose-400';
    let badgeBg = 'bg-rose-500/20 border-rose-500/40'

    if (dbm >= -55) {
        status = 'Excelente'
        badgeColor = 'text-emerald-400';
        badgeBg = 'bg-emerald-500/20 border-emerald-500/40';
    } else if (dbm >= -72) {
        status = 'Atenção'
        badgeColor = 'text-amber-400';
        badgeBg = 'bg-amber-500/20 border-amber-500/40';
    }

    return [badgeColor, badgeBg, status];
}

function selecionarSala(id, nome, dbm, temp, umid) {
    document.getElementById('salaNome').innerText = nome;
    document.getElementById('salaDbm').innerText = `${dbm} dBm`;
    document.getElementById('salaTemp').innerText = temp;
    document.getElementById('salaUmid').innerText = umid;
    document.getElementById('salaConexao').innerHTML = '<span class="w-2 h-2 rounded-full bg-green-500 inline-block animate-ping"></span> Online (100ms)';

    let [badgeColor, badgeBg, status] = verifyColor(dbm)

    const badge = document.getElementById('salaBadge');
    badge.innerText = status;
    badge.className = `px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColor} text-slate-200 border ${badgeBg}`;
}

function simularRecarregamento() {
    const btn = event.target;
    btn.innerText = "Sincronizando...";
    setTimeout(() => {
        btn.innerText = "Sincronizar Dados";
    }, 800);
}