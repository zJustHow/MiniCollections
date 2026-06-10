import NeuButton from "./NeuButton";
import { useLocale } from "../LocaleContext";

export default function ListLoadError({ message, onRetry, className = "" }) {
  const { t } = useLocale();

  return (
    <div className={`neu-no-data ${className}`.trim()} role="alert">
      <p className="neu-no-data-text">{message}</p>
      {onRetry ? (
        <NeuButton type="primary" onClick={onRetry}>
          {t("retry")}
        </NeuButton>
      ) : null}
    </div>
  );
}
