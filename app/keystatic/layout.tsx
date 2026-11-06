import { notFound } from 'next/navigation';
import KeystaticApp from './keystatic';

export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

// The admin only works locally (it writes files into this repo). On a deployed build it is a 404
// unless KEYSTATIC_ENABLE is set on purpose.
const enabled = process.env.NODE_ENV !== 'production' || !!process.env.KEYSTATIC_ENABLE;

export default function Layout() {
  if (!enabled) notFound();
  return <KeystaticApp />;
}
