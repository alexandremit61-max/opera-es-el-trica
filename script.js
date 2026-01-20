// CONFIGURAÇÃO DO SEU BANCO DE DADOS NA NUVEM
const API_URL = "https://696cb398f4a79b31517f95f0.mockapi.io/chamados";

let chamados = [];

// 1. INICIALIZAÇÃO
window.onload = function() {
    renderizarLoading();
    atualizarDadosServidor();
    
    // Sincronização automática a cada 30 segundos
    setInterval(() => {
        // Verifica se o usuário está com o foco em algum campo de texto para não atrapalhar a digitação
        const campoAtivo = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';
        const alguemEditando = chamados.some(c => c.historico.some(h => h.editando));
        
        if (!alguemEditando && !campoAtivo) {
            atualizarDadosServidor();
        }
    }, 30000); 
};

async function atualizarDadosServidor() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error();
        chamados = await res.json();
        renderizar();
    } catch (err) {
        console.error("Erro ao sincronizar.");
    }
}

// 2. ADICIONAR NOVO CHAMADO
async function adicionarChamado() {
    const input = document.getElementById('rawInput');
    const texto = input.value.trim();
    if (!texto) return;

    const matchId = texto.match(/\d{6}/);
    const ticketId = matchId ? matchId[0] : "000000";
    
    let localFinal = "";
    const linhas = texto.split('\n');
    const linhaTitulo = linhas.find(l => l.includes('✨ *Título:*'));
    
    if (linhaTitulo) {
        localFinal = linhaTitulo.split('Título:*')[1].trim().replace(/\*/g, '').trim();
    } else {
        localFinal = texto.split('\n')[0].replace(/[📝✨🏷️🏢📆👤🔗]/g, '').trim();
    }

    if (!localFinal || localFinal.length < 3) localFinal = "Incidente em " + ticketId;

    const novo = {
        ticketId: ticketId,
        local: localFinal,
        url: `https://saski.brisanet.net.br/chamado/${ticketId}`,
        historico: []
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: {'content-type':'application/json'},
            body: JSON.stringify(novo)
        });
        input.value = "";
        atualizarDadosServidor();
    } catch (err) {
        alert("Erro ao salvar!");
    }
}

// 3. GESTÃO DE TRATATIVAS
async function enviarAtualizacaoAoServidor(chamado) {
    try {
        await fetch(`${API_URL}/${chamado.id}`, {
            method: 'PUT',
            headers: {'content-type':'application/json'},
            body: JSON.stringify(chamado)
        });
        atualizarDadosServidor();
    } catch (err) {
        console.error("Erro ao atualizar servidor.");
    }
}

function adicionarComentario(idInterno) {
    const campo = document.getElementById(`input-${idInterno}`);
    const msg = campo.value.trim();
    if (!msg) return;

    const chamado = chamados.find(c => c.id == idInterno);
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    chamado.historico.push({ 
        id: Date.now(), 
        hora: hora, 
        texto: msg,
        editando: false 
    });

    campo.value = ""; 
    enviarAtualizacaoAoServidor(chamado);
}

function alternarEdicao(idInterno, comentarioId) {
    const chamado = chamados.find(c => c.id == idInterno);
    const hIdx = chamado.historico.findIndex(h => h.id == comentarioId);
    chamado.historico[hIdx].editando = !chamado.historico[hIdx].editando;
    renderizar();
}

function salvarEdicao(idInterno, comentarioId) {
    const chamado = chamados.find(c => c.id == idInterno);
    const hIdx = chamado.historico.findIndex(h => h.id == comentarioId);
    const novoTexto = document.getElementById(`edit-input-${comentarioId}`).value.trim();
    
    if (novoTexto) {
        chamado.historico[hIdx].texto = novoTexto;
        chamado.historico[hIdx].editando = false;
        enviarAtualizacaoAoServidor(chamado);
    }
}

function removerComentario(idInterno, comentarioId) {
    if (confirm("Você tem certeza?")) {
        const chamado = chamados.find(c => c.id == idInterno);
        chamado.historico = chamado.historico.filter(h => h.id != comentarioId);
        enviarAtualizacaoAoServidor(chamado);
    }
}

async function finalizarChamado(idInterno) {
    if (confirm(`Deseja concluir o local?`)) {
        await fetch(`${API_URL}/${idInterno}`, { method: 'DELETE' });
        atualizarDadosServidor();
    }
}

/**
 * 4. INTERFACE (RENDERIZAÇÃO CORRIGIDA)
 */
function renderizarLoading() {
    document.getElementById('listaChamados').innerHTML = '<p style="text-align:center; padding: 20px;">Sincronizando...</p>';
}

function renderizar() {
    const container = document.getElementById('listaChamados');
    
    // --- PASSO IMPORTANTE: SALVA A POSIÇÃO ATUAL DO SCROLL ---
    const posicaoScroll = window.scrollY;

    document.getElementById('count').innerText = chamados.length;
    container.innerHTML = "";

    if (chamados.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">Nenhum chamado ativo.</p>';
        return;
    }

    [...chamados].reverse().forEach(c => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        card.innerHTML = `
            <div class="ticket-header">
                <a href="${c.url}" target="_blank">🔗 TICKET #${c.ticketId}</a>
                <small>ELÉTRICA</small>
            </div>
            <div class="local-box">📍 ${c.local}</div>
            <div class="historico-container">
                <div class="historico-list" id="hist-${c.id}">
                    ${c.historico.length === 0 ? 
                        '<p style="color:#aaa; text-align:center; font-size: 14px; margin-top: 10px;">Aguardando tratativas...</p>' : 
                        c.historico.map(h => h.editando ? `
                            <div class="msg-item editing-box">
                                <input type="text" id="edit-input-${h.id}" value="${h.texto}" class="edit-input">
                                <div class="edit-btns">
                                    <button onclick="salvarEdicao('${c.id}', ${h.id})" class="btn-save-mini">Salvar</button>
                                    <button onclick="alternarEdicao('${c.id}', ${h.id})" class="btn-cancel-mini">Cancelar</button>
                                </div>
                            </div>` : `
                            <div class="msg-item">
                                <span><b>[${h.hora}]</b> ${h.texto}</span>
                                <div class="item-actions">
                                    <button onclick="alternarEdicao('${c.id}', ${h.id})">✏️</button>
                                    <button onclick="removerComentario('${c.id}', ${h.id})">❌</button>
                                </div>
                            </div>`).join('')}
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

    // --- PASSO IMPORTANTE: RESTAURA A POSIÇÃO DO SCROLL APÓS RENDERIZAR ---
    window.scrollTo(0, posicaoScroll);
}

function copiarRelatorioPlantao() {
    if (chamados.length === 0) return alert("Nada para relatar.");
    let relatorio = `*RELATÓRIO DE PASSAGEM DE PLANTÃO - ELÉTRICA*\n====================================\n\n`;
    chamados.forEach(c => {
        relatorio += `📍 *LOCAL:* ${c.local}\n🆔 *CHAMADO:* #${c.ticketId}\n🔗 *LINK:* ${c.url}\n📝 *TRATATIVAS:* \n`;
        if (c.historico.length === 0) relatorio += `   - Sem atualizações.\n`;
        else c.historico.forEach(h => relatorio += `   - [${h.hora}] ${h.texto}\n`);
        relatorio += `\n------------------------------------\n\n`;
    });
    const textarea = document.createElement('textarea');
    textarea.value = relatorio;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    const toast = document.getElementById('toast');
    if(toast){ toast.style.display = 'block'; setTimeout(() => { toast.style.display = 'none'; }, 3000); }
}
