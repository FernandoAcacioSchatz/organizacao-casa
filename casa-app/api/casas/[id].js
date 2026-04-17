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

  // Verify ownership
  const [rows] = await pool.query('SELECT * FROM casas WHERE id = ? AND user_id = ?', [id, u.id]);
  if (!rows.length) return err(res, 'Casa não encontrada', 404);
  const casa = rows[0];

  if (req.method === 'GET') return ok(res, { casa });

  if (req.method === 'PUT') {
    const { nome, descricao } = req.body || {};
    if (!nome?.trim()) return err(res, 'Nome é obrigatório');
    await pool.query('UPDATE casas SET nome = ?, descricao = ? WHERE id = ?',
      [nome.trim(), (descricao || '').trim(), id]);
    return ok(res, { casa: { ...casa, nome: nome.trim(), descricao: descricao || '' } });
  }

  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM casas WHERE id = ?', [id]);
    return ok(res, { deleted: true });
  }

  err(res, 'Método não permitido', 405);
};
