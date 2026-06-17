export const ADMIN_EMAILS = [
  'admin@mentoria.kz',
  'admin2@gmail.com',
  'admin3@gmail.com',
  'admin4@gmail.com',
  'admin5@gmail.com',
]

export function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim())
}
