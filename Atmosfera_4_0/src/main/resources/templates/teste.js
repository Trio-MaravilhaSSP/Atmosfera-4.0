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
    }
]

function loadCards() {
    const dados = bancoDeDados;
    const planilha = document.getElementById('Jojo')

    planilha.innerHTML = '';

    dados.forEach(item => {
        planilha.innerHTML += `
            <div class="room-block bg-slate-800/80 border border-slate-600 rounded-lg p-3 flex flex-col justify-between cursor-pointer hover:border-brand-accent" onclick="selecionarSala('lab1', 'Laboratório IoT', -48, '24.2ºC', '62%', 'Excelente', 'bg-green-500')">
                <span class="text-xs font-bold text-slate-300">${item.sala}</span>
                <div class="flex justify-between items-end">
                    <span class="text-[10px] text-green-400 font-mono">${item.sinal} dBm</span>
                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                </div>
            </div>
        `
    })
}

<div>
    <span class="">Lab IoT 01</span>
    <div class="">
        <span class="">-48 dBm</span>
        <span class=""></span>
    </div>
</div>