const { getPool } = require('../../lib/db');
const { getUser } = require('../../lib/auth');
const { cors, ok, err, handleOptions } = require('../../lib/helpers');

module.exports = async function handler(req, res) {
  cors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return err(res, 'Método não permitido', 405);

  const u = getUser(req);
  if (!u) return err(res, 'Não autorizado', 401);

  const pool = getPool();
  const [rows] = await pool.query('SELECT id, nome, email FROM users WHERE id = ?', [u.id]);
  if (!rows.length) return err(res, 'Usuário não encontrado', 404);
  ok(res, { user: rows[0] });
};
