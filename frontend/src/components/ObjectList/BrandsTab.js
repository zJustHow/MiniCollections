import NeuCard from "../NeuCard";
import { useNavigate } from "react-router-dom";
import useTabListSearchField from "../../hooks/useTabListSearchField";
import ObjectListPageShell from "../listPage/ObjectListPageShell";
import TabListPageBody from "../listPage/TabListPageBody";
import TabCombinedSearchSection from "../listPage/TabCombinedSearchSection";
import ObjectSearchFilterPanelSlot from "../listPage/ObjectSearchFilterPanelSlot";
import {
  buildFilterLayoutProps,
  resolveFilterColumnState,
} from "../../utils/objectFilterUtils";
import { withAddCardSlot } from "../../utils/listPageUtils";
import { useLocale } from "../../LocaleContext";
import { pickBrandName } from "../../utils/displayLocale";
import { prefetchBrandObjectDetailPage } from "../../utils/prefetchRoutes";

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
  brandsListPage,
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
      onMouseEnter={prefetchBrandObjectDetailPage}
      onFocus={prefetchBrandObjectDetailPage}
      onClick={() => {
        prefetchBrandObjectDetailPage();
        navigate(`/brands/${obj.brand_id}/objects/${obj.id}`, {
          state: { brandObject: obj },
        });
      }}
    />
  );

  const dataSource = withAddCardSlot(
    brands,
    isAdmin && (brandsListPage?.page ?? 0) === 0,
  );

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

  const spinning = searchActive
    ? combinedSearchPage?.loading || facetsLoading
    : Boolean(brandsListPage?.loading);

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
      <TabListPageBody
        searchActive={searchActive}
        spinning={spinning}
        searchHasResults={hasBrandResults || showObjectsSection}
        searchPaginationPage={combinedSearchPage}
        browsePaginationPage={brandsListPage}
        browseItems={dataSource}
        renderBrowseItem={renderBrandCard}
        searchContent={
          <TabCombinedSearchSection
            spinning={spinning}
            withFilterLayout
            filterLayoutProps={filterLayoutProps}
            hasResults={hasBrandResults || showObjectsSection}
            showPrimaryCards={showBrandCards}
            showObjectSection={showObjectsSection}
            showObjectCards={showObjectCards}
            showDivider={
              showBrandCards && showObjectsSection && showObjectCards
            }
            primaryCards={searchResultBrands.map(renderBrandCard)}
            objectCards={searchResultObjects.map(renderObjectCard)}
          />
        }
      />
    </ObjectListPageShell>
  );
}
