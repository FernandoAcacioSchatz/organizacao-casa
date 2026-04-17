const { getPool } = require('../../lib/db');
const { getUser } = require('../../lib/auth');
const { cors, ok, err, handleOptions } = require('../../lib/helpers');

module.exports = async function handler(req, res) {
  cors(res);
  if (handleOptions(req, res)) return;

  const u = getUser(req);
  if (!u) return err(res, 'Não autorizado', 401);

  const pool = getPool();

  // GET /api/concluidas?casa_id=X → lista ids de tarefas concluídas nesta casa pelo usuário
  if (req.method === 'GET') {
    const { casa_id } = req.query;
    if (!casa_id) return err(res, 'casa_id é obrigatório');

    const [rows] = await pool.query(
      `SELECT c.tarefa_id FROM concluidas c
       JOIN tarefas t ON c.tarefa_id = t.id
       JOIN setores s ON t.setor_id = s.id
       WHERE s.casa_id = ? AND c.user_id = ?`,
      [casa_id, u.id]
    );
    return ok(res, { concluidas: rows.map(r => r.tarefa_id) });
  }

  // POST /api/concluidas { tarefa_id } → toggle (marca ou desmarca)
  if (req.method === 'POST') {
    const { tarefa_id } = req.body || {};
    if (!tarefa_id) return err(res, 'tarefa_id é obrigatório');

    const [existing] = await pool.query(
      'SELECT id FROM concluidas WHERE tarefa_id = ? AND user_id = ?',
      [tarefa_id, u.id]
    );

    if (existing.length) {
      await pool.query('DELETE FROM concluidas WHERE tarefa_id = ? AND user_id = ?', [tarefa_id, u.id]);
      return ok(res, { concluida: false });
    } else {
      await pool.query('INSERT INTO concluidas (tarefa_id, user_id) VALUES (?,?)', [tarefa_id, u.id]);
      return ok(res, { concluida: true });
    }
  }

  // DELETE /api/concluidas?casa_id=X → reset todas as tarefas da casa
  if (req.method === 'DELETE') {
    const { casa_id } = req.query;
    if (!casa_id) return err(res, 'casa_id é obrigatório');

    await pool.query(
      `DELETE c FROM concluidas c
       JOIN tarefas t ON c.tarefa_id = t.id
       JOIN setores s ON t.setor_id = s.id
       WHERE s.casa_id = ? AND c.user_id = ?`,
      [casa_id, u.id]
    );
    return ok(res, { reset: true });
  }

  err(res, 'Método não permitido', 405);
};
