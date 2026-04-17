const bcrypt = require('bcryptjs');
const { getPool } = require('../../lib/db');
const { signToken } = require('../../lib/auth');
const { cors, ok, err, handleOptions } = require('../../lib/helpers');

module.exports = async function handler(req, res) {
  cors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return err(res, 'Método não permitido', 405);

  const { nome, email, senha } = req.body || {};
  if (!nome?.trim() || !email?.trim() || !senha?.trim())
    return err(res, 'nome, email e senha são obrigatórios');

  const pool = getPool();
  const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  if (rows.length) return err(res, 'E-mail já cadastrado', 409);

  const hash = await bcrypt.hash(senha, 10);
  const [result] = await pool.query(
    'INSERT INTO users (nome, email, senha_hash) VALUES (?, ?, ?)',
    [nome.trim(), email.trim().toLowerCase(), hash]
  );

  const user = { id: result.insertId, nome: nome.trim(), email: email.trim().toLowerCase() };
  const token = signToken(user);
  ok(res, { token, user }, 201);
};
