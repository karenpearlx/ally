import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { getAdminIdentity } from '@/lib/admin/auth';

/**
 * Server-side gate. Nothing about the dashboard renders, and no admin data is
 * fetched, until Supabase confirms the session and the email is on the
 * allowlist. The client never gets to decide this.
 */
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const admin = await getAdminIdentity();
  if (!admin) redirect('/admin/login');

  return <AdminDashboard email={admin.email} lastSignInAt={admin.lastSignInAt} />;
}
