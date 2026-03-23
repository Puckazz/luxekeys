'use client';

import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Eye, EyeOff, LockKeyhole, Mail, Shield } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserIcon } from '@heroicons/react/24/outline';
import { useRegister } from '@/features/auth/hooks/auth.hooks';
import { AuthApiError, RegisterRequest } from '@/features/auth/types';
import { registerSchema } from '@/features/auth/schemas/auth.schema';

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema) as Resolver<RegisterRequest>,
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

  const { mutate: registerUser, isPending, error, data, reset } = useRegister();
  const [name, email, password, confirmpassword] = watch([
    'name',
    'email',
    'password',
    'confirmpassword',
  ]);
  const hasServerError = useRef(false);
  const serverFieldErrors =
    error instanceof AuthApiError ? error.fieldErrors : undefined;

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
      alert('Please accept the terms and conditions');
      return;
    }
    registerUser(formData);
  };

  return (
    <div className="bg-background dark:bg-background flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold">
            Create your account
          </h1>
          <p className="text-slate-400">
            Start your journey into the world of custom keyboards.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* General Error Message */}
          {!data?.success && error && (
            <div className="border-destructive/35 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
              {error.message}
            </div>
          )}

          {/* Success Message */}
          {data?.success && (
            <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {data.message}
              {data.user && <p className="mt-2">Welcome, {data.user.name}!</p>}
            </div>
          )}

          {/* Full Name Field */}
          <div className="space-y-2">
            <label className="text-foreground text-sm font-bold">
              Full name
            </label>
            <div className="relative mt-2">
              <UserIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Enter your full name"
                {...register('name')}
                className="bg-input/20 dark:bg-input/40 border-input pl-10"
                disabled={isPending}
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
                disabled={isPending}
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
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                disabled={isPending}
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
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                disabled={isPending}
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
              disabled={isPending}
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
          <Button
            type="submit"
            disabled={isPending || !policy}
            className="text-primary-foreground h-12 w-full text-base font-bold"
          >
            {isPending ? 'Creating account...' : 'Register account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative mt-8 mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="border-input w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm font-bold">
            <span className="bg-background dark:bg-background text-muted-foreground px-2">
              Or register with
            </span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-input bg-input/10 hover:bg-input/20 flex-1"
          >
            <svg className="h-5! w-5!" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              ></path>
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              ></path>
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              ></path>
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                fill="#EA4335"
              ></path>
            </svg>
            <span className="ml-2 hidden leading-0 font-bold sm:inline">
              Google
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-input bg-input/10 hover:bg-input/20 h-12 flex-1"
          >
            <svg
              className="h-5! w-5! text-[#1877F2]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="ml-2 hidden leading-0 font-bold sm:inline">
              Facebook
            </span>
          </Button>
        </div>

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
