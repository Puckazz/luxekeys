'use client';

import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
        <form className="space-y-6">
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
                className="bg-input/20 dark:bg-input/40 border-input pl-10"
              />
            </div>
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
                className="bg-input/20 dark:bg-input/40 border-input px-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
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
            />
            <label className="text-muted-foreground cursor-pointer text-sm">
              Remember me for 30 days
            </label>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            className="text-primary-foreground h-12 w-full text-base font-bold"
          >
            Sign in to Dashboard
          </Button>
        </form>

        {/* Divider */}
        <div className="relative mt-8 mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="border-input w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm font-bold">
            <span className="bg-background dark:bg-background text-muted-foreground px-2">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="flex gap-3">
          <Button
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
            <span className="ml-2 hidden font-bold sm:inline">Google</span>
          </Button>
          <Button
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
            <span className="ml-2 hidden font-bold sm:inline">Facebook</span>
          </Button>
        </div>

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
