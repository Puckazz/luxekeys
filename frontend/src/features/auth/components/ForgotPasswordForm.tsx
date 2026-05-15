'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
} from 'lucide-react';

import {
  useForgotPassword,
  useResetPassword,
} from '@/features/auth/hooks/auth.hooks';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordFormValues,
  type ResetPasswordFormValues,
} from '@/features/auth/schemas/auth.schema';
import { ApiError } from '@/features/auth/types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { PrimaryButton } from '@/shared/components/ui/primary-button';

type ForgotPasswordStep = 'email' | 'reset' | 'success';

const invalidResetCodeMessage = 'Invalid or expired reset code';

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [sentMessage, setSentMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const forgotPassword = useForgotPassword();
  const resetPassword = useResetPassword();

  const emailForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      password: '',
      confirmPassword: '',
    },
  });

  const isSendingCode = forgotPassword.isPending;
  const isResettingPassword = resetPassword.isPending;

  const onSubmitEmail = (values: ForgotPasswordFormValues) => {
    const nextEmail = values.email.trim().toLowerCase();

    forgotPassword.mutate(
      { email: nextEmail },
      {
        onSuccess: (response) => {
          setEmail(nextEmail);
          setSentMessage(response.message);
          setResetError('');
          resetForm.reset();
          setStep('reset');
        },
      }
    );
  };

  const onSubmitReset = (values: ResetPasswordFormValues) => {
    setResetError('');

    resetPassword.mutate(
      {
        email,
        code: values.code.trim(),
        password: values.password,
      },
      {
        onSuccess: () => {
          setStep('success');
        },
        onError: (error) => {
          if (error instanceof ApiError && error.statusCode === 401) {
            setResetError(invalidResetCodeMessage);
            return;
          }

          setResetError(error.message);
        },
      }
    );
  };

  const handleBackToEmail = () => {
    setResetError('');
    setStep('email');
  };

  if (step === 'success') {
    return (
      <div className="bg-background dark:bg-background flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="bg-primary/15 text-primary mb-5 flex size-12 items-center justify-center rounded-full">
              <CheckCircle2 className="size-6" />
            </div>
            <h1 className="text-foreground mb-2 text-3xl font-bold">
              Password reset successful
            </h1>
            <p className="text-muted-foreground">
              You can now sign in with your new password.
            </p>
          </div>

          <Button asChild className="h-12 w-full text-base font-bold">
            <Link href="/login">Back to login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background dark:bg-background flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Button
            variant="ghost"
            asChild
            className="text-muted-foreground hover:text-foreground mb-5 h-auto px-0"
          >
            <Link href="/login">
              <ArrowLeft className="size-4" />
              Back to login
            </Link>
          </Button>

          <h1 className="text-foreground mb-2 text-3xl font-bold">
            Reset your password
          </h1>
          <p className="text-muted-foreground">
            {step === 'email'
              ? 'Enter your email and we will send a verification code.'
              : `Enter the 6-digit code sent to ${email}.`}
          </p>
        </div>

        {step === 'email' ? (
          <form
            onSubmit={emailForm.handleSubmit(onSubmitEmail)}
            className="space-y-6"
          >
            {forgotPassword.error && (
              <div className="border-destructive/35 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
                {forgotPassword.error.message}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-foreground text-sm font-bold">
                Email
              </label>
              <div className="relative mt-2">
                <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...emailForm.register('email')}
                  className="bg-input/20 dark:bg-input/40 border-input pl-10"
                  disabled={isSendingCode}
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="text-destructive/90 text-xs font-medium">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <PrimaryButton type="submit" isLoading={isSendingCode}>
              Send reset code
            </PrimaryButton>
          </form>
        ) : (
          <form
            onSubmit={resetForm.handleSubmit(onSubmitReset)}
            className="space-y-6"
          >
            {sentMessage && (
              <div className="border-primary/35 bg-primary/10 text-primary rounded-md border p-3 text-sm">
                {sentMessage}
              </div>
            )}

            {resetError && (
              <div className="border-destructive/35 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
                {resetError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-foreground text-sm font-bold">
                Verification code
              </label>
              <div className="relative mt-2">
                <KeyRound className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  maxLength={6}
                  {...resetForm.register('code')}
                  className="bg-input/20 dark:bg-input/40 border-input pl-10"
                  disabled={isResettingPassword}
                />
              </div>
              {resetForm.formState.errors.code && (
                <p className="text-destructive/90 text-xs font-medium">
                  {resetForm.formState.errors.code.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-foreground text-sm font-bold">
                New password
              </label>
              <div className="relative mt-2">
                <LockKeyhole className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...resetForm.register('password')}
                  className="bg-input/20 dark:bg-input/40 border-input px-10"
                  disabled={isResettingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                  disabled={isResettingPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {resetForm.formState.errors.password && (
                <p className="text-destructive/90 text-xs font-medium">
                  {resetForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-foreground text-sm font-bold">
                Confirm password
              </label>
              <div className="relative mt-2">
                <LockKeyhole className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...resetForm.register('confirmPassword')}
                  className="bg-input/20 dark:bg-input/40 border-input px-10"
                  disabled={isResettingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                  disabled={isResettingPassword}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {resetForm.formState.errors.confirmPassword && (
                <p className="text-destructive/90 text-xs font-medium">
                  {resetForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <PrimaryButton type="submit" isLoading={isResettingPassword}>
              Reset password
            </PrimaryButton>

            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground w-full"
              disabled={isResettingPassword}
              onClick={handleBackToEmail}
            >
              Use a different email
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
