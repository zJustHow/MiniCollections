import { Spin } from "antd";
import { useLocale } from "../LocaleContext";

function formatFacetCount(count) {
  if (count >= 10000) return `${Math.round(count / 1000)}k`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

function FilterSection({ title, children }) {
  if (!children) return null;
  return (
    <div className="neu-filter-section">
      <div className="neu-filter-section-title">{title}</div>
      <div className="neu-filter-options-inset">{children}</div>
    </div>
  );
}

function FilterOption({ label, count, selected, onClick }) {
  return (
    <button
      type="button"
      className={`neu-filter-option${selected ? " selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="neu-filter-dot" aria-hidden />
      <span className="neu-filter-option-body">
        <span className="neu-filter-option-label">{label}</span>
        <span className="neu-filter-option-count">{formatFacetCount(count)}</span>
      </span>
    </button>
  );
}

export default function ObjectSearchFilterPanel({
  facets,
  loading,
  selectedCategoryIds,
  selectedBrandIds,
  selectedScaleIds,
  onToggleCategory,
  onToggleBrand,
  onToggleScale,
}) {
  const { t } = useLocale();

  if (!facets) {
    if (!loading) return null;
    return (
      <aside className="neu-filter-panel">
        <Spin spinning>
          <div className="neu-filter-panel-title">{t("searchFilters")}</div>
        </Spin>
      </aside>
    );
  }

  const hasCategories = facets.categories?.length > 0;
  const hasBrands = facets.brands?.length > 0;
  const hasScales = facets.scales?.length > 0;
  if (!hasCategories && !hasBrands && !hasScales) return null;

  return (
    <aside className="neu-filter-panel">
      <Spin spinning={loading}>
        <div className="neu-filter-panel-title">{t("searchFilters")}</div>

        {hasCategories && (
          <FilterSection title={t("category")}>
            {facets.categories.map((item) => (
              <FilterOption
                key={item.id}
                label={item.name}
                count={item.count}
                selected={selectedCategoryIds.includes(item.id)}
                onClick={() => onToggleCategory(item.id)}
              />
            ))}
          </FilterSection>
        )}

        {hasBrands && (
          <FilterSection title={t("brands")}>
            {facets.brands.map((item) => (
              <FilterOption
                key={item.id}
                label={item.name}
                count={item.count}
                selected={selectedBrandIds.includes(item.id)}
                onClick={() => onToggleBrand(item.id)}
              />
            ))}
          </FilterSection>
        )}

        {hasScales && (
          <FilterSection title={t("scale")}>
            {facets.scales.map((item) => (
              <FilterOption
                key={item.id}
                label={item.code}
                count={item.count}
                selected={selectedScaleIds.includes(item.id)}
                onClick={() => onToggleScale(item.id)}
              />
            ))}
          </FilterSection>
        )}
      </Spin>
    </aside>
  );
}
