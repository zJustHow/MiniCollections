import { useLocale } from "../LocaleContext";

export default function SearchResultsSummary({
  active,
  keyword,
  count,
  exact = true,
  loading,
}) {
  const { t } = useLocale();

  if (!active || !(keyword ?? "").trim()) {
    return null;
  }

  if (loading) {
    return null;
  }

  const template =
    exact !== false
      ? t("searchResultsSummary")
      : t("searchResultsSummaryPlus");

  const text = template
    .replace("{count}", String(count ?? 0))
    .replace("{query}", keyword.trim());

  return <div className="neu-search-summary">{text}</div>;
}
