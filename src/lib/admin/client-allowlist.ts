/**
 * Client-side hint for showing Admin in menus. The real gate is still
 * server-side (`ADMIN_EMAILS` + `admin_users`) — this only decides whether
 * the link is worth rendering for a signed-in user.
 */
const CLIENT_ADMIN_EMAILS = new Set([
  'kpearl099@gmail.com',
  'karenpearlxz@gmail.com',
]);

export function isClientAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return CLIENT_ADMIN_EMAILS.has(email.trim().toLowerCase());
}
