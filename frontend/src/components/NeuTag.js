export function buildNeuTagClassName({ color = "default", className = "" } = {}) {
  return [
    "neu-tag",
    color && color !== "default" && `neu-tag--${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function NeuTag({ color = "default", className = "", children, ...props }) {
  return (
    <span className={buildNeuTagClassName({ color, className })} {...props}>
      {children}
    </span>
  );
}
