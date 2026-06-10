import { useId } from "react";

export default function SiteLogoIcon({ className = "" }) {
  const uid = useId().replace(/:/g, "");
  const insetId = `site-logo-inset-${uid}`;
  const accentId = `site-logo-inset-accent-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <filter
          id={insetId}
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
          <feOffset dx="-2" dy="-2" in="SourceAlpha" result="sd-off" />
          <feGaussianBlur in="sd-off" stdDeviation="2.5" result="sd-blur" />
          <feComposite in="sd-blur" in2="SourceAlpha" operator="in" result="sd-mask" />
          <feFlood floodColor="#b8b9be" result="sd-color" />
          <feComposite in="sd-color" in2="sd-mask" operator="in" result="sd-layer" />
          <feOffset dx="3" dy="3" in="SourceAlpha" result="sl-off" />
          <feGaussianBlur in="sl-off" stdDeviation="3.5" result="sl-blur" />
          <feComposite in="sl-blur" in2="SourceAlpha" operator="in" result="sl-mask" />
          <feFlood floodColor="#ffffff" result="sl-color" />
          <feComposite in="sl-color" in2="sl-mask" operator="in" result="sl-layer" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="sd-layer" />
            <feMergeNode in="sl-layer" />
          </feMerge>
        </filter>
        <filter
          id={accentId}
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
          <feOffset dx="-2" dy="-2" in="SourceAlpha" result="sd-off" />
          <feGaussianBlur in="sd-off" stdDeviation="2.5" result="sd-blur" />
          <feComposite in="sd-blur" in2="SourceAlpha" operator="in" result="sd-mask" />
          <feFlood floodColor="#3d78b8" result="sd-color" />
          <feComposite in="sd-color" in2="sd-mask" operator="in" result="sd-layer" />
          <feOffset dx="3" dy="3" in="SourceAlpha" result="sl-off" />
          <feGaussianBlur in="sl-off" stdDeviation="3.5" result="sl-blur" />
          <feComposite in="sl-blur" in2="SourceAlpha" operator="in" result="sl-mask" />
          <feFlood floodColor="#9ec5ea" result="sl-color" />
          <feComposite in="sl-color" in2="sl-mask" operator="in" result="sl-layer" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="sd-layer" />
            <feMergeNode in="sl-layer" />
          </feMerge>
        </filter>
      </defs>
      <rect x="16" y="16" width="24" height="96" fill="#fcfbf8" filter={`url(#${insetId})`} />
      <rect x="52" y="16" width="24" height="96" fill="#fcfbf8" filter={`url(#${insetId})`} />
      <rect x="88" y="16" width="24" height="96" fill="#6aa8dc" filter={`url(#${accentId})`} />
    </svg>
  );
}
