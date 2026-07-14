const MANAGEMENT_ROLES = new Set(['ADMIN', 'MANAGER'])

export function canManageCalendar(user) {
  const roles = Array.isArray(user?.roles) ? user.roles : user?.role ? [user.role] : []
  return roles.some((role) => MANAGEMENT_ROLES.has(String(role).toUpperCase()))
}
