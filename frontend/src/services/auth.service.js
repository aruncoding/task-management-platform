import api from '../api/client'

export async function registerRequest (name, email, password) {
  const res = await api.post('/auth/register', { name, email, password })
  return res.data
}

export async function loginRequest (email, password) {
  const res = await api.post('/auth/login', { email, password })
  return res.data
}

export async function refreshRequest () {
  const res = await api.post('/auth/refresh')
  return res.data
}

export async function meRequest () {
  const res = await api.get('/auth/me')
  return res.data
}

export async function logoutRequest () {
  await api.post('/auth/logout')
}
