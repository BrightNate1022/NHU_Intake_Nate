'use client';

import type { FormStatus } from '@/types';

interface BadgeProps {
  status: FormStatus;
  className?: string;
}

const statusConfig: Record<FormStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'badge-draft' },
  in_progress: { label: 'In Progress', className: 'badge-in-progress' },
  complete: { label: 'Complete', className: 'badge-complete' },
  submitted: { label: 'Submitted', className: 'badge-submitted' },
};

export function Badge({ status, className = '' }: BadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`badge ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}

