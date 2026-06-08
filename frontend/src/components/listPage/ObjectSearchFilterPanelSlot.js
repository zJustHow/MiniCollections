import ObjectSearchFilterPanel from "../ObjectSearchFilterPanel";

export default function ObjectSearchFilterPanelSlot({
  visible,
  facets,
  loading,
  selectedCategoryIds,
  selectedBrandIds = [],
  selectedScaleIds,
  selectedSeriesIds = [],
  onToggleCategory,
  onToggleBrand = () => {},
  onToggleScale,
  onToggleSeries = () => {},
}) {
  if (!visible) return null;

  return (
    <ObjectSearchFilterPanel
      facets={facets}
      loading={loading}
      selectedCategoryIds={selectedCategoryIds}
      selectedBrandIds={selectedBrandIds}
      selectedScaleIds={selectedScaleIds}
      selectedSeriesIds={selectedSeriesIds}
      onToggleCategory={onToggleCategory}
      onToggleBrand={onToggleBrand}
      onToggleScale={onToggleScale}
      onToggleSeries={onToggleSeries}
    />
  );
}
