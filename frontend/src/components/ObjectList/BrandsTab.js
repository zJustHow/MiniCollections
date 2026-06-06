import { useEffect, useState } from "react";
import { Grid, Spin } from "antd";
import NeuCard from "../NeuCard";
import { NeuInput } from "../NeuFormControl";
import { useNavigate } from "react-router-dom";
import ListPagination from "../ListPagination";
import ObjectSearchFilterLayout from "../ObjectSearchFilterLayout";
import ObjectSearchFilterPanel from "../ObjectSearchFilterPanel";
import ObjectListPageLayout from "../ObjectListPageLayout";
import SearchResultsSummary from "../SearchResultsSummary";
import { useLocale } from "../../LocaleContext";
import { PAGE_SIZE } from "../../utils";

const { Search } = NeuInput;
const { useBreakpoint } = Grid;

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
  onToggleCategory,
  onToggleBrand,
  onToggleScale,
}) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [draftQuery, setDraftQuery] = useState(searchValue ?? "");

  useEffect(() => {
    setDraftQuery(searchValue ?? "");
  }, [searchValue]);
  const browseCols = screens.lg ? 4 : screens.md ? 3 : 2;

  const browseGridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${browseCols}, 1fr)`,
    gap: 16,
  };

  const renderBrandCard = (brand) =>
    brand.id === "__add__" ? (
      <NeuCard
        key="__add__"
        add
        name={t("addBrand")}
        onClick={onCreateBrand}
      />
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
      imageUrl={obj.image_url}
      onClick={() =>
        navigate(`/brands/${obj.brand_id}/objects/${obj.id}`, {
          state: { brandObject: obj },
        })
      }
    />
  );

  const dataSource = isAdmin ? [{ id: "__add__" }, ...brands] : brands;

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
    searchResultObjects.length > 0 || showFilterColumn || combinedSearchPage?.loading;

  const spinning = searchActive
    ? combinedSearchPage?.loading &&
      searchResultBrands.length === 0 &&
      searchResultObjects.length === 0 &&
      !showFilterColumn
    : brandsListPage?.loading && brands.length === 0;

  const browseGridClass =
    browseCols === 4 ? "neu-list-page-browse-grid" : undefined;

  return (
    <Spin spinning={spinning}>
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
              onToggleCategory={onToggleCategory}
              onToggleBrand={onToggleBrand}
              onToggleScale={onToggleScale}
            />
          ) : null
        }
      >

        {searchActive ? (
          <>
            {(hasBrandResults || showObjectsSection) && (
              <>
                <ObjectSearchFilterLayout
                  showFilterColumn={showFilterColumn}
                  facets={searchFacets}
                  loading={facetsLoading}
                  selectedCategoryIds={selectedCategoryIds}
                  selectedBrandIds={selectedBrandIds}
                  selectedScaleIds={selectedScaleIds}
                  onToggleCategory={onToggleCategory}
                  onToggleBrand={onToggleBrand}
                  onToggleScale={onToggleScale}
                >
                  {showBrandCards && (
                    <div className="neu-search-section-grid">
                      {searchResultBrands.map(renderBrandCard)}
                    </div>
                  )}
                  {showBrandCards &&
                    showObjectsSection &&
                    showObjectCards && (
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
                <ListPagination
                  page={combinedSearchPage?.page ?? 0}
                  totalPages={combinedSearchPage?.totalPages ?? 0}
                  loading={combinedSearchPage?.loading}
                  onPageChange={combinedSearchPage?.onPageChange}
                  pageSize={PAGE_SIZE}
                />
              </>
            )}

            {!hasBrandResults &&
              !showObjectsSection &&
              !combinedSearchPage?.loading && (
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
            <div
              className={browseGridClass}
              style={browseGridClass ? undefined : browseGridStyle}
            >
              {dataSource.map(renderBrandCard)}
            </div>
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
    </Spin>
  );
}
