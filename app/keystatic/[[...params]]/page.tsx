import { notFound } from 'next/navigation';

// The admin only works locally (it writes files into this repo).
export default function Page() {
  if (process.env.NODE_ENV === 'production' && !process.env.KEYSTATIC_ENABLE) notFound();
  return null;
}
