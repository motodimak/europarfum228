export const ADMIN_CODE = 'ADMIN228SS'

export const normalizeAdminCode = (value = '') => String(value).trim().toUpperCase()

export const isAdminCode = (value = '') => normalizeAdminCode(value) === ADMIN_CODE

export const createAdminSession = () => ({
  role: 'admin',
  code: ADMIN_CODE,
  label: 'Администратор',
  createdAt: new Date().toISOString(),
})

export const readAdminSession = () => {
  try {
    const raw = localStorage.getItem('adminSession')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return isAdminCode(parsed?.code) ? parsed : null
  } catch (error) {
    return null
  }
}