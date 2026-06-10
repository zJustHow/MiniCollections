import NeuCard from "../NeuCard";
import { useNavigate } from "react-router-dom";
import useTabListSearchField from "../../hooks/useTabListSearchField";
import ObjectListPageShell from "../listPage/ObjectListPageShell";
import TabCombinedSearchSection from "../listPage/TabCombinedSearchSection";
import SortableInfiniteBrowseSection from "../listPage/SortableInfiniteBrowseSection";
import ActivePagePagination from "../listPage/ActivePagePagination";
import NoSearchResults from "../listPage/NoSearchResults";
import ObjectSearchFilterPanelSlot from "../listPage/ObjectSearchFilterPanelSlot";
import {
  buildFilterLayoutProps,
  resolveFilterColumnState,
} from "../../utils/objectFilterUtils";
import { withAddCardSlot } from "../../utils/listPageUtils";
import { useLocale } from "../../LocaleContext";
import { pickBrandName } from "../../utils/displayLocale";

export default function BrandsTab({
  brands,
  onSearch,
  onBrandClick,
  isAdmin,
  onCreateBrand,
  searchActive,
  searchResultBrands,
  searchResultObjects,
  searchValue,
  brandsBrowse,
  combinedSearchPage,
  searchFacets,
  facetsLoading,
  selectedCategoryIds,
  selectedBrandIds,
  selectedScaleIds,
  selectedSeriesIds,
  onToggleCategory,
  onToggleBrand,
  onToggleScale,
  onToggleSeries,
}) {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const { draftQuery, handleDraftChange } = useTabListSearchField(
    searchValue,
    onSearch,
  );

  const renderBrandCard = (brand) =>
    brand.id === "__add__" ? (
      <NeuCard key="__add__" add name={t("addBrand")} onClick={onCreateBrand} />
    ) : (
      <NeuCard
        key={brand.id}
        name={brand.name}
        imageUrl={brand.image_url}
        fixedGroove
        logoShadow
        onClick={() => onBrandClick(brand)}
      />
    );

  const renderObjectCard = (obj) => (
    <NeuCard
      key={obj.id}
      name={obj.name}
      subtitle={pickBrandName(obj, locale)}
      nameplateVariant="object"
      imageUrl={obj.image_url}
      onClick={() =>
        navigate(`/brands/${obj.brand_id}/objects/${obj.id}`, {
          state: { brandObject: obj },
        })
      }
    />
  );

  const browseData = withAddCardSlot(brands, isAdmin);

  const { showFilterColumn } = resolveFilterColumnState({
    searchActive,
    searchKeyword: searchValue,
    searchFacets,
    facetsLoading,
    includeBrands: true,
  });

  const showObjectsSection =
    searchActive &&
    (searchResultObjects.length > 0 ||
      showFilterColumn ||
      combinedSearchPage?.loading ||
      (combinedSearchPage?.totalObjects ?? 0) > 0);

  const hasBrandResults = (combinedSearchPage?.totalBrands ?? 0) > 0;
  const showBrandCards = searchResultBrands.length > 0;
  const showObjectCards =
    searchResultObjects.length > 0 ||
    showFilterColumn ||
    combinedSearchPage?.loading;

  const searchSpinning = Boolean(combinedSearchPage?.loading || facetsLoading);
  const searchHasResults = hasBrandResults || showObjectsSection;

  const filterLayoutProps = buildFilterLayoutProps({
    showFilterColumn,
    searchFacets,
    facetsLoading,
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
    selectedSeriesIds,
    onToggleCategory,
    onToggleBrand,
    onToggleScale,
    onToggleSeries,
  });

  return (
    <ObjectListPageShell
      framed
      showFilterColumn={searchActive && showFilterColumn}
      searchActive={searchActive}
      searchKeyword={searchValue}
      resultPage={combinedSearchPage}
      searchFieldId="brands-search"
      searchFieldName="brandsSearch"
      searchPlaceholder={t("searchBrandsAndObjects")}
      draftQuery={draftQuery}
      onDraftChange={handleDraftChange}
      onSearch={onSearch}
      filter={
        <ObjectSearchFilterPanelSlot
          visible={
            searchActive &&
            showFilterColumn &&
            (hasBrandResults || showObjectsSection)
          }
          facets={searchFacets}
          loading={facetsLoading}
          selectedCategoryIds={selectedCategoryIds}
          selectedBrandIds={selectedBrandIds}
          selectedScaleIds={selectedScaleIds}
          selectedSeriesIds={selectedSeriesIds}
          onToggleCategory={onToggleCategory}
          onToggleBrand={onToggleBrand}
          onToggleScale={onToggleScale}
          onToggleSeries={onToggleSeries}
        />
      }
    >
      {searchActive ? (
        <>
          <TabCombinedSearchSection
            spinning={searchSpinning}
            withFilterLayout
            filterLayoutProps={filterLayoutProps}
            hasResults={searchHasResults}
            showPrimaryCards={showBrandCards}
            showObjectSection={showObjectsSection}
            showObjectCards={showObjectCards}
            showDivider={
              showBrandCards && showObjectsSection && showObjectCards
            }
            primaryCards={searchResultBrands.map(renderBrandCard)}
            objectCards={searchResultObjects.map(renderObjectCard)}
          />
          <ActivePagePagination
            activePage={combinedSearchPage}
            includeTotals={false}
          />
          {!searchSpinning && !searchHasResults ? <NoSearchResults /> : null}
        </>
      ) : (
        <SortableInfiniteBrowseSection
          loading={brandsBrowse?.loading}
          items={browseData}
          renderItem={renderBrandCard}
          sortableIds={[]}
          sortEnabled={false}
          hasMore={brandsBrowse?.hasMore}
          loadingMore={brandsBrowse?.loadingMore}
          onLoadMore={brandsBrowse?.loadMore}
          loadError={brandsBrowse?.loadError}
          loadMoreError={brandsBrowse?.loadMoreError}
          errorMessage={t("failedToLoadBrands")}
          onRetry={brandsBrowse?.retry}
          onRetryLoadMore={brandsBrowse?.retryLoadMore}
          skeletonVariant="catalog"
        />
      )}
    </ObjectListPageShell>
  );
}
