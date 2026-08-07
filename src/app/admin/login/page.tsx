import { redirect } from 'next/navigation';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin/config';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const signedInAs = data.user?.email ?? null;

  if (signedInAs && isAdminEmail(signedInAs)) redirect('/admin');

  return <AdminLoginForm signedInAs={signedInAs} allowlistConfigured={Boolean(process.env.ADMIN_EMAILS?.trim())} />;
}
