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
    `SELECT s.* FROM setores s
     JOIN casas c ON s.casa_id = c.id
     WHERE s.id = ? AND c.user_id = ?`,
    [id, u.id]
  );
  if (!rows.length) return err(res, 'Setor não encontrado', 404);
  const setor = rows[0];

  if (req.method === 'PUT') {
    const { nome, emoji, cor } = req.body || {};
    if (!nome?.trim()) return err(res, 'Nome é obrigatório');
    await pool.query('UPDATE setores SET nome = ?, emoji = ?, cor = ? WHERE id = ?',
      [nome.trim(), emoji || setor.emoji, cor || setor.cor, id]);
    return ok(res, { setor: { ...setor, nome: nome.trim(), emoji: emoji || setor.emoji, cor: cor || setor.cor } });
  }

  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM setores WHERE id = ?', [id]);
    return ok(res, { deleted: true });
  }

  err(res, 'Método não permitido', 405);
};
