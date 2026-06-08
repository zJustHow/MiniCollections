import { useLocale } from "../../LocaleContext";
import { NO_RESULTS_STYLE } from "../../utils/listPageUtils";

export default function NoSearchResults({ message }) {
  const { t } = useLocale();
  return <div style={NO_RESULTS_STYLE}>{message ?? t("noSearchResults")}</div>;
}
