import styles from "./Icon.module.css";

const ICONS = {
  /* ===== UI / navegação ===== */
  home: (
    <>
      <path d="M4 11.5 12 5l8 6.5" />
      <path d="M6 11v8h12v-8" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-3.6-3.6" />
    </>
  ),
  plus: <path d="M12 6v12M6 12h12" />,
  check: <path d="M5 12.5 10 17.5 19.5 6.5" />,
  close: <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />,
  chevronRight: <path d="M9.5 5.5 16 12l-6.5 6.5" />,
  chevronLeft: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  arrowRight: (
    <>
      <path d="M4 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  more: (
    <>
      <circle cx="6" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  settings: (
    <>
      <path d="M4 8h9M18 8h2" />
      <circle cx="15.5" cy="8" r="2.2" />
      <path d="M4 16h2M11 16h9" />
      <circle cx="8.5" cy="16" r="2.2" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.3a3.2 3.2 0 0 1 0 5.4" />
      <path d="M17.8 19a5.5 5.5 0 0 0-2.2-4.4" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="5" width="14" height="16" rx="2.5" />
      <rect x="9" y="3" width="6" height="3.4" rx="1.2" />
      <path d="M8.5 11.5h7M8.5 15.5h5" />
    </>
  ),
  upload: (
    <>
      <path d="M12 15V4.5" />
      <path d="M8 8.5l4-4 4 4" />
      <path d="M5 16v2.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V16" />
    </>
  ),
  chat: (
    <path d="M4.5 6.5A1.5 1.5 0 0 1 6 5h12a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 18 15H9l-4 3.5V15H6a1.5 1.5 0 0 1-1.5-1.5Z" />
  ),
  paperclip: (
    <path d="M19 10.5l-8.4 8.4a4 4 0 0 1-5.7-5.7l8.5-8.5a2.6 2.6 0 0 1 3.7 3.7l-8.4 8.4a1.2 1.2 0 0 1-1.7-1.7l7.7-7.7" />
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
      <path d="M12 18v3" />
    </>
  ),
  play: (
    <path fill="currentColor" stroke="none" d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11-6.86a1 1 0 0 0 0-1.7l-11-6.86A1 1 0 0 0 8 5.14z" />
  ),
  pause: (
    <>
      <rect x="7" y="5" width="3.4" height="14" rx="1.2" fill="currentColor" stroke="none" />
      <rect x="13.6" y="5" width="3.4" height="14" rx="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v10" />
      <path d="M8 11l4 4 4-4" />
      <path d="M5 19h14" />
    </>
  ),
  image: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M5 17l4.5-4.5 3 3 3.5-3.5 3 3" />
    </>
  ),
  fileDoc: (
    <>
      <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z" />
      <path d="M13 3v6h6" />
      <path d="M9 14h6M9 17h4" />
    </>
  ),
  zoomIn: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M11 8.2v5.6M8.2 11h5.6" />
      <path d="M20 20l-3.8-3.8" />
    </>
  ),
  zoomOut: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M8.2 11h5.6" />
      <path d="M20 20l-3.8-3.8" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.4 4.4l1.6 1.6M18 18l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.4 19.6l1.6-1.6M18 6l1.6-1.6" />
    </>
  ),
  bell: (
    <>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.6 5.5 1.6 5.5H4.9S6.5 14 6.5 10Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="3" />
      <path d="M4.2 7.5 12 13l7.8-5.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
      <path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c6 0 9.5 7 9.5 7a17.6 17.6 0 0 1-3.3 4.2" />
      <path d="M6.6 6.6A17.6 17.6 0 0 0 2.5 12S6 19 12 19a10.4 10.4 0 0 0 3-.4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4c2.4 2.2 2.4 13.8 0 16M12 4c-2.4 2.2-2.4 13.8 0 16" />
    </>
  ),
  moon: <path d="M20 13.6A7.5 7.5 0 1 1 10.4 4 6 6 0 0 0 20 13.6Z" />,
  pin: (
    <>
      <path d="M12 21s6.5-5.2 6.5-10.5A6.5 6.5 0 0 0 5.5 10.5C5.5 15.8 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M9.8 9.6a2.2 2.2 0 1 1 3 2.1c-.8.3-1.3.9-1.3 1.8" />
      <path d="M12 16.4h.01" />
    </>
  ),
  logout: (
    <>
      <path d="M15 4h2.5A1.5 1.5 0 0 1 19 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h9" />
    </>
  ),
  edit: (
    <>
      <path d="M4.5 19.5l1-3.6L15.6 5.8a1.8 1.8 0 0 1 2.6 0l0 0a1.8 1.8 0 0 1 0 2.6L8.1 18.5Z" />
      <path d="M14.5 6.9l2.6 2.6" />
    </>
  ),
  trash: (
    <>
      <path d="M5 7h14" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M6.7 7l.8 11A2 2 0 0 0 9.5 20h5a2 2 0 0 0 2-1.9L17.3 7" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="3" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="3.5" />
      <path d="M8.5 7 10 4.5h4L15.5 7" />
      <circle cx="12" cy="13.5" r="3.2" />
    </>
  ),
  star: (
    <path d="M12 4.5l2.2 4.6 5 .7-3.6 3.5.9 5L12 15.9 7.5 18.3l.9-5-3.6-3.5 5-.7Z" />
  ),
  heart: (
    <path d="M12 20.3C5.8 16.5 4 12.8 4 9.9 4 7.4 6 5.6 8.2 5.6c1.5 0 2.9.8 3.8 2 .9-1.2 2.3-2 3.8-2C18 5.6 20 7.4 20 9.9c0 2.9-1.8 6.6-8 10.4Z" />
  ),

  /* ===== Nutrição / saúde (on-brand) ===== */
  leaf: (
    <>
      <path d="M5 19c0-7.7 6-13 14-13 0 7.7-5.3 13-13 13a6 6 0 0 1-1 0Z" />
      <path d="M6 18C9 13.5 12.8 10 17 8" />
    </>
  ),
  apple: (
    <>
      <path d="M12 7.6C10.5 5.7 7.6 5.7 6.1 7.9c-1.6 2.4-.4 7.9 2.4 10.3 1.1.9 2.3.9 3.5.2 1.2.7 2.4.7 3.5-.2 2.8-2.4 4-7.9 2.4-10.3-1.5-2.2-4.4-2.2-5.9-.3Z" />
      <path d="M12 7.6c0-1.8 1.3-3.2 3.2-3.5" />
    </>
  ),
  water: <path d="M12 4s6 6.4 6 10.4a6 6 0 0 1-12 0C6 10.4 12 4 12 4Z" />,
  flame: (
    <path d="M12 3.2c2.4 3 5.4 5 5.4 8.8a5.4 5.4 0 0 1-10.8 0c0-1.5.6-2.6 1.4-3.5.6 1 1.5 1.4 2.5 1.4-.8-2.3 0-5 1.5-6.7Z" />
  ),
  activity: <path d="M3 12h3l2.2-4.4 3.4 9 2.2-5L17 12h4" />,
  utensils: (
    <>
      <path d="M7 3v8a2 2 0 0 0 4 0V3M9 11v10" />
      <path d="M16.5 3c-1.4 0-2.4 2-2.4 5s.9 4 2.4 4v9" />
    </>
  ),
  scale: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="4" />
      <path d="M8.5 9.8a3.5 3.5 0 0 1 7 0" />
      <path d="M12 16.3h.01" />
    </>
  ),
  cart: (
    <>
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
      <path d="M3 4h2l2.2 11.1a1.5 1.5 0 0 0 1.5 1.2h7.7a1.5 1.5 0 0 0 1.5-1.2L20 8H6" />
    </>
  ),
  chart: <path d="M5 20V11M10 20V5M15 20v-6M20 20H3.5" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  dumbbell: <path d="M5 9v6M8 7v10M16 7v10M19 9v6M8 12h8" />,
  pill: (
    <>
      <rect x="3.5" y="8.5" width="17" height="7" rx="3.5" />
      <path d="M12 8.7v6.6" />
    </>
  ),
  carrot: (
    <>
      <path d="M6 18.5 13.5 11" />
      <path d="M15 9.5 7 17.5a3.8 3.8 0 0 0 5.2-.4l3.8-3.8A3.8 3.8 0 0 0 15 9.5Z" />
      <path d="M15 9.5c.8-1 2.6-1.4 4-1-.4 1.4-.8 3.2-1.8 4" />
    </>
  ),
  swap: (
    <>
      <path d="m17 4 3 3-3 3" />
      <path d="M20 7H8" />
      <path d="m7 20-3-3 3-3" />
      <path d="M4 17h12" />
    </>
  )
};

export default function Icon({ name, size = 20, strokeWidth = 1.75, className = "", ...rest }) {
  const content = ICONS[name];
  if (!content) return null;

  const cls = [styles.icon, className].filter(Boolean).join(" ");

  return (
    <svg
      className={cls}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {content}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(ICONS);
