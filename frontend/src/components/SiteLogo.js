import SiteLogoIcon from "./SiteLogoIcon";

export default function SiteLogo() {
  return (
    <span className="header-logo-wrap">
      <SiteLogoIcon className="header-logo-icon" />
      <span className="header-logo">
        Mini <span className="header-logo-accent">Collections</span>
      </span>
    </span>
  );
}
