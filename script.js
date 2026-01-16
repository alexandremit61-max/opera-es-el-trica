let chamados = [];

// Carrega os dados salvos no navegador ao iniciar
window.onload = function() {
    const salvos = localStorage.getItem('saski_eletrica_db');
    if (salvos) {
        chamados = JSON.parse(salvos);
        renderizar();
    }
};

// Salva o estado atual no LocalStorage
function salvarDados() {
    localStorage.setItem('saski_eletrica_db', JSON.stringify(chamados));
    renderizar();
}

function adicionarChamado() {
    const input = document.getElementById('rawInput');
    const texto = input.value.trim();
    if (!texto) return;

    // 1. Busca os 6 números do ticket
    const matchId = texto.match(/\d{6}/);
    const ticketId = matchId ? matchId[0] : "000000";
    
    // 2. Busca o Título dentro do texto (Procura a linha que tem a estrela ✨)
    let localFinal = "";
    const linhas = texto.split('\n');
    
    // Procura a linha que contém "Título:"
    const linhaTitulo = linhas.find(l => l.includes('✨ *Título:*'));
    
    if (linhaTitulo) {
        // Pega tudo que vem depois de "Título:*"
        localFinal = linhaTitulo.split('Título:*')[1].trim();
        // Remove asteriscos que sobram no final se houver
        localFinal = localFinal.replace(/\*/g, '').trim();
    } else {
        // Fallback: se não achar o padrão, tenta pegar a primeira linha e limpar emojis
        localFinal = texto.split('\n')[0].replace(/[📝✨🏷️🏢📆👤🔗]/g, '').trim();
    }

    // 3. Garantia: se ainda estiver vazio, usa um padrão
    if (!localFinal || localFinal.length < 3) {
        localFinal = "Incidente em " + ticketId;
    }

    const novo = {
        id: ticketId,
        local: localFinal,
        url: `https://saski.brisanet.net.br/chamado/${ticketId}`,
        historico: []
    };

    chamados.unshift(novo);
    input.value = "";
    salvarDados();
}

function adicionarComentario(id) {
    const campo = document.getElementById(`input-${id}`);
    const msg = campo.value.trim();
    if (!msg) return;

    const index = chamados.findIndex(c => c.id == id);
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    chamados[index].historico.push({ hora: hora, texto: msg });

    campo.value = ""; 
    salvarDados();
}

function finalizarChamado(id) {
    if (confirm(`Confirmar finalização do chamado #${id}?`)) {
        chamados = chamados.filter(c => c.id !== id);
        salvarDados();
    }
}

function renderizar() {
    const container = document.getElementById('listaChamados');
    const countEl = document.getElementById('count');
    if (countEl) countEl.innerText = chamados.length;
    container.innerHTML = "";

    chamados.forEach(c => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        card.innerHTML = `
            <div class="ticket-header">
                <a href="${c.url}" target="_blank">🔗 TICKET #${c.id}</a>
                <small>ELÉTRICA</small>
            </div>
            
            <div class="local-box">📍 ${c.local}</div>

            <div class="historico-container">
                <div class="historico-list" id="hist-${c.id}">
                    ${c.historico.length === 0 ? '<p style="color:#aaa; text-align:center; font-size: 14px; margin-top: 10px;">Aguardando tratativas...</p>' : 
                      c.historico.map(h => `<div class="msg-item"><b>[${h.hora}]</b> ${h.texto}</div>`).join('')}
                </div>
            </div>

            <div class="acao-tratativa">
                <input type="text" id="input-${c.id}" placeholder="Escreva aqui..." onkeypress="if(event.key==='Enter') adicionarComentario('${c.id}')">
                <button class="btn-add" onclick="adicionarComentario('${c.id}')">ADD</button>
            </div>

            <button class="btn-finalize" onclick="finalizarChamado('${c.id}')">✓ CONCLUIR LOCAL</button>
        `;
        container.appendChild(card);
        const d = document.getElementById(`hist-${c.id}`);
        if(d) d.scrollTop = d.scrollHeight;
    });
}

function copiarRelatorioPlantao() {
    if (chamados.length === 0) return alert("Nada para relatar.");

    let relatorio = `*RELATÓRIO DE PASSAGEM DE PLANTÃO - ELÉTRICA*\n`;
    relatorio += `====================================\n\n`;

    chamados.forEach(c => {
        relatorio += `📍 *LOCAL:* ${c.local}\n`;
        relatorio += `🆔 *CHAMADO:* #${c.id}\n`;
        relatorio += `🔗 *LINK:* ${c.url}\n`;
        relatorio += `📝 *TRATATIVAS:* \n`;
        
        if (c.historico.length === 0) {
            relatorio += `   - Sem atualizações.\n`;
        } else {
            c.historico.forEach(h => {
                relatorio += `   - [${h.hora}] ${h.texto}\n`;
            });
        }
        relatorio += `\n------------------------------------\n\n`;
    });

    const textarea = document.createElement('textarea');
    textarea.value = relatorio;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    const toast = document.getElementById('toast');
    if (toast) {
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }
}
