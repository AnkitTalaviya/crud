import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { SelectField, TextInput } from '@/components/common/Field';
import { AuthFormShell } from '@/components/auth/AuthFormShell';
import { AuthLayout } from '@/layouts/AuthLayout';
import { signupSchema } from '@/utils/schemas';
import { signupWithEmail } from '@/services/auth.service';
import { getFriendlyAuthError } from '@/utils/errors';
import { ROLE_OPTIONS } from '@/utils/constants';
import { canSelfBootstrapWorkspace } from '@/utils/access';

export function SignupPage() {
  const navigate = useNavigate();
  const [setupIssue, setSetupIssue] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      requestedRole: 'viewer',
      workspaceId: '',
    },
  });
  const requestedRole = watch('requestedRole');
  const workspaceId = watch('workspaceId');

  const onSubmit = async (values) => {
    try {
      setSetupIssue('');
      const result = await signupWithEmail(values);
      toast.success(result.requiresApproval ? 'Account created and sent for approval' : 'Account created');
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
          <SelectField label="Requested role" error={errors.requestedRole?.message} {...register('requestedRole')}>
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <TextInput
            label="Workspace ID"
            description="Required when joining an existing team"
            placeholder="paste the workspace ID shared by your approver"
            error={errors.workspaceId?.message}
            {...register('workspaceId')}
          />
          <div className="rounded-2xl border border-[color:rgb(var(--border))] bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500 dark:bg-slate-900/60 dark:text-slate-300">
            {canSelfBootstrapWorkspace(requestedRole, workspaceId)
              ? 'Leave Workspace ID blank only when you are creating a brand-new workspace owner account.'
              : 'This signup will stay pending until the next level up approves it. Viewer requests can be approved by managers or admins. Manager and admin requests require admin approval.'}
          </div>
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
