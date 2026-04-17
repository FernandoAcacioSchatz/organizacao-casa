const BASE = '/api';

function getToken() {
  return localStorage.getItem('casa_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login:    (body) => request('/auth/login',    { method: 'POST', body }),
  me:       ()     => request('/auth/me'),

  // Casas
  getCasas:    ()         => request('/casas'),
  createCasa:  (body)     => request('/casas',    { method: 'POST', body }),
  updateCasa:  (id, body) => request(`/casas/${id}`, { method: 'PUT',  body }),
  deleteCasa:  (id)       => request(`/casas/${id}`, { method: 'DELETE' }),

  // Setores
  getSetores:   (casaId)     => request(`/setores?casa_id=${casaId}`),
  createSetor:  (body)       => request('/setores',      { method: 'POST',   body }),
  updateSetor:  (id, body)   => request(`/setores/${id}`,{ method: 'PUT',    body }),
  deleteSetor:  (id)         => request(`/setores/${id}`,{ method: 'DELETE' }),

  // Intervalos
  getIntervalos:   (casaId)   => request(`/intervalos?casa_id=${casaId}`),
  createIntervalo: (body)     => request('/intervalos',       { method: 'POST',   body }),
  updateIntervalo: (id, body) => request(`/intervalos/${id}`, { method: 'PUT',    body }),
  deleteIntervalo: (id)       => request(`/intervalos/${id}`, { method: 'DELETE' }),

  // Tarefas
  getTarefas:   (casaId)   => request(`/tarefas?casa_id=${casaId}`),
  createTarefa: (body)     => request('/tarefas',       { method: 'POST',   body }),
  updateTarefa: (id, body) => request(`/tarefas/${id}`, { method: 'PUT',    body }),
  deleteTarefa: (id)       => request(`/tarefas/${id}`, { method: 'DELETE' }),

  // Concluidas
  getConcluidas:  (casaId)   => request(`/concluidas?casa_id=${casaId}`),
  toggleConcluida:(body)     => request('/concluidas',            { method: 'POST',   body }),
  resetConcluidas:(casaId)   => request(`/concluidas?casa_id=${casaId}`, { method: 'DELETE' }),
};
