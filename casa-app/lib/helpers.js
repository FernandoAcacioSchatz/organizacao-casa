function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function ok(res, data, status = 200) {
  res.status(status).json(data);
}

function err(res, msg, status = 400) {
  res.status(status).json({ error: msg });
}

function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    cors(res);
    res.status(204).end();
    return true;
  }
  return false;
}

module.exports = { cors, ok, err, handleOptions };
