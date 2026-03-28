import axios from 'axios'

const http = axios.create({ baseURL: '/api' })

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('df_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

http.interceptors.response.use(
  r => r.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('df_token')
      localStorage.removeItem('df_user')
      window.location.href = '/login'
    }
    return Promise.reject(err.response?.data || err)
  }
)

export const api = {
  get:    (url, params) => http.get(url, { params }),
  post:   (url, data)   => http.post(url, data),
  put:    (url, data)   => http.put(url, data),
  patch:  (url, data)   => http.patch(url, data),
  delete: (url)         => http.delete(url),
}
