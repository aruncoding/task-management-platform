import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

// access token lives in memory only (not localStorage) - refresh token is an httpOnly cookie
let accessToken = null

export function setAccessToken (token) {
  accessToken = token
}

export function getAccessToken () {
  return accessToken
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
})

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// if a request 401s, try refreshing the access token once and replay it
let refreshPromise = null

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response && error.response.status === 401 && !original._retry && !original.url.includes('/auth/')) {
      original._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
        }
        const res = await refreshPromise
        refreshPromise = null
        setAccessToken(res.data.accessToken)
        original.headers.Authorization = `Bearer ${res.data.accessToken}`
        return api(original)
      } catch (refreshErr) {
        refreshPromise = null
        setAccessToken(null)
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(refreshErr)
      }
    }
    return Promise.reject(error)
  }
)

export default api
