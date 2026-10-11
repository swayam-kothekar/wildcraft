const RAW_BASE = import.meta.env.VITE_API_BASE_URL || ''
export const API_BASE = RAW_BASE.replace(/\/+$/, '')

export const apiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${cleanPath}`
}
