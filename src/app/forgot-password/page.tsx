import Link from 'next/link';
import AuthShell from '@/components/AuthShell';
import { ForgotPasswordForm } from '@/components/PasswordResetForms';

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      sub="Enter the email you used for Verse. We'll send you a secure reset link."
      aside={{
        heading: 'A quick security note',
        points: [
          "We won't reveal whether an email has an Verse account",
          'Reset links expire and can only be used to update your own account',
          'You can request another link if the first one expires',
        ],
      }}
      footer={
        <>
          Remembered it?{' '}
          <Link href="/login" className="tap font-medium underline underline-offset-4" style={{ color: 'var(--color-accent)' }}>
            Back to sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
