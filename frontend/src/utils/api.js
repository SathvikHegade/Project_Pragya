const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('pragya_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Request failed')
  }
  return data
}

export const authAPI = {
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/api/auth/me'),
}

export const experimentsAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/api/experiments${qs ? '?' + qs : ''}`)
  },
  get: (id) => request(`/api/experiments/${id}`),
  start: (id) => request(`/api/experiments/${id}/start`, { method: 'POST', body: JSON.stringify({}) }),
  submit: (id, data) =>
    request(`/api/experiments/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  listObservations: (id) => request(`/api/experiments/${id}/observations`),
  addObservation: (id, text) =>
    request(`/api/experiments/${id}/observations`, { method: 'POST', body: JSON.stringify({ text }) }),
}

export const studentAPI = {
  progress: () => request('/api/student/progress'),
  quizzes: () => request('/api/student/quizzes'),
  submitQuiz: (data) =>
    request('/api/student/quiz/submit', { method: 'POST', body: JSON.stringify(data) }),
  profile: () => request('/api/student/profile'),
  updateProfile: (data) =>
    request('/api/student/profile', { method: 'PUT', body: JSON.stringify(data) }),
}

export const teacherAPI = {
  classOverview: () => request('/api/teacher/overview'),
  students: () => request('/api/teacher/students'),
  studentDetail: (id) => request(`/api/teacher/students/${id}`),
  heatmap: () => request('/api/teacher/heatmap'),
  alerts: () => request('/api/teacher/alerts'),
  weeklyReport: () => request('/api/teacher/report/weekly'),
  observations: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/api/teacher/observations${qs ? '?' + qs : ''}`)
  },
}

export const aiAPI = {
  getHint: (experimentId, context) =>
    request('/api/ai/hint', { method: 'POST', body: JSON.stringify({ experimentId, context }) }),
  analyzeResponse: (data) =>
    request('/api/ai/analyze', { method: 'POST', body: JSON.stringify(data) }),
  generateQuiz: (experimentId) =>
    request(`/api/ai/quiz/${experimentId}`, { method: 'POST' }),
}
