import SiteLogoIcon from "./SiteLogoIcon";
import { useLocale } from "../LocaleContext";

export default function NoDataPlaceholder({ className = "" }) {
  const { t } = useLocale();

  return (
    <div className={`neu-no-data ${className}`.trim()} role="status">
      <SiteLogoIcon className="neu-no-data-icon" aria-hidden="true" />
      <p className="neu-no-data-text">{t("noData")}</p>
    </div>
  );
}
