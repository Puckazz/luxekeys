'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { personalInfoSchema } from '@/features/profile/schemas/profile.schema';
import type { PersonalInfoFormValues, ProfileUser } from '@/features/profile/types';
import { formatAccountDate } from '@/features/profile/utils/profile.utils';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';

type ProfilePersonalInfoCardProps = {
  profile?: ProfileUser;
  title?: string;
  description: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  isSuccess?: boolean;
  errorMessage?: string;
  successMessage?: string;
  onSubmit: (values: PersonalInfoFormValues) => Promise<void> | void;
};

export function ProfilePersonalInfoCard({
  profile,
  title = 'Personal Info',
  description,
  submitLabel = 'Save changes',
  isSubmitting = false,
  isSuccess = false,
  errorMessage,
  successMessage = 'Profile updated successfully.',
  onSubmit,
}: ProfilePersonalInfoCardProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: profile?.fullName ?? '',
      phone: profile?.phone ?? '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName,
        phone: profile.phone ?? '',
      });
    }
  }, [profile, reset]);

  return (
    <Card className="border-border/70 bg-card/35">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {profile ? (
          <p className="text-muted-foreground text-xs">
            Member since {formatAccountDate(profile.joinedAt)}
          </p>
        ) : null}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit((values) => onSubmit(values))} className="space-y-4">
          {errorMessage ? (
            <div className="border-destructive/35 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
              {errorMessage}
            </div>
          ) : null}

          {isSuccess ? (
            <div className="border-primary/35 bg-primary/10 text-primary rounded-lg border p-3 text-sm">
              {successMessage}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-foreground text-sm font-semibold">
              Full Name
            </label>
            <Input {...register('fullName')} />
            {errors.fullName ? (
              <p className="text-destructive text-xs font-medium">
                {errors.fullName.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-foreground text-sm font-semibold">
                Email
              </label>
              <Input value={profile?.email ?? ''} readOnly disabled />
            </div>

            <div className="space-y-2">
              <label className="text-foreground text-sm font-semibold">
                Phone
              </label>
              <Input {...register('phone')} />
              {errors.phone ? (
                <p className="text-destructive text-xs font-medium">
                  {errors.phone.message}
                </p>
              ) : null}
            </div>
          </div>

          <Button type="submit" className="mt-2" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
