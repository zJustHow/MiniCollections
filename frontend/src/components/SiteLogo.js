export default function SiteLogo({ priority = false }) {
  return (
    <span className="header-logo-wrap">
      <img
        src="/icon.svg"
        alt=""
        className="header-logo-icon"
        width={28}
        height={28}
        decoding={priority ? "sync" : "async"}
        fetchpriority={priority ? "high" : "auto"}
      />
      <span className="header-logo">
        Mini <span className="header-logo-accent">Collections</span>
      </span>
    </span>
  );
}
