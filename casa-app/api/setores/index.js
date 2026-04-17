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
  const casa_id = req.query.casa_id || req.body?.casa_id;

  if (!casa_id) return err(res, 'casa_id é obrigatório');
  if (!(await ownsCasa(pool, casa_id, u.id))) return err(res, 'Não encontrado', 404);

  if (req.method === 'GET') {
    const [rows] = await pool.query(
      'SELECT * FROM setores WHERE casa_id = ? ORDER BY ordem ASC, id ASC',
      [casa_id]
    );
    return ok(res, { setores: rows });
  }

  if (req.method === 'POST') {
    const { nome, emoji = '📦', cor = '#6366F1' } = req.body || {};
    if (!nome?.trim()) return err(res, 'Nome é obrigatório');
    const [r] = await pool.query(
      'INSERT INTO setores (casa_id, nome, emoji, cor) VALUES (?,?,?,?)',
      [casa_id, nome.trim(), emoji, cor]
    );
    const [rows] = await pool.query('SELECT * FROM setores WHERE id = ?', [r.insertId]);
    return ok(res, { setor: rows[0] }, 201);
  }

  err(res, 'Método não permitido', 405);
};
