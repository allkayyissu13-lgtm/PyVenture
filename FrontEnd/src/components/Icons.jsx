/* ---------- Shared Icon Library ---------- */

/* Base SVG wrapper (stroke-style icons) */
export const Svg = ({ children, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

/* ---------- Auth Icons ---------- */
export const UserIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
  </Svg>
);

export const MailIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </Svg>
);

export const KeyIcon = (p) => (
  <Svg {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="M11 12l9-9M16 7l3 3M14 9l2 2" />
  </Svg>
);

export const EyeIcon = (p) => (
  <Svg {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const EyeOffIcon = (p) => (
  <Svg {...p}>
    <path d="M3 3l18 18" />
    <path d="M10.6 6.1A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 7.6A17 17 0 0 0 2 12s3.5 6 10 6a10 10 0 0 0 4.2-.9" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Svg>
);

export const GithubIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.3 2.8.1 3.2.8.8 1.3 1.9 1.3 3.1 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
  </svg>
);

export const GoogleIcon = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.29 14.29A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.57.38-2.29V6.61H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l4.01-3.1z" />
    <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75z" />
  </svg>
);

/* ---------- Page Icons (used in dashboard, learning, module, code) ---------- */

/* Icon path registry for dashboardpage & codepage */
const ICON_PATHS = {
  flag: <><path d="M5 21V4" /><path d="M5 4h12l-2 4 2 4H5" /></>,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  flame: <path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
  trophy: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" /></>,
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 5l-4 14" />,
  star: <path d="M12 2l2.6 6.4L21 9l-5 4.4L17.5 20 12 16.6 6.5 20 8 13.4 3 9l6.4-.6z" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  play: <path d="M7 4l13 8-13 8z" />,
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  bulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z" />,
  file: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5" /></>,
  refresh: <path d="M20 11a8 8 0 1 0-2 6M20 5v6h-6" />,
  terminal: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 10l3 2-3 2M13 15h4" /></>,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />,
  list: <path d="M4 6h16M4 12h16M4 18h10" />,
  input: <path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />,
  output: <path d="M14 7l5 5-5 5M19 12H7M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />,
};

/**
 * Generic Icon component — replaces `Icon` in dashboardpage and `Ic` in codepage.
 * Usage: <Icon name="bolt" size={14} solid />
 */
export const Icon = ({ name, size = 14, solid = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={solid ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {ICON_PATHS[name]}
  </svg>
);

/* ---------- Learning / Module Icons ---------- */
export const DocIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
);

export const ShieldLockIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#fff" />
    <rect x="8.5" y="10.5" width="7" height="5.5" rx="1" fill="#283147" />
    <path d="M10 10.5V9a2 2 0 0 1 4 0v1.5" fill="none" stroke="#283147" strokeWidth="1.6" />
  </svg>
);

export const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6 3l15 9-15 9z" />
  </svg>
);

export const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
