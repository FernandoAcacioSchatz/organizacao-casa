const bcrypt = require('bcryptjs');
const { getPool } = require('../../lib/db');
const { signToken } = require('../../lib/auth');
const { cors, ok, err, handleOptions } = require('../../lib/helpers');

module.exports = async function handler(req, res) {
  cors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return err(res, 'Método não permitido', 405);

  const { email, senha } = req.body || {};
  if (!email?.trim() || !senha?.trim())
    return err(res, 'email e senha são obrigatórios');

  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, nome, email, senha_hash FROM users WHERE email = ?',
    [email.trim().toLowerCase()]
  );
  if (!rows.length) return err(res, 'E-mail ou senha incorretos', 401);

  const u = rows[0];
  const match = await bcrypt.compare(senha, u.senha_hash);
  if (!match) return err(res, 'E-mail ou senha incorretos', 401);

  const user = { id: u.id, nome: u.nome, email: u.email };
  const token = signToken(user);
  ok(res, { token, user });
};
