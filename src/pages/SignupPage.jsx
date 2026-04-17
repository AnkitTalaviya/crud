import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/Field';
import { AuthFormShell } from '@/components/auth/AuthFormShell';
import { AuthLayout } from '@/layouts/AuthLayout';
import { signupSchema } from '@/utils/schemas';
import { signupWithEmail } from '@/services/auth.service';
import { getFriendlyAuthError } from '@/utils/errors';

export function SignupPage() {
  const navigate = useNavigate();
  const [setupIssue, setSetupIssue] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      setSetupIssue('');
      await signupWithEmail(values);
      toast.success('Account created');
      navigate('/app/dashboard', { replace: true });
    } catch (error) {
      if (
        error?.code === 'auth/configuration-not-found' ||
        error?.code === 'auth/operation-not-allowed' ||
        error?.code === 'auth/invalid-api-key' ||
        error?.code === 'auth/app-not-authorized'
      ) {
        setSetupIssue(
          'Check Firebase Console > Authentication > Sign-in method and make sure Email/Password is enabled. If it already is, re-copy the Firebase web app config into .env and restart the dev server.',
        );
      }
      toast.error(getFriendlyAuthError(error));
    }
  };

  return (
    <AuthLayout>
      <AuthFormShell
        eyebrow="Get started"
        title="Create your account"
        description="Set up secure access to your inventory dashboard."
        footer={
          <>
            Already have an account?{' '}
            <Link className="font-semibold text-sky-600 transition hover:text-sky-500 dark:text-sky-300" to="/login">
              Log in
            </Link>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <TextInput label="Full name" placeholder="Anika Patel" error={errors.fullName?.message} {...register('fullName')} />
          <TextInput label="Email address" type="email" placeholder="ops@company.com" error={errors.email?.message} {...register('email')} />
          <TextInput label="Password" type="password" placeholder="Create a secure password" error={errors.password?.message} {...register('password')} />
          {setupIssue && (
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-700 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{setupIssue}</p>
              </div>
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
            Create account
          </Button>
        </form>
      </AuthFormShell>
    </AuthLayout>
  );
}
