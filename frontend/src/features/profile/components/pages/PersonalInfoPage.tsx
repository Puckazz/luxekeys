'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  useProfileQuery,
  useUpdateProfileMutation,
} from '@/features/profile/hooks';
import { personalInfoSchema } from '@/features/profile/schemas/profile.schema';
import type { PersonalInfoFormValues } from '@/features/profile/types';
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

export default function PersonalInfoPage() {
  const profileQuery = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  const profile = profileQuery.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: profile?.fullName ?? '',
      email: profile?.email ?? '',
      phone: profile?.phone ?? '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values: PersonalInfoFormValues) => {
    await updateProfileMutation.mutateAsync(values);
  };

  return (
    <Card className="border-border/70 bg-card/35">
      <CardHeader>
        <CardTitle className="text-2xl">Personal Info</CardTitle>
        <CardDescription>
          Update your account profile information used across checkout and
          support.
        </CardDescription>
        {profile ? (
          <p className="text-muted-foreground text-xs">
            Member since {formatAccountDate(profile.joinedAt)}
          </p>
        ) : null}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {updateProfileMutation.error ? (
            <div className="border-destructive/35 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
              {updateProfileMutation.error.message}
            </div>
          ) : null}

          {updateProfileMutation.isSuccess ? (
            <div className="border-primary/35 bg-primary/10 text-primary rounded-lg border p-3 text-sm">
              Profile updated successfully.
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
              <Input {...register('email')} />
              {errors.email ? (
                <p className="text-destructive text-xs font-medium">
                  {errors.email.message}
                </p>
              ) : null}
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

          <Button
            type="submit"
            className="mt-2"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
