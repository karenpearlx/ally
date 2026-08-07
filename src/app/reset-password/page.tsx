import Link from 'next/link';
import AuthShell from '@/components/AuthShell';
import { ResetPasswordForm } from '@/components/PasswordResetForms';

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Almost there"
      title="Choose a new password"
      sub="Use at least eight characters and make it different from passwords you use elsewhere."
      aside={{
        heading: 'Keep this one yours',
        points: [
          'A longer passphrase is easier to remember and harder to guess',
          'Never share a reset link, even with someone claiming to be support',
          'Verse will never ask you to send your password by email',
        ],
      }}
      footer={
        <>
          Need a fresh link?{' '}
          <Link href="/forgot-password" className="tap font-medium underline underline-offset-4" style={{ color: 'var(--color-accent)' }}>
            Request another
          </Link>
        </>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
