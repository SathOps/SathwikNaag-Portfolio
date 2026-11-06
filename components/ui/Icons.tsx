import type { SVGProps } from 'react';
import { siLeetcode } from 'simple-icons';

// filled brand marks (from simple-icons)
const FILLED: Record<string, string> = { leetcode: siLeetcode.path };

type P = SVGProps<SVGSVGElement> & { name: string };

const paths: Record<string, React.ReactNode> = {
  pen: <path d="M3 21l3.5-1 11-11-2.5-2.5-11 11L3 21zM14.5 5.5l2.5 2.5 2-2a1.8 1.8 0 0 0-2.5-2.5l-2 2z" />,
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 1.5-2.2-.5-1.3.4-2.3 1.7-2.3H18a3 3 0 0 0 3-3c0-5.6-4-10.5-9-10.5z" />
      <circle cx="7.5" cy="11" r="1.2" />
      <circle cx="10" cy="7" r="1.2" />
      <circle cx="15" cy="7.5" r="1.2" />
    </>
  ),
  code: <path d="M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16" />,
  terminal: <path d="M4 6l6 6-6 6M12 18h8" />,
  brain: <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1zm6 0a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1V5a3 3 0 0 1 3-1z" />,
  music: (
    <>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  cricket: (
    <>
      <path d="M3.5 20.5l2 2 10.5-10.5-2-2zM14 10l4-6 2 2-6 4" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4h6v3H9zM8.5 12l2 2 4-4" />
    </>
  ),
  gamepad: (
    <>
      <path d="M6 8h12a4 4 0 0 1 4 4v2a3 3 0 0 1-5.4 1.8L15 14H9l-1.6 1.8A3 3 0 0 1 2 14v-2a4 4 0 0 1 4-4z" />
      <path d="M7 11v3M5.5 12.5h3" />
      <circle cx="16" cy="11.5" r=".8" />
      <circle cx="18" cy="13.5" r=".8" />
    </>
  ),
  crown: <path d="M3 18h18l-1.5-10-5 4L12 5l-2.5 7-5-4L3 18z" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" />
      <circle cx="17.5" cy="9" r="2.5" />
      <path d="M17 14c2.8.3 5 2.3 5 5" />
    </>
  ),
  chat: <path d="M4 5h16v11H9l-5 4V5z" />,
  camera: (
    <>
      <path d="M3 8h4l2-3h6l2 3h4v12H3z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  sparkle: <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z" />,
  trophy: <path d="M7 4h10v4a5 5 0 0 1-10 0V4zM7 6H3a4 4 0 0 0 4 4M17 6h4a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6" />,
  shirt: <path d="M8 3l-5 3 2 5 3-1v11h8V10l3 1 2-5-5-3a4 4 0 0 1-8 0z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />,
  download: <path d="M12 3v12M6 10l6 6 6-6M4 21h16" />,
  close: <path d="M5 5l14 14M19 5L5 19" />,
  play: <path d="M7 4l13 8-13 8z" />,
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.6z" />
      <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1.2-1.8-2-1-1 1c-1.2-.5-2.3-1.6-2.8-2.8l1-1-1-2L9 8.5z" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r=".8" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.5 10v7M7.5 7v.01M11.5 17v-4a2.5 2.5 0 0 1 5 0v4M11.5 10v7" />
    </>
  ),
  github: <path d="M9 19c-4 1.5-4-2-6-2.5m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />,
  gitlab: <path d="M12 21l9-7-3.5-11-2.5 7.5h-6L6.5 3 3 14z" />,
  behance: <path d="M3 6h6a3 3 0 0 1 0 6H3zM3 12h7a3 3 0 0 1 0 6H3zM14 13h7a3.5 3.5 0 0 0-7 0 3.5 3.5 0 0 0 6.5 2M15 7h5" />,
  dribbble: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 3.8c3 4 5 9 6 16.6M3 10.5c5 .5 10-.5 15-4M6 19c2-4 7-6.5 14.8-5" />
    </>
  ),
  x: <path d="M4 4l16 16M20 4L4 20" />,
  link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  chevronLeft: <path d="M15 5l-7 7 7 7" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  layers: <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5" />,
  desktop: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M9 20h6M12 16v4" />
    </>
  ),
  tablet: <rect x="5" y="3" width="14" height="18" rx="2" />,
  phone: <rect x="7" y="3" width="10" height="18" rx="2" />,
};

export function Icon({ name, strokeWidth = 1.8, ...rest }: P) {
  if (FILLED[name])
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
        <path d={FILLED[name]} />
      </svg>
    );
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name] ?? paths.sparkle}
    </svg>
  );
}
