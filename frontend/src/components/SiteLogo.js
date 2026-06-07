export default function SiteLogo() {
  return (
    <span className="header-logo-wrap">
      <img
        src="/icon.svg"
        alt=""
        className="header-logo-icon"
        width={28}
        height={28}
        decoding="async"
      />
      <span className="header-logo">
        Mini <span className="header-logo-accent">Collections</span>
      </span>
    </span>
  );
}
