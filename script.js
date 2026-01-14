let chamados = [];

function adicionarChamado() {
    const input = document.getElementById('rawInput');
    const texto = input.value.trim();
    if (!texto) return;

    // Regex atualizada para capturar exatamente 6 dígitos numéricos
    const matchId = texto.match(/\d{6}/);
    const ticketId = matchId ? matchId[0] : "000000";
    
    // Tenta extrair o local (texto entre hífens ou primeira linha)
    const partes = texto.split('-');
    let local = "Local não identificado";
    if (partes.length > 1) {
        local = partes[1].trim() + (partes[2] ? " - " + partes[2].trim() : "");
    } else {
        local = texto.split('\n')[0].substring(0, 50);
    }

    const novoChamado = {
        id: ticketId,
        local: local,
        url: `https://saski.brisanet.net.br/chamado/${ticketId}`,
        historico: []
    };

    chamados.push(novoChamado);
    input.value = "";
    renderizar();
}

// Adiciona uma nova linha de tratativa sem remover o chamado
function adicionarComentario(id) {
    const inputField = document.getElementById(`input-${id}`);
    const mensagem = inputField.value.trim();
    if (!mensagem) return;

    const index = chamados.findIndex(c => c.id == id);
    const agora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Adiciona ao array de histórico do chamado específico
    chamados[index].historico.push({
        hora: agora,
        texto: mensagem
    });

    inputField.value = ""; // Limpa apenas o campo de texto daquele card
    renderizar();
}

// Finaliza APENAS o chamado clicado
function finalizarChamado(id) {
    if (confirm(`Finalizar e remover o chamado #${id}?`)) {
        chamados = chamados.filter(c => c.id !== id);
        renderizar();
    }
}

function renderizar() {
    const lista = document.getElementById('listaChamados');
    document.getElementById('count').innerText = chamados.length;
    lista.innerHTML = "";

    chamados.forEach(c => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        card.innerHTML = `
            <div class="ticket-header">
                <a href="${c.url}" target="_blank">🔗 TICKET #${c.id}</a>
                <small style="color: #999">ID: ${c.id}</small>
            </div>
            
            <div class="local-box">📍 ${c.local}</div>

            <div class="historico-container">
                <div class="historico-list" id="hist-${c.id}">
                    ${c.historico.length === 0 ? 
                        '<p style="color:#aaa; text-align:center; margin:0">Nenhuma tratativa registrada ainda.</p>' : 
                        c.historico.map(h => `<div class="msg-item"><b>[${h.hora}]</b> ${h.texto}</div>`).join('')
                    }
                </div>
            </div>

            <div class="acao-tratativa">
                <input type="text" id="input-${c.id}" placeholder="Escreva a atualização...">
                <button class="btn-add" onclick="adicionarComentario('${c.id}')">ADICIONAR</button>
            </div>

            <button class="btn-finalize" onclick="finalizarChamado('${c.id}')">✓ FINALIZAR TRATATIVA</button>
        `;
        lista.appendChild(card);
        
        // Mantém o scroll do histórico sempre no final
        const d = document.getElementById(`hist-${c.id}`);
        d.scrollTop = d.scrollHeight;
    });
}

// Gera o relatório consolidado para WhatsApp
function copiarRelatorioPlantao() {
    if (chamados.length === 0) return alert("Não há chamados ativos.");

    let textoFinal = `*RELATÓRIO DE PASSAGEM DE PLANTÃO - ELÉTRICA*\n`;
    textoFinal += `====================================\n\n`;

    chamados.forEach(c => {
        textoFinal += `📍 *LOCAL:* ${c.local}\n`;
        textoFinal += `🆔 *CHAMADO:* #${c.id}\n`;
        textoFinal += `🔗 *LINK:* ${c.url}\n`;
        textoFinal += `📝 *TRATATIVAS:* \n`;
        
        if (c.historico.length === 0) {
            textoFinal += `   - Sem atualizações registradas.\n`;
        } else {
            c.historico.forEach(h => {
                textoFinal += `   - [${h.hora}] ${h.texto}\n`;
            });
        }
        textoFinal += `\n------------------------------------\n\n`;
    });

    textoFinal += `Operações de Redes`;

    // Função de copiar
    const tempInput = document.createElement('textarea');
    tempInput.value = textoFinal;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    // Toast
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

renderizar();
