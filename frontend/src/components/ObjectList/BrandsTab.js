import { useEffect, useState } from "react";
import NeuCard from "../NeuCard";
import NeuCardGridSkeleton from "../NeuCardGridSkeleton";
import { NeuInput } from "../NeuFormControl";
import { useNavigate } from "react-router-dom";
import ListPagination from "../ListPagination";
import ObjectSearchFilterLayout from "../ObjectSearchFilterLayout";
import ObjectSearchFilterPanel from "../ObjectSearchFilterPanel";
import ObjectListPageLayout from "../ObjectListPageLayout";
import SearchResultsSummary from "../SearchResultsSummary";
import { useLocale } from "../../LocaleContext";
import { PAGE_SIZE } from "../../utils";
import { pickBrandName } from "../../utils/displayLocale";

const { Search } = NeuInput;

export default function BrandsTab({
  brands,
  loading,
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
  showObjectFilters,
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
  const [draftQuery, setDraftQuery] = useState(searchValue ?? "");

  useEffect(() => {
    setDraftQuery(searchValue ?? "");
  }, [searchValue]);

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

  const showAddCard = isAdmin && (brandsListPage?.page ?? 0) === 0;
  const dataSource = showAddCard ? [{ id: "__add__" }, ...brands] : brands;

  const showFilterColumn = showObjectFilters || (searchActive && facetsLoading);

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

  return (
    <div style={{ position: "relative", minHeight: 200, width: "100%" }}>
      <ObjectListPageLayout
          showFilterColumn={searchActive && showFilterColumn}
          summary={
            <SearchResultsSummary
              active={searchActive}
              keyword={searchValue}
              count={combinedSearchPage?.totalElements ?? 0}
              exact={combinedSearchPage?.totalExact}
              loading={searchActive && combinedSearchPage?.loading}
            />
          }
        search={
          <Search
            id="brands-search"
            name="brandsSearch"
            placeholder={t("searchBrandsAndObjects")}
            allowClear
            value={draftQuery}
            onSearch={onSearch}
            onChange={(e) => {
              const v = e.target.value;
              setDraftQuery(v);
              if (v === "") onSearch("");
            }}
          />
        }
        filter={
          searchActive &&
          showFilterColumn &&
          (hasBrandResults || showObjectsSection) ? (
            <ObjectSearchFilterPanel
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
          ) : null
        }
      >
        {searchActive ? (
          <>
            {spinning ? (
              <ObjectSearchFilterLayout
                showFilterColumn={showFilterColumn}
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
              >
                <NeuCardGridSkeleton
                  variant="object"
                  withFilter={showFilterColumn}
                  className="neu-search-section-grid"
                />
              </ObjectSearchFilterLayout>
            ) : (hasBrandResults || showObjectsSection) && (
              <ObjectSearchFilterLayout
                showFilterColumn={showFilterColumn}
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
              >
                {showBrandCards && (
                  <div className="neu-search-section-grid">
                    {searchResultBrands.map(renderBrandCard)}
                  </div>
                )}
                {showBrandCards && showObjectsSection && showObjectCards && (
                  <div
                    className="neu-search-section-divider"
                    role="separator"
                  />
                )}
                {showObjectsSection && showObjectCards && (
                  <div className="neu-search-section-grid">
                    {searchResultObjects.map(renderObjectCard)}
                  </div>
                )}
              </ObjectSearchFilterLayout>
            )}

            <ListPagination
              page={combinedSearchPage?.page ?? 0}
              totalPages={combinedSearchPage?.totalPages ?? 0}
              loading={combinedSearchPage?.loading}
              onPageChange={combinedSearchPage?.onPageChange}
              pageSize={PAGE_SIZE}
            />

            {!spinning && !hasBrandResults && !showObjectsSection && (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--neu-text-2)",
                    padding: "32px 0",
                  }}
                >
                  {t("noSearchResults")}
                </div>
              )}
          </>
        ) : (
          <>
            {spinning ? (
              <NeuCardGridSkeleton />
            ) : (
              <div className="neu-list-page-browse-grid">
                {dataSource.map(renderBrandCard)}
              </div>
            )}
            <ListPagination
              page={brandsListPage?.page ?? 0}
              totalElements={brandsListPage?.totalElements ?? 0}
              totalPages={brandsListPage?.totalPages ?? 0}
              totalExact={brandsListPage?.totalExact}
              loading={brandsListPage?.loading}
              onPageChange={brandsListPage?.onPageChange}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
        </ObjectListPageLayout>
    </div>
  );
}
