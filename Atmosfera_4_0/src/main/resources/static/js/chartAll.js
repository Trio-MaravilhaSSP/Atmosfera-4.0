// chartAll.js

let cache = {
    dispositivos: null,
    atuadores: null,
    wifi: null,
    temp: null,
    alti: null
};

export async function carregarDadosGerais() {
    console.log("🔄 Executando carregarDadosGerais...");

    try {
        const baseUrl = "http://10.83.138.31:8080";

        const [disp, atua, wifi, temp, alti] = await Promise.all([
            fetch(`${baseUrl}/dispositivo`).then(r => {
                if (!r.ok) throw new Error(`Erro /dispositivo: ${r.status}`);
                return r.json();
            }),
            fetch(`${baseUrl}/atuador`).then(r => {
                if (!r.ok) throw new Error(`Erro /atuador: ${r.status}`);
                return r.json();
            }),
            fetch(`${baseUrl}/dashboard/sinal`).then(r => {
                if (!r.ok) throw new Error(`Erro /dashboard/sinal: ${r.status}`);
                return r.json();
            }),
            fetch(`${baseUrl}/dashboard/temperatura`).then(r => {
                if (!r.ok) throw new Error(`Erro /dashboard/temperatura: ${r.status}`);
                return r.json();
            }),
            fetch(`${baseUrl}/dashboard/altitude`).then(r => {
                if (!r.ok) throw new Error(`Erro /dashboard/altitude: ${r.status}`);
                return r.json();
            })
        ]);

        console.log("✅ Dados da API recebidos com sucesso:", { disp, atua, wifi, temp, alti });
        cache = { dispositivos: disp, atuadores: atua, wifi, temp, alti };
        return cache;

    } catch (e) {
        console.error("❌ Falha na requisição principal:", e);

        if (!cache.dispositivos) {
            console.warn("⚠️ Buscando dados nos arquivos JSON locais...");
            const baseUrlLocal = "http://127.0.0.1:5500/Atmosfera_4_0/src/main/resources/static/js/json/";

            try {
                const [disp, atua, wifi, temp, alti] = await Promise.all([
                    fetch(baseUrlLocal + "dispositivo.json").then(r => r.json()),
                    fetch(baseUrlLocal + "atuador.json").then(r => r.json()),
                    fetch(baseUrlLocal + "wifi.json").then(r => r.json()),
                    fetch(baseUrlLocal + "temp.json").then(r => r.json()),
                    fetch(baseUrlLocal + "alti.json").then(r => r.json())
                ]);
                cache = { dispositivos: disp, atuadores: atua, wifi, temp, alti };
            } catch (errLocal) {
                console.error("❌ Erro ao carregar ficheiros locais:", errLocal);
                cache = { dispositivos: [], atuadores: [], wifi: [], temp: [], alti: [] };
            }
        }
        return cache;
    }
}

// Extrai o ID do dispositivo com suporte a objeto ou valor primitivo
export function obterIdDispositivo(item) {
    if (!item) return null;
    if (typeof item === 'number' || typeof item === 'string') return item;
    if (typeof item.dispositivo === 'object' && item.dispositivo !== null) {
        return item.dispositivo.id;
    }
    return item.dispositivo ?? item.dispositivoId ?? item.id_dispositivo ?? item.id;
}

// Extrai o nome do dispositivo respeitando a resposta do Java (nomeDispositivo)
export function obterNomeDispositivo(disp) {
    if (!disp) return 'Dispositivo';
    return disp.nomeDispositivo || disp.nome || `Dispositivo ${disp.id}`;
}

// Extrai o nível do sinal com fallback seguro (intensidadeWifi ou sinal)
export function obterSinalWifi(item) {
    if (!item) return -90;
    return item.intensidadeWifi ?? item.sinal ?? -90;
}

// Realiza o parse flexível da data (suporta dataHora ou data)
export function parseDataJson(dado) {
    if (!dado) return null;

    if (typeof dado === 'object' && !(dado instanceof Date)) {
        dado = dado.dataHora ?? dado.data ?? dado.timestamp ?? null;
        if (!dado) return null;
    }

    if (dado instanceof Date) return dado;

    const dataParsed = new Date(dado);
    if (!isNaN(dataParsed.getTime())) return dataParsed;

    const partes = String(dado).split(/[:\-\sT\/]/);
    if (partes.length >= 3) {
        return new Date(
            partes[0],
            (partes[1] || 1) - 1,
            partes[2] || 1,
            partes[3] || 0,
            partes[4] || 0,
            partes[5] || 0
        );
    }
    return null;
}

export function arredondarHoras(date) {
    const ms = 1000 * 60 * 60;
    return new Date(Math.round(date.getTime() / ms) * ms);
}

export function formatarDataHoraCompleta(date) {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const horas = String(date.getHours()).padStart(2, '0');
    return `${dia}/${mes} ${horas}:00`;
}

export function formatarHoraMinuto(date, incluirMinutos = false) {
    const horas = String(date.getHours()).padStart(2, '0');
    if (!incluirMinutos) return `${horas}:00`;
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${horas}:${mins}`;
}

export function dbmParaPorcentagem(dbm) {
    const minDbm = -90, maxDbm = -30;
    if (dbm <= minDbm) return 0;
    if (dbm >= maxDbm) return 100;
    return ((dbm - minDbm) / (maxDbm - minDbm)) * 100;
}

export function popularDropdownDispositivos(listaDispositivos, nomeFuncaoCallback, seletorContainer) {
    const dropOptions = document.querySelector(seletorContainer);
    if (!dropOptions || !listaDispositivos) return;

    let htmlOptions = `
        <div class="option" onclick="${nomeFuncaoCallback}('auto', 'Auto')">
            Auto
        </div>
    `;

    listaDispositivos.forEach(dispositivo => {
        const nomeFormatado = obterNomeDispositivo(dispositivo);

        htmlOptions += `
            <div class="option" onclick="${nomeFuncaoCallback}('${dispositivo.id}', '${nomeFormatado}')">
                ${nomeFormatado}
            </div>
        `;
    });

    dropOptions.innerHTML = htmlOptions;
}