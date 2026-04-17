const { getPool } = require('../../lib/db');
const { getUser } = require('../../lib/auth');
const { cors, ok, err, handleOptions } = require('../../lib/helpers');

// Setores e intervalos padrão para semente
const DEFAULT_SETORES = [
  { nome:'Roupa',      emoji:'👕', cor:'#6366F1' },
  { nome:'Banheiro',   emoji:'🚿', cor:'#0EA5E9' },
  { nome:'Quarto',     emoji:'🛏️', cor:'#8B5CF6' },
  { nome:'Escritório', emoji:'💻', cor:'#EC4899' },
  { nome:'Copa',       emoji:'🪴', cor:'#F59E0B' },
  { nome:'Sala',       emoji:'🛋️', cor:'#14B8A6' },
  { nome:'Cozinha',    emoji:'🍳', cor:'#F97316' },
  { nome:'Área',       emoji:'🌿', cor:'#22C55E' },
  { nome:'Lavação',    emoji:'🧺', cor:'#06B6D4' },
  { nome:'Carro',      emoji:'🚗', cor:'#A855F7' },
];

const DEFAULT_INTERVALOS = [
  { dias:1,   label:'Todo dia' },
  { dias:2,   label:'A cada 2 dias' },
  { dias:7,   label:'Semanal' },
  { dias:15,  label:'Quinzenal' },
  { dias:30,  label:'Mensal' },
  { dias:40,  label:'A cada 40 dias' },
  { dias:45,  label:'A cada 45 dias' },
  { dias:150, label:'A cada 150 dias' },
];

async function seedCasa(pool, casaId) {
  // Inserir setores
  const setorIds = {};
  for (let i = 0; i < DEFAULT_SETORES.length; i++) {
    const s = DEFAULT_SETORES[i];
    const [r] = await pool.query(
      'INSERT INTO setores (casa_id, nome, emoji, cor, ordem) VALUES (?,?,?,?,?)',
      [casaId, s.nome, s.emoji, s.cor, i]
    );
    setorIds[s.nome] = r.insertId;
  }

  // Inserir intervalos
  const intIds = {};
  for (const iv of DEFAULT_INTERVALOS) {
    const [r] = await pool.query(
      'INSERT INTO intervalos (casa_id, dias, label) VALUES (?,?,?)',
      [casaId, iv.dias, iv.label]
    );
    intIds[iv.dias] = r.insertId;
  }

  // Inserir tarefas padrão
  const TAREFAS = [
    ['Roupa',2,'Lavar roupa'],['Roupa',2,'Pendurar roupa'],['Roupa',2,'Recolher roupa'],
    ['Roupa',2,'Dobrar roupas'],['Roupa',2,'Guardar roupas'],
    ['Banheiro',7,'Lavar o box'],['Banheiro',7,'Lavar o vaso sanitário'],
    ['Banheiro',15,'Limpar bancada e superfícies'],['Banheiro',30,'Limpar o espelho'],
    ['Banheiro',7,'Limpar a pia por dentro e por fora'],['Banheiro',7,'Limpar o chão'],
    ['Banheiro',2,'Tirar lixo'],
    ['Quarto',7,'Tirar o pó das superfícies'],['Quarto',7,'Trocar roupa de cama'],
    ['Quarto',7,'Virar colchão'],['Quarto',7,'Varrer e passar pano'],['Quarto',7,'Tirar lixo'],
    ['Escritório',7,'Varrer e passar pano'],['Escritório',15,'Tirar o pó das superfícies'],
    ['Copa',7,'Varrer e passar pano'],['Copa',7,'Limpar janela e mesa do telefone'],
    ['Copa',7,'Organizar mesa do telefone'],
    ['Sala',15,'Organizar, tirar pó dos móveis e janelas'],
    ['Sala',7,'Arrumar o sofá e bater os lençóis'],
    ['Sala',7,'Varrer e passar pano'],['Sala',7,'Bater o tapete'],
    ['Cozinha',1,'Lavar a louça'],['Cozinha',1,'Secar e guardar a louça'],
    ['Cozinha',7,'Limpar fogão'],['Cozinha',30,'Limpar área de temperos'],
    ['Cozinha',7,'Limpar janelas, mesas e cadeiras'],['Cozinha',7,'Limpar air fryer'],
    ['Cozinha',7,'Limpar a geladeira'],['Cozinha',45,'Limpar em cima da geladeira e armários'],
    ['Cozinha',1,'Limpar pia'],['Cozinha',30,'Limpar atrás do fogão e geladeira'],
    ['Cozinha',7,'Limpar chão da cozinha e copa'],['Cozinha',7,'Limpar cadeiras da copa'],
    ['Cozinha',2,'Tirar lixo da cozinha'],
    ['Área',150,'Lavar casinha dos cachorros'],['Área',30,'Lavar calçada e varanda'],
    ['Área',30,'Limpar móveis da varanda'],['Área',2,'Levar lixo para coleta'],
    ['Área',40,'Roçar a grama'],['Área',30,'Lavar garagem e mesas'],
    ['Área',30,'Organizar a garagem'],
    ['Lavação',30,'Organizar a lavação'],['Lavação',30,'Passar pano na lavação'],
    ['Lavação',30,'Limpar os tanques'],['Lavação',30,'Lavar a máquina'],
    ['Lavação',30,'Limpar prateleiras e janelas'],
    ['Carro',15,'Lavar por fora'],['Carro',30,'Lavar por fora e por dentro'],
  ];

  for (const [setor, dias, texto] of TAREFAS) {
    if (setorIds[setor] && intIds[dias]) {
      await pool.query(
        'INSERT INTO tarefas (setor_id, intervalo_id, texto) VALUES (?,?,?)',
        [setorIds[setor], intIds[dias], texto]
      );
    }
  }
}

module.exports = async function handler(req, res) {
  cors(res);
  if (handleOptions(req, res)) return;

  const u = getUser(req);
  if (!u) return err(res, 'Não autorizado', 401);

  const pool = getPool();

  if (req.method === 'GET') {
    const [rows] = await pool.query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM setores s WHERE s.casa_id = c.id) AS total_setores,
        (SELECT COUNT(*) FROM tarefas t 
          JOIN setores s ON t.setor_id = s.id 
          WHERE s.casa_id = c.id) AS total_tarefas
       FROM casas c WHERE c.user_id = ? ORDER BY c.criado_em ASC`,
      [u.id]
    );
    return ok(res, { casas: rows });
  }

  if (req.method === 'POST') {
    const { nome, descricao = '', usar_modelo = false } = req.body || {};
    if (!nome?.trim()) return err(res, 'Nome da casa é obrigatório');

    const [r] = await pool.query(
      'INSERT INTO casas (user_id, nome, descricao) VALUES (?,?,?)',
      [u.id, nome.trim(), descricao.trim()]
    );
    const casaId = r.insertId;

    if (usar_modelo) await seedCasa(pool, casaId);

    const [rows] = await pool.query('SELECT * FROM casas WHERE id = ?', [casaId]);
    return ok(res, { casa: rows[0] }, 201);
  }

  err(res, 'Método não permitido', 405);
};
