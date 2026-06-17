export const ADMIN_EMAILS = [
  'admin@mentoria.kz',
  'твой_email@gmail.com',
]

export function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim())
}
