const { getPool } = require('../../lib/db');
const { getUser } = require('../../lib/auth');
const { cors, ok, err, handleOptions } = require('../../lib/helpers');

module.exports = async function handler(req, res) {
  cors(res);
  if (handleOptions(req, res)) return;

  const u = getUser(req);
  if (!u) return err(res, 'Não autorizado', 401);

  const { id } = req.query;
  const pool = getPool();

  const [rows] = await pool.query(
    `SELECT i.* FROM intervalos i
     JOIN casas c ON i.casa_id = c.id
     WHERE i.id = ? AND c.user_id = ?`,
    [id, u.id]
  );
  if (!rows.length) return err(res, 'Intervalo não encontrado', 404);
  const intervalo = rows[0];

  if (req.method === 'PUT') {
    const { dias, label } = req.body || {};
    const d = parseInt(dias);
    if (!d || d < 1 || !label?.trim()) return err(res, 'dias e label são obrigatórios');
    await pool.query('UPDATE intervalos SET dias = ?, label = ? WHERE id = ?', [d, label.trim(), id]);
    return ok(res, { intervalo: { ...intervalo, dias: d, label: label.trim() } });
  }

  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM intervalos WHERE id = ?', [id]);
    return ok(res, { deleted: true });
  }

  err(res, 'Método não permitido', 405);
};
