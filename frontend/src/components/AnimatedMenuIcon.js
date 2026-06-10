export default function AnimatedMenuIcon({ open = false, className = "" }) {
  return (
    <span
      className={[
        "neu-menu-icon",
        open && "neu-menu-icon--open",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <span className="neu-menu-icon-bar" />
      <span className="neu-menu-icon-bar" />
      <span className="neu-menu-icon-bar" />
    </span>
  );
}
