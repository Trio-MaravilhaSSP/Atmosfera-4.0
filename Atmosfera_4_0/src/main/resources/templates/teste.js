const bancoDeDados = [
    {
        "id": 1,
        "sala": "Laboratorio 1",
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
        "temperatura": 22,
        "umidade": 88,
        "sinal": -67,
        "altitude": 780,
        "luminosidade": 450,
        "pressao": 0.94,
    },
    {
        "id": 7,
        "sala": "Laboratorio 7",
        "temperatura": 28,
        "umidade": 100,
        "sinal": -30,
        "altitude": 780,
        "luminosidade": 460,
        "pressao": 0.94,
    }
]

function loadCards() {
    const dados = bancoDeDados;
    const planilha = document.getElementById('Jojo')

    planilha.innerHTML = '';

    dados.forEach(item => {
        planilha.innerHTML += `
            <div class="room-block bg-slate-800/80 border border-slate-600 rounded-lg p-3 flex flex-col justify-between cursor-pointer hover:border-brand-accent" onclick="selecionarSala('lab${item.id}', 'Laboratório IoT', ${item.sinal}, '${item.temperatura}', '${item.umidade}')">
                <span class="text-xs font-bold text-slate-300">${item.sala}</span>
                <div class="flex justify-between items-end">
                    <span class="text-[10px] text-green-400 font-mono">${item.sinal} dBm</span>
                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                </div>
                
                <div class="pin-wrapper" style="top: 0; right: -10px;">
                    <div class="pin-billboard cursor-pointer" onclick="selecionarSala('lab${item.id}', 'Laboratório IoT', ${item.sinal}, '${item.temperatura}', '${item.umidade}')">
                        <div class="bg-slate-900 border border-green-500 text-green-400 text-xs px-2 py-1 rounded-md shadow-xl flex items-center gap-1.5 hover:scale-110 transition-transform">
                            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                            <span class="font-bold">IoT ${item.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    })
}
loadCards()

