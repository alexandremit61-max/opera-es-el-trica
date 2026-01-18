// SEU LINK DO MOCKAPI JÁ CONFIGURADO
const API_URL = "https://696cb398f4a79b31517f95f0.mockapi.io/chamados";

let chamados = [];

// 1. Inicialização: Carrega dados do navegador
window.onload = function() {
    const salvos = localStorage.getItem('saski_eletrica_db');
    if (salvos) {
        chamados = JSON.parse(salvos);
        // Reseta estado de edição ao carregar
        chamados.forEach(c => c.historico.forEach(h => h.editando = false));
        renderizar();
    }
};

// 2. Salva permanentemente no navegador
function salvarDados() {
    localStorage.setItem('saski_eletrica_db', JSON.stringify(chamados));
    renderizar();
}

// 3. Adiciona novo chamado via colagem
function adicionarChamado() {
    const input = document.getElementById('rawInput');
    const texto = input.value.trim();
    if (!texto) return;

    // Busca ID de 6 dígitos
    const matchId = texto.match(/\d{6}/);
    const ticketId = matchId ? matchId[0] : "000000";
    
    // Extrai o Título (Sigla inclusive)
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
        id: ticketId,
        local: localFinal,
        url: `https://saski.brisanet.net.br/chamado/${ticketId}`,
        historico: []
    };

    chamados.unshift(novo);
    input.value = "";
    salvarDados();
}

// --- GESTÃO DE TRATATIVAS (HISTÓRICO) ---

function adicionarComentario(id) {
    const campo = document.getElementById(`input-${id}`);
    const msg = campo.value.trim();
    if (!msg) return;

    const index = chamados.findIndex(c => c.id == id);
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    chamados[index].historico.push({ 
        id: Date.now(), 
        hora: hora, 
        texto: msg,
        editando: false 
    });

    campo.value = ""; 
    salvarDados();
}

// Abre o modo de edição no próprio card
function alternarEdicao(ticketId, comentarioId) {
    const tIdx = chamados.findIndex(c => c.id == ticketId);
    const hIdx = chamados[tIdx].historico.findIndex(h => h.id == comentarioId);
    
    chamados[tIdx].historico[hIdx].editando = !chamados[tIdx].historico[hIdx].editando;
    renderizar(); // Apenas muda visual
}

// Salva a edição feita no campo in-line
function salvarEdicao(ticketId, comentarioId) {
    const tIdx = chamados.findIndex(c => c.id == ticketId);
    const hIdx = chamados[tIdx].historico.findIndex(h => h.id == comentarioId);
    const novoTexto = document.getElementById(`edit-input-${comentarioId}`).value.trim();
    
    if (novoTexto) {
        chamados[tIdx].historico[hIdx].texto = novoTexto;
        chamados[tIdx].historico[hIdx].editando = false;
        salvarDados();
    }
}

function removerComentario(ticketId, comentarioId) {
    if (confirm("Você tem certeza que deseja remover esta tratativa?")) {
        const tIdx = chamados.findIndex(c => c.id == ticketId);
        chamados[tIdx].historico = chamados[tIdx].historico.filter(h => h.id != comentarioId);
        salvarDados();
    }
}

// --- RENDERIZAÇÃO E RELATÓRIO ---

function finalizarChamado(id) {
    if (confirm(`Confirmar finalização do chamado #${id}?`)) {
        chamados = chamados.filter(c => c.id !== id);
        salvarDados();
    }
}

function renderizar() {
    const container = document.getElementById('listaChamados');
    document.getElementById('count').innerText = chamados.length;
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
                    ${c.historico.length === 0 ? 
                        '<p style="color:#aaa; text-align:center; font-size: 14px; margin-top: 10px;">Aguardando tratativas...</p>' : 
                        c.historico.map(h => {
                            if (h.editando) {
                                return `
                                <div class="msg-item editing-box">
                                    <input type="text" id="edit-input-${h.id}" value="${h.texto}" class="edit-input">
                                    <div class="edit-btns">
                                        <button onclick="salvarEdicao('${c.id}', ${h.id})" class="btn-save-mini">Salvar</button>
                                        <button onclick="alternarEdicao('${c.id}', ${h.id})" class="btn-cancel-mini">Cancelar</button>
                                    </div>
                                </div>`;
                            } else {
                                return `
                                <div class="msg-item">
                                    <span><b>[${h.hora}]</b> ${h.texto}</span>
                                    <div class="item-actions">
                                        <button onclick="alternarEdicao('${c.id}', ${h.id})" title="Editar">✏️</button>
                                        <button onclick="removerComentario('${c.id}', ${h.id})" title="Remover">❌</button>
                                    </div>
                                </div>`;
                            }
                        }).join('')}
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
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}
