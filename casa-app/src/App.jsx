import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from './api.js';

// ─── CORES POR SETOR (fallback para setores sem cor salva) ────────────────────
const SETOR_LIGHT = (cor) => cor + '18';
const FREQ_COLORS = ['#EF4444','#F97316','#EAB308','#22C55E','#14B8A6','#6366F1','#8B5CF6','#EC4899'];

// ─── HELPERS UI ───────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{-webkit-font-smoothing:antialiased;background:#F1F5F9;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:99px;}

.vtab{display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;transition:all .18s;white-space:nowrap;}
.vtab.on{background:#fff;color:#1E293B;box-shadow:0 1px 8px rgba(0,0,0,.12);}
.vtab:not(.on){background:transparent;color:#94A3B8;}
.vtab:hover:not(.on){background:rgba(255,255,255,.4);color:#475569;}

.hbtn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:9px;border:1.5px solid rgba(255,255,255,.15);background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;}
.hbtn:hover{background:rgba(255,255,255,.18);color:#fff;border-color:rgba(255,255,255,.3);}
.hbtn.danger:hover{background:rgba(239,68,68,.2);border-color:#EF4444;color:#FCA5A5;}

.task-row{display:flex;align-items:flex-start;gap:7px;padding:5px 7px;border-radius:7px;transition:background .12s;}
.task-row:hover{background:rgba(0,0,0,.04);}
.task-row:hover .xbtn,.task-row:hover .ebtn{opacity:1!important;}

.xbtn,.ebtn{background:none;border:none;cursor:pointer;font-size:12px;line-height:1;padding:1px 4px;border-radius:4px;flex-shrink:0;transition:all .15s;opacity:0;}
.xbtn{color:#CBD5E1;}.xbtn:hover{color:#EF4444;background:#FEF2F2;}
.ebtn{color:#CBD5E1;}.ebtn:hover{color:#6366F1;background:#EEF2FF;}

.add-row{width:100%;margin-top:5px;padding:5px 8px;border-radius:7px;border:1.5px dashed #E2E8F0;background:transparent;color:#CBD5E1;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;text-align:center;}
.add-row:hover{border-color:#6366F1;color:#6366F1;background:#EEF2FF;}

.card{background:#fff;border-radius:16px;border:1px solid #E2E8F0;box-shadow:0 1px 4px rgba(0,0,0,.05);}

.modal-bg{position:fixed;inset:0;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;z-index:50;padding:16px;backdrop-filter:blur(5px);}
.modal-box{background:#fff;border-radius:20px;padding:28px 24px;width:100%;max-width:420px;box-shadow:0 25px 60px rgba(0,0,0,.2);max-height:90vh;overflow-y:auto;}

.flabel{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:800;color:#94A3B8;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;display:block;}
.finput{width:100%;padding:11px 14px;border:2px solid #F1F5F9;border-radius:11px;font-family:'Nunito',sans-serif;font-size:14px;font-weight:600;color:#1E293B;background:#F8FAFC;outline:none;transition:border .15s;}
.finput:focus{border-color:#6366F1;background:#fff;}
select.finput{cursor:pointer;}

.sbtn{width:100%;padding:13px;border-radius:11px;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:800;border:none;cursor:pointer;transition:opacity .15s;}
.sbtn:hover{opacity:.88;}
.sbtn:disabled{opacity:.5;cursor:not-allowed;}
.sbtn.red{background:linear-gradient(135deg,#EF4444,#DC2626)!important;}
.cbtn{width:100%;padding:11px;border-radius:11px;background:transparent;color:#94A3B8;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:700;border:2px solid #F1F5F9;cursor:pointer;transition:all .15s;margin-top:8px;}
.cbtn:hover{background:#F8FAFC;color:#475569;}

.ptrack{height:5px;background:#E2E8F0;border-radius:99px;overflow:hidden;}
.pfill{height:100%;border-radius:99px;background:linear-gradient(90deg,#6366F1,#8B5CF6);transition:width .5s;}

.auth-input{width:100%;padding:13px 16px;border:2px solid #E2E8F0;border-radius:12px;font-family:'Nunito',sans-serif;font-size:15px;font-weight:600;color:#1E293B;background:#F8FAFC;outline:none;transition:all .15s;}
.auth-input:focus{border-color:#6366F1;background:#fff;}
.auth-btn{width:100%;padding:14px;border-radius:12px;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:800;border:none;cursor:pointer;transition:opacity .15s;margin-top:4px;}
.auth-btn:hover{opacity:.9;}
.auth-btn:disabled{opacity:.5;cursor:not-allowed;}

@keyframes fu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu .2s ease both;}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{animation:spin 1s linear infinite;display:inline-block;}

@media(max-width:640px){
  .hide-sm{display:none!important;}
  .show-sm{display:flex!important;}
}
@media(min-width:641px){.show-sm{display:none!important;}}
`;

// ─── TOAST ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const ref = useRef();
  const notify = useCallback((msg, err = false) => {
    setToast({ msg, err });
    clearTimeout(ref.current);
    ref.current = setTimeout(() => setToast(null), 2800);
  }, []);
  return { toast, notify };
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────
function Spinner({ size = 18 }) {
  return <span className="spin" style={{ width: size, height: size, border: `2px solid #E2E8F0`, borderTopColor: '#6366F1', borderRadius: '50%', display: 'inline-block' }} />;
}

// ─── MODAL BASE ───────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 17, color: '#0F172A', marginBottom: 20 }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label className="flabel">{label}</label>
    {children}
  </div>;
}

// ─── TELA DE AUTH ─────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode]     = useState('login');
  const [nome, setNome]     = useState('');
  const [email, setEmail]   = useState('');
  const [senha, setSenha]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  async function submit() {
    setError(''); setLoading(true);
    try {
      let data;
      if (mode === 'login') {
        data = await api.login({ email, senha });
      } else {
        if (!nome.trim()) { setError('Informe seu nome.'); setLoading(false); return; }
        data = await api.register({ nome, email, senha });
      }
      localStorage.setItem('casa_token', data.token);
      onLogin(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1E293B,#0F172A)', padding: 16 }}>
      <div className="fu" style={{ background: '#fff', borderRadius: 24, padding: '36px 32px', width: '100%', maxWidth: 400, boxShadow: '0 30px 80px rgba(0,0,0,.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🏠</div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 22, color: '#0F172A' }}>Organização da Casa</h1>
          <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
            {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta gratuita'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'register' && (
            <input className="auth-input" placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} />
          )}
          <input className="auth-input" type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="auth-input" type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()} />

          {error && <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, color: '#EF4444', textAlign: 'center' }}>{error}</p>}

          <button className="auth-btn" onClick={submit} disabled={loading}>
            {loading ? <Spinner size={16} /> : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </div>

        <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 20 }}>
          {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <span style={{ color: '#6366F1', cursor: 'pointer', fontWeight: 700 }}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
          </span>
        </p>
      </div>
    </div>
  );
}

// ─── SELETOR DE CASAS ─────────────────────────────────────────────────────────
function CasaSelector({ user, onSelect, onLogout }) {
  const [casas, setCasas]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // 'add' | {edit: casa} | {del: casa}
  const { toast, notify }     = useToast();

  useEffect(() => {
    api.getCasas().then(d => setCasas(d.casas)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleAdd(nome, descricao, usarModelo) {
    try {
      const d = await api.createCasa({ nome, descricao, usar_modelo: usarModelo });
      setCasas(c => [...c, d.casa]);
      setModal(null); notify('Casa criada ✓');
    } catch (e) { notify(e.message, true); }
  }

  async function handleEdit(id, nome, descricao) {
    try {
      const d = await api.updateCasa(id, { nome, descricao });
      setCasas(c => c.map(x => x.id === id ? { ...x, ...d.casa } : x));
      setModal(null); notify('Casa atualizada ✓');
    } catch (e) { notify(e.message, true); }
  }

  async function handleDelete(id) {
    try {
      await api.deleteCasa(id);
      setCasas(c => c.filter(x => x.id !== id));
      setModal(null); notify('Casa removida.');
    } catch (e) { notify(e.message, true); }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: "'Nunito',sans-serif" }}>
      <header style={{ background: 'linear-gradient(135deg,#1E293B,#0F172A)', padding: '16px 20px', boxShadow: '0 4px 20px rgba(0,0,0,.3)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏠</div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 15, color: '#F8FAFC' }}>Minhas Casas</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: '#64748B' }}>Olá, {user.nome}</div>
            </div>
          </div>
          <button className="hbtn" onClick={onLogout}>Sair</button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 48px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}><Spinner size={32} /></div>
        ) : (
          <div className="fu" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
            {casas.map(casa => (
              <div key={casa.id} className="card" style={{ padding: '20px 18px', cursor: 'pointer', transition: 'box-shadow .15s', position: 'relative' }}
                onClick={() => onSelect(casa)}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,.15)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)'}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🏠</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 16, color: '#1E293B', marginBottom: 4 }}>{casa.nome}</div>
                {casa.descricao && <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>{casa.descricao}</div>}
                <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: '#CBD5E1' }}>{casa.total_tarefas || 0} tarefas</div>

                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  <button className="ebtn" style={{ opacity: 1, color: '#CBD5E1' }}
                    onClick={() => setModal({ type: 'edit', casa })}>✏️</button>
                  <button className="xbtn" style={{ opacity: 1 }}
                    onClick={() => setModal({ type: 'del', casa })}>✕</button>
                </div>
              </div>
            ))}

            <button className="card" onClick={() => setModal({ type: 'add' })}
              style={{ border: '2px dashed #E2E8F0', background: 'transparent', cursor: 'pointer', minHeight: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#CBD5E1', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.color = '#6366F1'; e.currentTarget.style.background = '#EEF2FF'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#CBD5E1'; e.currentTarget.style.background = 'transparent'; }}>
              <span style={{ fontSize: 28 }}>＋</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 700 }}>Nova Casa</span>
            </button>
          </div>
        )}
      </main>

      {modal?.type === 'add' && <CasaFormModal title="🏠 Nova Casa" onConfirm={handleAdd} onClose={() => setModal(null)} />}
      {modal?.type === 'edit' && <CasaFormModal title="✏️ Editar Casa" casa={modal.casa} onConfirm={(n, d) => handleEdit(modal.casa.id, n, d)} onClose={() => setModal(null)} isEdit />}
      {modal?.type === 'del' && (
        <Modal title="⚠️ Remover casa" onClose={() => setModal(null)}>
          <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: '#64748B', marginBottom: 22, lineHeight: 1.6 }}>
            Remover <strong>"{modal.casa.nome}"</strong>? Todos os setores, intervalos e tarefas serão excluídos permanentemente.
          </p>
          <button className="sbtn red" onClick={() => handleDelete(modal.casa.id)}>Confirmar remoção</button>
          <button className="cbtn" onClick={() => setModal(null)}>Cancelar</button>
        </Modal>
      )}

      {toast && <Toast {...toast} />}
    </div>
  );
}

function CasaFormModal({ title, casa, onConfirm, onClose, isEdit }) {
  const [nome, setNome]       = useState(casa?.nome || '');
  const [desc, setDesc]       = useState(casa?.descricao || '');
  const [modelo, setModelo]   = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!nome.trim()) return;
    setLoading(true);
    await onConfirm(nome, desc, modelo);
    setLoading(false);
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Nome da casa"><input className="finput" autoFocus value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Casa da Rua das Flores" /></Field>
        <Field label="Descrição (opcional)"><input className="finput" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Família Silva" /></Field>
        {!isEdit && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, color: '#475569' }}>
            <input type="checkbox" checked={modelo} onChange={e => setModelo(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#6366F1' }} />
            Começar com modelo padrão de tarefas
          </label>
        )}
        <button className="sbtn" style={{ marginTop: 4 }} onClick={submit} disabled={loading}>
          {loading ? <Spinner size={16} /> : isEdit ? 'Salvar' : 'Criar casa'}
        </button>
        <button className="cbtn" onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}

// ─── GERENCIADOR DE TAREFAS (tela principal) ──────────────────────────────────
function TaskManager({ user, casa, onBack }) {
  const [setores,    setSetores]    = useState([]);
  const [intervalos, setIntervalos] = useState([]);
  const [tarefas,    setTarefas]    = useState([]);
  const [concluidas, setConcluidas] = useState(new Set());
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState('matriz');
  const [modal,      setModal]      = useState(null);
  const [confirm,    setConfirm]    = useState(null);
  const { toast, notify }           = useToast();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sd, id, td, cd] = await Promise.all([
          api.getSetores(casa.id),
          api.getIntervalos(casa.id),
          api.getTarefas(casa.id),
          api.getConcluidas(casa.id),
        ]);
        setSetores(sd.setores);
        setIntervalos(id.intervalos);
        setTarefas(td.tarefas);
        setConcluidas(new Set(cd.concluidas));
      } catch (e) { notify(e.message, true); }
      setLoading(false);
    }
    load();
  }, [casa.id]);

  // ── Toggle concluída ──
  async function toggle(tarefaId) {
    setConcluidas(prev => {
      const next = new Set(prev);
      next.has(tarefaId) ? next.delete(tarefaId) : next.add(tarefaId);
      return next;
    });
    try { await api.toggleConcluida({ tarefa_id: tarefaId }); }
    catch { setConcluidas(prev => { const next = new Set(prev); next.has(tarefaId) ? next.delete(tarefaId) : next.add(tarefaId); return next; }); }
  }

  // ── Tarefas ──
  async function addTarefa(setor_id, intervalo_id, texto) {
    if (!texto?.trim()) return;
    try {
      const d = await api.createTarefa({ setor_id, intervalo_id, texto });
      setTarefas(t => [...t, d.tarefa]);
      setModal(null); notify('Tarefa adicionada ✓');
    } catch (e) { notify(e.message, true); }
  }

  async function editTarefa(id, texto, setor_id, intervalo_id) {
    try {
      const d = await api.updateTarefa(id, { texto, setor_id, intervalo_id });
      setTarefas(t => t.map(x => x.id === id ? { ...x, ...d.tarefa } : x));
      setModal(null); notify('Tarefa atualizada ✓');
    } catch (e) { notify(e.message, true); }
  }

  async function delTarefa(id) {
    try {
      await api.deleteTarefa(id);
      setTarefas(t => t.filter(x => x.id !== id));
      setConcluidas(c => { const n = new Set(c); n.delete(id); return n; });
      setConfirm(null); notify('Tarefa removida.');
    } catch (e) { notify(e.message, true); }
  }

  // ── Setores ──
  async function addSetor(nome, emoji, cor) {
    try {
      const d = await api.createSetor({ casa_id: casa.id, nome, emoji, cor });
      setSetores(s => [...s, d.setor]);
      setModal(null); notify('Setor adicionado ✓');
    } catch (e) { notify(e.message, true); }
  }

  async function editSetor(id, nome, emoji, cor) {
    try {
      const d = await api.updateSetor(id, { nome, emoji, cor });
      setSetores(s => s.map(x => x.id === id ? { ...x, ...d.setor } : x));
      setModal(null); notify('Setor atualizado ✓');
    } catch (e) { notify(e.message, true); }
  }

  async function delSetor(id) {
    try {
      await api.deleteSetor(id);
      setSetores(s => s.filter(x => x.id !== id));
      setTarefas(t => t.filter(x => x.setor_id !== id));
      setConfirm(null); notify('Setor removido.');
    } catch (e) { notify(e.message, true); }
  }

  // ── Intervalos ──
  async function addIntervalo(dias, label) {
    try {
      const d = await api.createIntervalo({ casa_id: casa.id, dias, label });
      setIntervalos(i => [...i, d.intervalo].sort((a, b) => a.dias - b.dias));
      setModal(null); notify('Intervalo adicionado ✓');
    } catch (e) { notify(e.message, true); }
  }

  async function editIntervalo(id, dias, label) {
    try {
      const d = await api.updateIntervalo(id, { dias, label });
      setIntervalos(i => i.map(x => x.id === id ? { ...x, ...d.intervalo } : x).sort((a, b) => a.dias - b.dias));
      setModal(null); notify('Intervalo atualizado ✓');
    } catch (e) { notify(e.message, true); }
  }

  async function delIntervalo(id) {
    try {
      await api.deleteIntervalo(id);
      setIntervalos(i => i.filter(x => x.id !== id));
      setTarefas(t => t.filter(x => x.intervalo_id !== id));
      setConfirm(null); notify('Intervalo removido.');
    } catch (e) { notify(e.message, true); }
  }

  async function resetAll() {
    try {
      await api.resetConcluidas(casa.id);
      setConcluidas(new Set());
      setConfirm(null); notify('Progresso reiniciado ✓');
    } catch (e) { notify(e.message, true); }
  }

  const total = tarefas.length;
  const done  = concluidas.size;
  const pct   = total ? Math.round(done / total * 100) : 0;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
      <Spinner size={36} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: "'Nunito',sans-serif" }}>
      {/* HEADER */}
      <header style={{ background: 'linear-gradient(135deg,#1E293B,#0F172A)', color: '#F8FAFC', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 4px 20px rgba(0,0,0,.3)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 10px', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="hbtn" style={{ padding: '6px 10px', fontSize: 16 }} onClick={onBack}>←</button>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏠</div>
              <div>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 15, lineHeight: 1 }}>{casa.nome}</h1>
                <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: '#64748B', marginTop: 3 }}>{done}/{total} · {pct}%</p>
              </div>
            </div>
            <div className="hide-sm" style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <button className="hbtn" onClick={() => setModal({ type: 'setor' })}>＋ Setor</button>
              <button className="hbtn" onClick={() => setModal({ type: 'intervalo' })}>＋ Intervalo</button>
              <button className="hbtn danger" onClick={() => setConfirm({ type: 'reset' })}>↺ Resetar</button>
            </div>
            <button className="show-sm" style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 22, cursor: 'pointer', padding: '4px 6px', borderRadius: 8 }}
              onClick={() => setModal({ type: 'menu' })}>⋯</button>
          </div>

          <div className="ptrack" style={{ marginBottom: 12 }}>
            <div className="pfill" style={{ width: `${pct}%` }} />
          </div>

          <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,.06)', borderRadius: 12, padding: 4, marginBottom: 12, overflowX: 'auto' }}>
            {[{ id: 'matriz', icon: '⊞', label: 'Matriz' }, { id: 'setor', icon: '🏷️', label: 'Por Setor' }, { id: 'frequencia', icon: '🔄', label: 'Por Frequência' }].map(v => (
              <button key={v.id} className={`vtab${view === v.id ? ' on' : ''}`} onClick={() => setView(v.id)}>
                <span>{v.icon}</span>{v.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '20px 16px 48px' }}>

        {/* ── MATRIZ ── */}
        {view === 'matriz' && (
          <div className="fu" style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid #E2E8F0', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, top: 0, zIndex: 4, background: '#0F172A', padding: '14px 18px', minWidth: 170, textAlign: 'left', borderRight: '1px solid #1E293B', borderBottom: '1px solid #1E293B' }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.5px' }}>Setor \ Frequência</span>
                  </th>
                  {intervalos.map((int, i) => {
                    const fc = FREQ_COLORS[i % FREQ_COLORS.length];
                    return (
                      <th key={int.id} style={{ position: 'sticky', top: 0, zIndex: 3, background: '#0F172A', padding: '12px 14px', minWidth: 165, textAlign: 'center', borderBottom: '1px solid #1E293B', borderRight: '1px solid #1E293B' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: fc, display: 'block' }} />
                          <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, fontWeight: 700, color: '#E2E8F0' }}>{int.label}</span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="ebtn" style={{ opacity: .4, color: '#94A3B8', fontSize: 11 }} onClick={() => setModal({ type: 'edit_intervalo', item: int })}>✏️</button>
                            <button className="xbtn" style={{ opacity: .4, color: '#94A3B8', fontSize: 11 }} onClick={() => setConfirm({ type: 'intervalo', id: int.id, label: int.label })}>✕</button>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {setores.map((setor, si) => {
                  const cor = setor.cor || '#6366F1';
                  const light = SETOR_LIGHT(cor);
                  const setorTasks = tarefas.filter(t => t.setor_id === setor.id);
                  const setorDone  = setorTasks.filter(t => concluidas.has(t.id)).length;
                  return (
                    <tr key={setor.id}>
                      <td style={{ position: 'sticky', left: 0, zIndex: 2, background: si % 2 === 0 ? '#FAFBFF' : '#F8FAFC', padding: '12px 14px', verticalAlign: 'middle', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{setor.emoji || '📦'}</div>
                            <div>
                              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 800, color: '#1E293B' }}>{setor.nome}</div>
                              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 10, color: '#94A3B8', marginTop: 1 }}>{setorDone}/{setorTasks.length} feitas</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 2 }}>
                            <button className="ebtn" style={{ opacity: .5 }} onClick={() => setModal({ type: 'edit_setor', item: setor })}>✏️</button>
                            <button className="xbtn" style={{ opacity: .5 }} onClick={() => setConfirm({ type: 'setor', id: setor.id, nome: setor.nome })}>✕</button>
                          </div>
                        </div>
                      </td>
                      {intervalos.map((int) => {
                        const items = tarefas.filter(t => t.setor_id === setor.id && t.intervalo_id === int.id);
                        return (
                          <td key={int.id} style={{ background: si % 2 === 0 ? '#fff' : '#FAFBFF', padding: '9px 11px', verticalAlign: 'top', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                            {items.length === 0
                              ? <span style={{ display: 'block', textAlign: 'center', color: '#E2E8F0', fontSize: 18, padding: '6px 0' }}>—</span>
                              : items.map(t => {
                                const ck = concluidas.has(t.id);
                                return (
                                  <div key={t.id} className="task-row">
                                    <input type="checkbox" checked={ck} onChange={() => toggle(t.id)}
                                      style={{ width: 14, height: 14, marginTop: 2, accentColor: cor, cursor: 'pointer', flexShrink: 0 }} />
                                    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, fontWeight: 500, color: ck ? '#CBD5E1' : '#334155', textDecoration: ck ? 'line-through' : 'none', lineHeight: 1.4, flex: 1 }}>{t.texto}</span>
                                    <button className="ebtn" onClick={() => setModal({ type: 'edit_tarefa', item: t })}>✏️</button>
                                    <button className="xbtn" onClick={() => setConfirm({ type: 'tarefa', id: t.id, texto: t.texto })}>✕</button>
                                  </div>
                                );
                              })
                            }
                            <button className="add-row" onClick={() => setModal({ type: 'tarefa', setor_id: setor.id, intervalo_id: int.id })}>＋ tarefa</button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── POR SETOR ── */}
        {view === 'setor' && (
          <div className="fu" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(285px,1fr))', gap: 14 }}>
            {setores.map(setor => {
              const cor = setor.cor || '#6366F1';
              const light = SETOR_LIGHT(cor);
              const all = tarefas.filter(t => t.setor_id === setor.id);
              const dn = all.filter(t => concluidas.has(t.id)).length;
              const p2 = all.length ? Math.round(dn / all.length * 100) : 0;
              return (
                <div key={setor.id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px 12px', background: `linear-gradient(135deg,${light},#fff)`, borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: light, border: `2px solid ${cor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{setor.emoji || '📦'}</div>
                        <div>
                          <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 800, color: '#1E293B' }}>{setor.nome}</h3>
                          <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{dn}/{all.length} · {p2}%</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 3 }}>
                        <button className="ebtn" style={{ opacity: .7, fontSize: 13 }} onClick={() => setModal({ type: 'edit_setor', item: setor })}>✏️</button>
                        <button className="xbtn" style={{ opacity: .6, fontSize: 14 }} onClick={() => setConfirm({ type: 'setor', id: setor.id, nome: setor.nome })}>✕</button>
                      </div>
                    </div>
                    <div className="ptrack"><div className="pfill" style={{ width: `${p2}%`, background: cor }} /></div>
                  </div>
                  <div style={{ padding: '12px 14px 14px' }}>
                    {intervalos.map((int, fi) => {
                      const sub = all.filter(t => t.intervalo_id === int.id);
                      if (!sub.length) return null;
                      const fc = FREQ_COLORS[fi % FREQ_COLORS.length];
                      return (
                        <div key={int.id} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: fc, flexShrink: 0 }} />
                            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.5px' }}>{int.label}</span>
                          </div>
                          {sub.map(t => {
                            const ck = concluidas.has(t.id);
                            return (
                              <div key={t.id} className="task-row">
                                <input type="checkbox" checked={ck} onChange={() => toggle(t.id)}
                                  style={{ width: 15, height: 15, accentColor: cor, cursor: 'pointer', flexShrink: 0, marginTop: 1 }} />
                                <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 500, color: ck ? '#CBD5E1' : '#334155', textDecoration: ck ? 'line-through' : 'none', flex: 1, lineHeight: 1.4 }}>{t.texto}</span>
                                <button className="ebtn" onClick={() => setModal({ type: 'edit_tarefa', item: t })}>✏️</button>
                                <button className="xbtn" style={{ opacity: 0 }} onClick={() => setConfirm({ type: 'tarefa', id: t.id, texto: t.texto })}>✕</button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                    <button className="add-row" onClick={() => setModal({ type: 'tarefa', setor_id: setor.id, intervalo_id: intervalos[0]?.id })}>＋ Nova tarefa</button>
                  </div>
                </div>
              );
            })}
            <button className="card" onClick={() => setModal({ type: 'setor' })}
              style={{ border: '2px dashed #E2E8F0', background: 'transparent', cursor: 'pointer', minHeight: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#CBD5E1', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.color = '#6366F1'; e.currentTarget.style.background = '#EEF2FF'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#CBD5E1'; e.currentTarget.style.background = 'transparent'; }}>
              <span style={{ fontSize: 28 }}>＋</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 700 }}>Novo Setor</span>
            </button>
          </div>
        )}

        {/* ── POR FREQUÊNCIA ── */}
        {view === 'frequencia' && (
          <div className="fu" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {intervalos.map((int, fi) => {
              const all = tarefas.filter(t => t.intervalo_id === int.id);
              const dn  = all.filter(t => concluidas.has(t.id)).length;
              const p2  = all.length ? Math.round(dn / all.length * 100) : 0;
              const fc  = FREQ_COLORS[fi % FREQ_COLORS.length];
              return (
                <div key={int.id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${fc}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: fc }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 800, color: '#1E293B' }}>{int.label}</h3>
                        <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{dn}/{all.length} · {p2}%</p>
                        <div className="ptrack" style={{ marginTop: 7, maxWidth: 220 }}>
                          <div className="pfill" style={{ width: `${p2}%`, background: fc }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button className="hbtn" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setModal({ type: 'tarefa', setor_id: setores[0]?.id, intervalo_id: int.id })}>＋ Tarefa</button>
                      <button className="ebtn" style={{ opacity: 1, color: '#CBD5E1', fontSize: 14 }} onClick={() => setModal({ type: 'edit_intervalo', item: int })}>✏️</button>
                      <button className="xbtn" style={{ opacity: 1, fontSize: 15 }} onClick={() => setConfirm({ type: 'intervalo', id: int.id, label: int.label })}>✕</button>
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(195px,1fr))', gap: 10 }}>
                    {setores.map(setor => {
                      const cor = setor.cor || '#6366F1';
                      const sub = all.filter(t => t.setor_id === setor.id);
                      if (!sub.length) return null;
                      return (
                        <div key={setor.id} style={{ background: SETOR_LIGHT(cor), border: `1.5px solid ${cor}20`, borderRadius: 12, padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <span style={{ fontSize: 16 }}>{setor.emoji || '📦'}</span>
                            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, fontWeight: 800, color: cor }}>{setor.nome}</span>
                          </div>
                          {sub.map(t => {
                            const ck = concluidas.has(t.id);
                            return (
                              <div key={t.id} className="task-row">
                                <input type="checkbox" checked={ck} onChange={() => toggle(t.id)}
                                  style={{ width: 14, height: 14, accentColor: cor, cursor: 'pointer', flexShrink: 0, marginTop: 2 }} />
                                <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, fontWeight: 500, color: ck ? '#CBD5E1' : '#334155', textDecoration: ck ? 'line-through' : 'none', flex: 1, lineHeight: 1.4 }}>{t.texto}</span>
                                <button className="ebtn" onClick={() => setModal({ type: 'edit_tarefa', item: t })}>✏️</button>
                                <button className="xbtn" style={{ opacity: 0 }} onClick={() => setConfirm({ type: 'tarefa', id: t.id, texto: t.texto })}>✕</button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <button className="card" onClick={() => setModal({ type: 'intervalo' })}
              style={{ border: '2px dashed #E2E8F0', background: 'transparent', cursor: 'pointer', padding: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#CBD5E1', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.color = '#6366F1'; e.currentTarget.style.background = '#EEF2FF'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#CBD5E1'; e.currentTarget.style.background = 'transparent'; }}>
              <span style={{ fontSize: 22 }}>＋</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 700 }}>Novo Intervalo</span>
            </button>
          </div>
        )}
      </main>

      {/* ── MODAIS ── */}
      {modal?.type === 'menu' && (
        <Modal title="Menu" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['＋ Novo Setor', 'setor'], ['＋ Novo Intervalo', 'intervalo']].map(([l, t]) => (
              <button key={t} className="sbtn" onClick={() => setModal({ type: t })}>{l}</button>
            ))}
            <button className="sbtn red" onClick={() => { setModal(null); setConfirm({ type: 'reset' }); }}>↺ Resetar progresso</button>
            <button className="cbtn" onClick={() => setModal(null)}>Fechar</button>
          </div>
        </Modal>
      )}

      {modal?.type === 'tarefa' && (
        <TarefaModal setores={setores} intervalos={intervalos}
          initSetor={modal.setor_id} initInt={modal.intervalo_id}
          onConfirm={addTarefa} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'edit_tarefa' && (
        <TarefaModal setores={setores} intervalos={intervalos}
          item={modal.item} isEdit
          onConfirm={(sid, iid, txt) => editTarefa(modal.item.id, txt, sid, iid)}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === 'setor' && (
        <SetorModal onConfirm={addSetor} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'edit_setor' && (
        <SetorModal item={modal.item} isEdit
          onConfirm={(n, e, c) => editSetor(modal.item.id, n, e, c)}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === 'intervalo' && (
        <IntervaloModal onConfirm={addIntervalo} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'edit_intervalo' && (
        <IntervaloModal item={modal.item} isEdit
          onConfirm={(d, l) => editIntervalo(modal.item.id, d, l)}
          onClose={() => setModal(null)} />
      )}

      {confirm && (
        <Modal title="⚠️ Confirmar" onClose={() => setConfirm(null)}>
          <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: '#64748B', marginBottom: 22, lineHeight: 1.6 }}>
            {confirm.type === 'tarefa'    && <>Remover <strong>"{confirm.texto}"</strong>?</>}
            {confirm.type === 'intervalo' && <>Remover <strong>"{confirm.label}"</strong> e todas as tarefas desse intervalo?</>}
            {confirm.type === 'setor'     && <>Remover <strong>"{confirm.nome}"</strong> e todas as suas tarefas?</>}
            {confirm.type === 'reset'     && <>Desmarcar todas as tarefas desta casa?</>}
          </p>
          <button className="sbtn red" onClick={() => {
            if (confirm.type === 'tarefa')    delTarefa(confirm.id);
            if (confirm.type === 'intervalo') delIntervalo(confirm.id);
            if (confirm.type === 'setor')     delSetor(confirm.id);
            if (confirm.type === 'reset')     resetAll();
          }}>Confirmar</button>
          <button className="cbtn" onClick={() => setConfirm(null)}>Cancelar</button>
        </Modal>
      )}

      {toast && <Toast {...toast} />}
    </div>
  );
}

// ─── SUB-MODAIS ───────────────────────────────────────────────────────────────
function TarefaModal({ setores, intervalos, item, initSetor, initInt, isEdit, onConfirm, onClose }) {
  const [texto,  setTexto]  = useState(item?.texto || '');
  const [sid,    setSid]    = useState(item?.setor_id || initSetor || setores[0]?.id);
  const [iid,    setIid]    = useState(item?.intervalo_id || initInt || intervalos[0]?.id);
  const [loading,setLoading]= useState(false);

  async function submit() {
    if (!texto.trim()) return;
    setLoading(true);
    await onConfirm(Number(sid), Number(iid), texto);
    setLoading(false);
  }

  return (
    <Modal title={isEdit ? '✏️ Editar Tarefa' : '➕ Nova Tarefa'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Setor">
          <select className="finput" value={sid} onChange={e => setSid(e.target.value)}>
            {setores.map(s => <option key={s.id} value={s.id}>{s.emoji || '📦'} {s.nome}</option>)}
          </select>
        </Field>
        <Field label="Frequência">
          <select className="finput" value={iid} onChange={e => setIid(e.target.value)}>
            {intervalos.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
          </select>
        </Field>
        <Field label="Descrição">
          <input autoFocus className="finput" value={texto} onChange={e => setTexto(e.target.value)}
            placeholder="Ex: Limpar janelas" onKeyDown={e => e.key === 'Enter' && submit()} />
        </Field>
        <button className="sbtn" style={{ marginTop: 4 }} onClick={submit} disabled={loading}>
          {loading ? <Spinner size={16} /> : isEdit ? 'Salvar' : 'Adicionar tarefa'}
        </button>
        <button className="cbtn" onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}

const EMOJI_OPTIONS = ['📦','🛏️','🚿','🍳','🛋️','💻','🪴','🌿','🧺','🚗','🏠','🪞','🪑','🔧','📚'];
const COR_OPTIONS   = ['#6366F1','#0EA5E9','#8B5CF6','#EC4899','#F59E0B','#14B8A6','#F97316','#22C55E','#06B6D4','#A855F7','#EF4444','#64748B'];

function SetorModal({ item, isEdit, onConfirm, onClose }) {
  const [nome,   setNome]   = useState(item?.nome  || '');
  const [emoji,  setEmoji]  = useState(item?.emoji || '📦');
  const [cor,    setCor]    = useState(item?.cor   || '#6366F1');
  const [loading,setLoading]= useState(false);

  async function submit() {
    if (!nome.trim()) return;
    setLoading(true);
    await onConfirm(nome, emoji, cor);
    setLoading(false);
  }

  return (
    <Modal title={isEdit ? '✏️ Editar Setor' : '🏷️ Novo Setor'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Nome do setor">
          <input autoFocus className="finput" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Varanda" />
        </Field>
        <Field label="Emoji">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EMOJI_OPTIONS.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${emoji === e ? '#6366F1' : '#E2E8F0'}`, background: emoji === e ? '#EEF2FF' : '#F8FAFC', cursor: 'pointer', fontSize: 18 }}>{e}</button>
            ))}
          </div>
        </Field>
        <Field label="Cor">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {COR_OPTIONS.map(c => (
              <button key={c} onClick={() => setCor(c)}
                style={{ width: 28, height: 28, borderRadius: 8, background: c, border: `3px solid ${cor === c ? '#1E293B' : 'transparent'}`, cursor: 'pointer' }} />
            ))}
          </div>
        </Field>
        <button className="sbtn" style={{ marginTop: 4 }} onClick={submit} disabled={loading}>
          {loading ? <Spinner size={16} /> : isEdit ? 'Salvar' : 'Adicionar setor'}
        </button>
        <button className="cbtn" onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}

function IntervaloModal({ item, isEdit, onConfirm, onClose }) {
  const [dias,   setDias]   = useState(item?.dias  || '');
  const [label,  setLabel]  = useState(item?.label || '');
  const [loading,setLoading]= useState(false);

  async function submit() {
    const d = parseInt(dias);
    if (!d || d < 1 || !label.trim()) return;
    setLoading(true);
    await onConfirm(d, label);
    setLoading(false);
  }

  return (
    <Modal title={isEdit ? '✏️ Editar Intervalo' : '🔄 Novo Intervalo'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Número de dias">
          <input autoFocus className="finput" type="number" min="1" value={dias} onChange={e => setDias(e.target.value)} placeholder="Ex: 60" />
        </Field>
        <Field label="Nome">
          <input className="finput" value={label} onChange={e => setLabel(e.target.value)}
            placeholder="Ex: A cada 60 dias" onKeyDown={e => e.key === 'Enter' && submit()} />
        </Field>
        <button className="sbtn" style={{ marginTop: 4 }} onClick={submit} disabled={loading}>
          {loading ? <Spinner size={16} /> : isEdit ? 'Salvar' : 'Adicionar intervalo'}
        </button>
        <button className="cbtn" onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, err }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: err ? '#EF4444' : '#1E293B', color: '#fff', padding: '12px 22px', borderRadius: 12, zIndex: 100, whiteSpace: 'nowrap', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700, boxShadow: '0 8px 30px rgba(0,0,0,.22)', animation: 'fu .2s ease' }}>
      {msg}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('loading'); // loading | auth | casas | app
  const [user,   setUser]   = useState(null);
  const [casa,   setCasa]   = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('casa_token');
    if (!token) { setScreen('auth'); return; }
    api.me()
      .then(d => { setUser(d.user); setScreen('casas'); })
      .catch(() => { localStorage.removeItem('casa_token'); setScreen('auth'); });
  }, []);

  function handleLogin(u) { setUser(u); setScreen('casas'); }
  function handleLogout() { localStorage.removeItem('casa_token'); setUser(null); setCasa(null); setScreen('auth'); }
  function handleSelectCasa(c) { setCasa(c); setScreen('app'); }
  function handleBack() { setCasa(null); setScreen('casas'); }

  if (screen === 'loading') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
      <Spinner size={36} />
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      {screen === 'auth'  && <AuthScreen onLogin={handleLogin} />}
      {screen === 'casas' && <CasaSelector user={user} onSelect={handleSelectCasa} onLogout={handleLogout} />}
      {screen === 'app'   && <TaskManager  user={user} casa={casa} onBack={handleBack} />}
    </>
  );
}
