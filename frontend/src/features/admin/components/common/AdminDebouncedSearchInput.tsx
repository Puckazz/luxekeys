'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/shared/components/ui/input';

type AdminDebouncedSearchInputProps = {
  value: string;
  placeholder: string;
  onDebouncedChange: (value: string) => void;
  debounceMs?: number;
};

export function AdminDebouncedSearchInput({
  value,
  placeholder,
  onDebouncedChange,
  debounceMs = 350,
}: AdminDebouncedSearchInputProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    const debounceId = window.setTimeout(() => {
      if (draft !== value) {
        onDebouncedChange(draft);
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(debounceId);
    };
  }, [debounceMs, draft, onDebouncedChange, value]);

  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        className="h-11 pl-9"
      />
    </div>
  );
}
