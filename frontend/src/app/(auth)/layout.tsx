import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Home, Keyboard } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <main className="bg-background dark:bg-background relative flex min-h-screen">
      <Button
        variant="outline"
        size="lg"
        asChild
        className="bg-background/80 absolute top-4 right-4 z-20 backdrop-blur-sm sm:top-6 sm:right-6"
      >
        <Link href="/" aria-label="Back to home">
          <Home className="size-4" />
          Home
        </Link>
      </Button>

      {/* Left Section - Image & Branding */}
      <div className="relative hidden flex-col justify-end overflow-hidden bg-black/40 p-12 lg:flex lg:w-1/2">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1720639170730-1e79c4e8a64f?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Keyboard"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>

        {/* Logo */}
        <Link
          href="/"
          aria-label="Back to home"
          className="relative z-10 mb-4 flex w-fit items-center gap-2 transition-opacity hover:opacity-85"
        >
          <Keyboard className="text-primary h-7 w-7" />
          <span className="text-primary text-3xl leading-0 font-bold tracking-tight">
            LUXEKEYS
          </span>
        </Link>

        {/* Text Content */}
        <div className="relative z-10 w-2/3 text-white">
          <h2 className="mb-4 text-4xl font-bold">
            Elevate your typing experience.
          </h2>
          <p className="text-lg text-slate-300">
            Join a community of enthusiasts and discover our exclusive
            collection of bespoke mechanical masterpieces.
          </p>
        </div>
      </div>

      {/* Right Section */}
      {children}
    </main>
  );
}
