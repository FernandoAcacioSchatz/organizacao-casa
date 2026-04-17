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
      'SELECT * FROM intervalos WHERE casa_id = ? ORDER BY dias ASC',
      [casa_id]
    );
    return ok(res, { intervalos: rows });
  }

  if (req.method === 'POST') {
    const { dias, label } = req.body || {};
    const d = parseInt(dias);
    if (!d || d < 1 || !label?.trim()) return err(res, 'dias e label são obrigatórios');
    const [exists] = await pool.query(
      'SELECT id FROM intervalos WHERE casa_id = ? AND dias = ?', [casa_id, d]
    );
    if (exists.length) return err(res, 'Intervalo com esse número de dias já existe', 409);
    const [r] = await pool.query(
      'INSERT INTO intervalos (casa_id, dias, label) VALUES (?,?,?)',
      [casa_id, d, label.trim()]
    );
    const [rows] = await pool.query('SELECT * FROM intervalos WHERE id = ?', [r.insertId]);
    return ok(res, { intervalo: rows[0] }, 201);
  }

  err(res, 'Método não permitido', 405);
};
