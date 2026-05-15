'use client';

import Link from 'next/link';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { PrimaryButton } from '@/shared/components/ui/primary-button';
import { Eye, EyeOff, LockKeyhole, Mail, Shield, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister } from '@/features/auth/hooks/auth.hooks';
import { ApiError, RegisterRequest } from '@/features/auth/types';
import { registerSchema } from '@/features/auth/schemas/auth.schema';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth/auth.store';

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmpassword: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [policy, setPolicy] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { mutate: registerUser, isPending, error, reset } = useRegister();
  const setAuthSession = useAuthStore((state) => state.setSession);
  const isSubmitting = isPending || isRedirecting;
  const [name, email, password, confirmpassword] = watch([
    'name',
    'email',
    'password',
    'confirmpassword',
  ]);
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
  }, [name, email, password, confirmpassword, reset]);

  const onSubmit = (formData: RegisterRequest) => {
    if (!policy) {
      return;
    }
    registerUser(formData, {
      onSuccess: (response) => {
        if (!response.user) {
          return;
        }

        setAuthSession(response);
        setIsRedirecting(true);
        router.replace('/');
      },
    });
  };

  return (
    <div className="bg-background dark:bg-background flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold">
            Create your account
          </h1>
          <p className="text-muted-foreground">
            Start your journey into the world of custom keyboards.
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

          {/* Full Name Field */}
          <div className="space-y-2">
            <label className="text-foreground text-sm font-bold">
              Full name
            </label>
            <div className="relative mt-2">
              <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Enter your full name"
                {...register('name')}
                className="bg-input/20 dark:bg-input/40 border-input pl-10"
                disabled={isSubmitting}
              />
            </div>
            {errors.name && (
              <p className="text-destructive/90 text-xs font-medium">
                {errors.name.message}
              </p>
            )}
            {serverFieldErrors?.name && (
              <p className="text-destructive/90 text-xs font-medium">
                {serverFieldErrors.name}
              </p>
            )}
          </div>

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

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-foreground text-sm font-bold">
                Confirm Password
              </label>
            </div>
            <div className="relative">
              <Shield className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmpassword')}
                className="bg-input/20 dark:bg-input/40 border-input px-10"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmpassword && (
              <p className="text-destructive/90 text-xs font-medium">
                {errors.confirmpassword.message}
              </p>
            )}
            {serverFieldErrors?.confirmpassword && (
              <p className="text-destructive/90 text-xs font-medium">
                {serverFieldErrors.confirmpassword}
              </p>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start gap-2">
            <Checkbox
              checked={policy}
              onCheckedChange={(checked) => {
                if (checked !== 'indeterminate') {
                  setPolicy(checked);
                }
              }}
              disabled={isSubmitting}
              id="policy"
            />
            <label
              htmlFor="policy"
              className="text-muted-foreground cursor-pointer text-sm"
            >
              I agree to the{' '}
              <Link
                href="/terms"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Term of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Sign Up Button */}
          <PrimaryButton
            type="submit"
            disabled={!policy}
            isLoading={isSubmitting}
          >
            Register account
          </PrimaryButton>
        </form>

        {/* Social registration UI is hidden until Google/Facebook auth is implemented. */}

        {/* Sign Up Link */}
        <div className="text-muted-foreground mt-8 text-center text-sm">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 font-bold transition-colors"
          >
            Login in here
          </Link>
        </div>
      </div>
    </div>
  );
}
