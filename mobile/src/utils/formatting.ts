import type { VerificationStatus } from '@/types/marketplace';

const rand = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

export function formatRand(value: number) {
  return `R${rand.format(value)}`;
}

export function labelStatus(status: string) {
  return status.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

export function verificationTone(status: VerificationStatus | undefined) {
  switch (status ?? 'not_submitted') {
    case 'verified':
      return 'green';
    case 'pending':
      return 'amber';
    case 'rejected':
      return 'red';
    case 'more_info':
      return 'blue';
    case 'not_submitted':
      return 'gray';
  }
}
