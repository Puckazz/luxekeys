'use client';

import Link from 'next/link';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { PrimaryButton } from '@/shared/components/ui/primary-button';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ApiError, LoginRequest } from '@/features/auth/types';
import { useLogin } from '@/features/auth/hooks/auth.hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/features/auth/schemas/auth.schema';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { canAccessAdminPanel } from '@/lib/rbac';
import { useAuthStore } from '@/stores/auth/auth.store';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { mutate: login, isPending, error, reset } = useLogin();
  const setAuthSession = useAuthStore((state) => state.setSession);
  const isSubmitting = isPending || isRedirecting;
  const [email, password] = watch(['email', 'password']);
  const hasServerError = useRef(false);
  const serverFieldErrors =
    error instanceof ApiError ? error.fieldErrors : undefined;

  useEffect(() => {
    hasServerError.current = Boolean(error);
  }, [error]);

  useEffect(() => {
    if (hasServerError.current) {
      reset();
    }
  }, [email, password, reset]);

  const onSubmit = (formData: LoginRequest) => {
    login(formData, {
      onSuccess: (response) => {
        if (!response.user) {
          return;
        }

        setAuthSession(response);
        setIsRedirecting(true);
        const nextPath = searchParams.get('next') || searchParams.get('returnUrl');
        const canAccessAdmin = canAccessAdminPanel(response.user.role);
        const safeNextPath =
          nextPath?.startsWith('/') && !nextPath.startsWith('//')
            ? nextPath
            : undefined;
        const destination =
          safeNextPath?.startsWith('/admin') && !canAccessAdmin
            ? '/'
            : safeNextPath ?? (canAccessAdmin ? '/admin' : '/');

        router.replace(destination);
      },
    });
  };

  return (
    <div className="bg-background dark:bg-background flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Please enter your details to access your premium account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* General Error Message */}
          {error && (
            <div className="border-destructive/35 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
              {error.message}
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-foreground text-sm font-bold">
              Email or Phone
            </label>
            <div className="relative mt-2">
              <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                className="bg-input/20 dark:bg-input/40 border-input pl-10"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-destructive/90 text-xs font-medium">
                {errors.email.message}
              </p>
            )}
            {serverFieldErrors?.email && (
              <p className="text-destructive/90 text-xs font-medium">
                {serverFieldErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-foreground text-sm font-bold">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-primary hover:text-primary/80 text-xs font-bold transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <LockKeyhole className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="bg-input/20 dark:bg-input/40 border-input px-10"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive/90 text-xs font-medium">
                {errors.password.message}
              </p>
            )}
            {serverFieldErrors?.password && (
              <p className="text-destructive/90 text-xs font-medium">
                {serverFieldErrors.password}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(checked) => {
                if (checked !== 'indeterminate') {
                  setRememberMe(checked);
                }
              }}
              disabled={isSubmitting}
            />
            <label className="text-muted-foreground cursor-pointer text-sm">
              Remember me for 30 days
            </label>
          </div>

          {/* Sign In Button */}
          <PrimaryButton type="submit" isLoading={isSubmitting}>
            Sign in
          </PrimaryButton>
        </form>

        {/* Social login UI is hidden until Google/Facebook auth is implemented. */}

        {/* Sign Up Link */}
        <div className="text-muted-foreground mt-8 text-center text-sm font-medium">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-primary hover:text-primary/80 font-bold transition-colors"
          >
            Start your collection today
          </Link>
        </div>
      </div>
    </div>
  );
}
