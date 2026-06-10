import SiteLogo from "./SiteLogo";

export default function SplashLoader() {
  return (
    <div className="neu-splash-loader" aria-busy="true">
      <div className="neu-splash-loader-brand">
        <SiteLogo priority />
      </div>
      <div className="neu-splash-loader-progress" aria-hidden="true">
        <span className="neu-splash-loader-progress-bar" />
      </div>
    </div>
  );
}
