import styles from "./FoodArt.module.css";

/* Ilustrações flat de alimentos (multi-cor). viewBox 0 0 64 64.
   Estilo amigável/arredondado seguindo a identidade de frutas. */
const ART = {
  strawberry: (
    <>
      <path fill="#ef5e54" d="M32 24c9-2.4 17.5 3.6 17.5 13C49.5 49 39 58 32 60c-7-2-17.5-11-17.5-23C14.5 27.6 23 21.6 32 24z" />
      <path fill="#5bb978" d="M32 13c2.2 3.2 5.8 5.2 10 5.2-2 3.8-6 6-10 6s-8-2.2-10-6c4.2 0 7.8-2 10-5.2z" />
      <path fill="#46a067" d="M32 13c0 4 0 8-0 11-2 0-6-2-8-5 4 0 6-2 8-6z" opacity="0.6" />
      <g fill="#f7d24a">
        <ellipse cx="25" cy="37" rx="1.4" ry="2.1" />
        <ellipse cx="32" cy="34" rx="1.4" ry="2.1" />
        <ellipse cx="39" cy="37" rx="1.4" ry="2.1" />
        <ellipse cx="28" cy="44" rx="1.4" ry="2.1" />
        <ellipse cx="36" cy="44" rx="1.4" ry="2.1" />
        <ellipse cx="32" cy="51" rx="1.4" ry="2.1" />
      </g>
    </>
  ),
  apple: (
    <>
      <rect x="30.5" y="14" width="3" height="9" rx="1.5" fill="#8a5a3b" />
      <path fill="#6fbf73" d="M41 20c-3.2 0-6 2-7 5 3.2 0 6-2 7-5z" />
      <path fill="#ef5e54" d="M22 30c0-6.5 6-10 10-7 4-3 10 .5 10 7 0 12-6 22-10 24-4-2-10-12-10-24z" />
      <circle cx="27" cy="33" r="3.6" fill="#ffffff" opacity="0.2" />
    </>
  ),
  orange: (
    <>
      <circle cx="32" cy="36" r="18" fill="#f59740" />
      <path fill="#6fbf73" d="M37 18c-2.4 1-4 3.2-4 5.6 2.4 0 4.6-1.8 5.6-4z" />
      <circle cx="26" cy="31" r="4" fill="#ffffff" opacity="0.2" />
    </>
  ),
  lemon: (
    <>
      <g transform="rotate(-18 32 35)">
        <ellipse cx="32" cy="35" rx="19" ry="14" fill="#f4cb4d" />
        <ellipse cx="26" cy="31" rx="4" ry="3" fill="#ffffff" opacity="0.22" />
      </g>
      <path fill="#6fbf73" d="M44 18c-2.4 1-4 3.2-4 5.6 2.4 0 4.6-1.8 5.6-4z" />
    </>
  ),
  grapes: (
    <>
      <path fill="#6fbf73" d="M33 13c3-2 7-2 9 0-2 1-4 3-4 6-2-2-4-4-5-6z" />
      <rect x="31" y="13" width="2.4" height="7" rx="1.2" fill="#7a5a2e" />
      <g fill="#8f7fd6">
        <circle cx="32" cy="26" r="6" />
        <circle cx="24" cy="31" r="6" />
        <circle cx="40" cy="31" r="6" />
        <circle cx="32" cy="35" r="6" />
        <circle cx="27" cy="43" r="6" />
        <circle cx="37" cy="43" r="6" />
        <circle cx="32" cy="51" r="6" />
      </g>
      <circle cx="30" cy="24" r="1.8" fill="#ffffff" opacity="0.25" />
    </>
  ),
  banana: (
    <>
      <path fill="#f4cb4d" d="M13 22c1 16 14 28 31 25-2-2-5-3.4-8.4-3.4C22 41 17 29 19.5 19.5 16 19.5 13 19.6 13 22z" />
      <path fill="#e3b53e" d="M19.5 19.5C17 29 22 41 35.6 43.6c1 .2 2 .3 3 .3C26 42 19 31 21 20c-.6-.3-1-.4-1.5-.5z" />
      <path fill="#7a5a2e" d="M12.4 21c.3-1.6 1.4-2.2 2.6-1.8-.4 1-1.4 1.6-2.6 1.8z" />
    </>
  ),
  broccoli: (
    <>
      <path fill="#7bb46a" d="M26 34h12v14c0 3-2.6 5-6 5s-6-2-6-5z" />
      <g fill="#5bb978">
        <circle cx="22" cy="26" r="8" />
        <circle cx="42" cy="26" r="8" />
        <circle cx="32" cy="20" r="9" />
        <circle cx="29" cy="30" r="8" />
        <circle cx="36" cy="30" r="8" />
      </g>
      <g fill="#4a9b63" opacity="0.5">
        <circle cx="24" cy="24" r="2" />
        <circle cx="40" cy="28" r="2" />
        <circle cx="33" cy="19" r="2" />
      </g>
    </>
  ),
  avocado: (
    <>
      <path fill="#6fae5a" d="M32 14c8 0 14 8 14 18 0 16-8 22-14 22s-14-6-14-22c0-10 6-18 14-18z" />
      <path fill="#cfe3a5" d="M32 24c5 0 9 5 9 13s-4 13-9 13-9-5-9-13 4-13 9-13z" />
      <circle cx="32" cy="38" r="6" fill="#8a5a3b" />
    </>
  ),
  watermelon: (
    <>
      <path fill="#4aa06a" d="M10 24c0 16 18 28 44 28V24z" />
      <path fill="#ef5e54" d="M16 27c0 12 14 22 38 22V27z" />
      <g fill="#3a3a3a">
        <ellipse cx="30" cy="38" rx="1.4" ry="2.2" transform="rotate(20 30 38)" />
        <ellipse cx="38" cy="34" rx="1.4" ry="2.2" transform="rotate(20 38 34)" />
        <ellipse cx="44" cy="42" rx="1.4" ry="2.2" transform="rotate(20 44 42)" />
      </g>
    </>
  )
};

export default function FoodArt({ name, size = 48, className = "", ...rest }) {
  const content = ART[name];
  if (!content) return null;
  const cls = [styles.art, className].filter(Boolean).join(" ");
  return (
    <svg className={cls} width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" {...rest}>
      {content}
    </svg>
  );
}

export const FOOD_ART_NAMES = Object.keys(ART);
