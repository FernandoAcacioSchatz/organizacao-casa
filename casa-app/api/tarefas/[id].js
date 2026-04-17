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
    `SELECT t.* FROM tarefas t
     JOIN setores s ON t.setor_id = s.id
     JOIN casas c ON s.casa_id = c.id
     WHERE t.id = ? AND c.user_id = ?`,
    [id, u.id]
  );
  if (!rows.length) return err(res, 'Tarefa não encontrada', 404);
  const tarefa = rows[0];

  if (req.method === 'PUT') {
    const { texto, setor_id, intervalo_id } = req.body || {};
    if (!texto?.trim()) return err(res, 'texto é obrigatório');
    const newSetor = setor_id || tarefa.setor_id;
    const newInt   = intervalo_id || tarefa.intervalo_id;
    await pool.query('UPDATE tarefas SET texto = ?, setor_id = ?, intervalo_id = ? WHERE id = ?',
      [texto.trim(), newSetor, newInt, id]);
    return ok(res, { tarefa: { ...tarefa, texto: texto.trim(), setor_id: newSetor, intervalo_id: newInt } });
  }

  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM tarefas WHERE id = ?', [id]);
    return ok(res, { deleted: true });
  }

  err(res, 'Método não permitido', 405);
};
