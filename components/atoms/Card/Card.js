import styles from "./Card.module.css";

export default function Card({
  children,
  elevation = "md",
  interactive = false,
  padding = "lg",
  as: Tag = "div",
  className = "",
  ...rest
}) {
  const classNames = [
    styles.card,
    styles[`elevation_${elevation}`],
    styles[`padding_${padding}`],
    interactive ? styles.interactive : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classNames} {...rest}>
      {children}
    </Tag>
  );
}
