import styles from "./IconButton.module.css";

export default function IconButton({
  children,
  label,
  variant = "ghost",
  size = "md",
  disabled = false,
  type = "button",
  ...rest
}) {
  const className = [styles.iconButton, styles[`variant_${variant}`], styles[`size_${size}`]]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      aria-label={label}
      title={label}
      {...rest}
    >
      {children}
    </button>
  );
}
