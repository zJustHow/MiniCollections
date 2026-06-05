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
      className={`neu-pressable-btn neu-panel-tab-btn neu-filter-tab-option${selected ? " active" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="neu-filter-option-body">
        <span className="neu-filter-option-label">{label}</span>
        <span className="neu-filter-option-count">{formatFacetCount(count)}</span>
      </span>
    </button>
  );
}

function FilterContent({
  facets,
  loading,
  selectedCategoryIds,
  selectedBrandIds,
  selectedScaleIds,
  onToggleCategory,
  onToggleBrand,
  onToggleScale,
  showTitle,
}) {
  const { t } = useLocale();

  if (!facets) {
    if (!loading) return null;
    return showTitle ? (
      <div className="neu-filter-panel-title">{t("searchFilters")}</div>
    ) : null;
  }

  const hasCategories = facets.categories?.length > 0;
  const hasBrands = facets.brands?.length > 0;
  const hasScales = facets.scales?.length > 0;
  if (!hasCategories && !hasBrands && !hasScales) return null;

  return (
    <>
      {showTitle && (
        <div className="neu-filter-panel-title">{t("searchFilters")}</div>
      )}

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
    </>
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
  variant = "sidebar",
}) {
  const isDrawer = variant === "drawer";
  const Tag = isDrawer ? "div" : "aside";
  const panelClass = isDrawer
    ? "neu-filter-panel neu-filter-panel--drawer"
    : "neu-panel neu-filter-panel";

  const hasFacets =
    facets &&
    ((facets.categories?.length ?? 0) > 0 ||
      (facets.brands?.length ?? 0) > 0 ||
      (facets.scales?.length ?? 0) > 0);

  if (!hasFacets && !loading) return null;

  return (
    <Tag className={panelClass}>
      <Spin spinning={loading}>
        <FilterContent
          facets={facets}
          loading={loading}
          selectedCategoryIds={selectedCategoryIds}
          selectedBrandIds={selectedBrandIds}
          selectedScaleIds={selectedScaleIds}
          onToggleCategory={onToggleCategory}
          onToggleBrand={onToggleBrand}
          onToggleScale={onToggleScale}
          showTitle={!isDrawer}
        />
      </Spin>
    </Tag>
  );
}
