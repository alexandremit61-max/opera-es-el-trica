:root {
    --orange: #F15A24;
    --green: #27ae60;
    --dark: #2c3e50;
    --bg: #f4f7f6;
    --navy: #34495e;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--bg);
    margin: 0;
    color: var(--dark);
}

.main-header {
    background: var(--orange);
    color: white;
    padding: 1rem 5%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.main-header h1 { margin: 0; font-size: 1.5rem; }

.container { padding: 20px 5%; max-width: 900px; margin: auto; }

.card {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 15px rgba(0,0,0,0.05);
    margin-bottom: 25px;
}

h3 { margin-top: 0; color: var(--orange); border-bottom: 1px solid #eee; padding-bottom: 10px; }

textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-sizing: border-box;
    font-family: inherit;
}

.btn-primary {
    background: var(--orange);
    color: white;
    border: none;
    padding: 14px;
    width: 100%;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    margin-top: 12px;
}

.btn-share {
    background: white;
    color: var(--orange);
    border: none;
    padding: 10px 18px;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
}

/* CARDS DE CHAMADO */
.ticket-card {
    background: white;
    border-left: 10px solid var(--orange);
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

.ticket-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    align-items: center;
}

.ticket-header a {
    color: var(--orange);
    font-weight: bold;
    text-decoration: none;
    background: #fff1eb;
    padding: 6px 12px;
    border-radius: 6px;
}

.local-box {
    background: #f8f9fa;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 15px;
    border: 1px solid #eee;
    font-weight: bold;
}

/* HISTÓRICO */
.historico-container {
    background: #fdfdfd;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 15px;
}

.historico-list {
    padding: 12px;
    max-height: 200px;
    overflow-y: auto;
}

.msg-item {
    padding: 8px 0;
    border-bottom: 1px dotted #e0e0e0;
    font-size: 0.95rem;
}

.msg-item b { color: var(--orange); margin-right: 8px; }

.acao-tratativa { display: flex; gap: 10px; margin-top: 15px; }
.acao-tratativa input { flex: 1; padding: 12px; border: 1px solid #ccc; border-radius: 6px; }

.btn-add {
    background: var(--navy);
    color: white;
    border: none;
    padding: 0 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
}

.btn-finalize {
    background: var(--green);
    color: white;
    border: none;
    padding: 12px;
    width: 100%;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    margin-top: 15px;
}

.toast {
    position: fixed; bottom: 20px; right: 20px;
    background: #222; color: white;
    padding: 15px 30px; border-radius: 10px;
    display: none; font-weight: bold;
    z-index: 1000;
}
