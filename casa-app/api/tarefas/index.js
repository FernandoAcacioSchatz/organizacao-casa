const { getPool } = require('../../lib/db');
const { getUser } = require('../../lib/auth');
const { cors, ok, err, handleOptions } = require('../../lib/helpers');

async function ownsCasa(pool, casaId, userId) {
  const [r] = await pool.query('SELECT id FROM casas WHERE id = ? AND user_id = ?', [casaId, userId]);
  return r.length > 0;
}

module.exports = async function handler(req, res) {
  cors(res);
  if (handleOptions(req, res)) return;

  const u = getUser(req);
  if (!u) return err(res, 'Não autorizado', 401);

  const pool = getPool();

  if (req.method === 'GET') {
    const { casa_id } = req.query;
    if (!casa_id) return err(res, 'casa_id é obrigatório');
    if (!(await ownsCasa(pool, casa_id, u.id))) return err(res, 'Não encontrado', 404);

    const [rows] = await pool.query(
      `SELECT t.id, t.texto, t.setor_id, t.intervalo_id, t.criado_em
       FROM tarefas t
       JOIN setores s ON t.setor_id = s.id
       WHERE s.casa_id = ?
       ORDER BY t.id ASC`,
      [casa_id]
    );
    return ok(res, { tarefas: rows });
  }

  if (req.method === 'POST') {
    const { setor_id, intervalo_id, texto } = req.body || {};
    if (!setor_id || !intervalo_id || !texto?.trim()) 
      return err(res, 'setor_id, intervalo_id e texto são obrigatórios');

    // Verify the setor belongs to a casa owned by user
    const [sr] = await pool.query(
      'SELECT s.casa_id FROM setores s JOIN casas c ON s.casa_id = c.id WHERE s.id = ? AND c.user_id = ?',
      [setor_id, u.id]
    );
    if (!sr.length) return err(res, 'Setor não encontrado', 404);

    const [r] = await pool.query(
      'INSERT INTO tarefas (setor_id, intervalo_id, texto) VALUES (?,?,?)',
      [setor_id, intervalo_id, texto.trim()]
    );
    const [rows] = await pool.query('SELECT * FROM tarefas WHERE id = ?', [r.insertId]);
    return ok(res, { tarefa: rows[0] }, 201);
  }

  err(res, 'Método não permitido', 405);
};
