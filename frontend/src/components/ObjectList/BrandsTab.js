import { useEffect, useState } from "react";
import { Card, Grid, Spin } from "antd";
import { NeuInput } from "../NeuFormControl";
import { useNavigate } from "react-router-dom";
import AddCardCover from "./AddCardCover";
import CardCover from "./CardCover";
import ListPagination from "../ListPagination";
import ObjectSearchFilterLayout from "../ObjectSearchFilterLayout";
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
      <Card
        key="__add__"
        hoverable
        className="neu-card"
        cover={<AddCardCover label={t("addBrand")} />}
        onClick={onCreateBrand}
        bodyStyle={{ padding: 0 }}
      />
    ) : (
      <Card
        key={brand.id}
        hoverable
        className="neu-card"
        cover={
          <CardCover
            image_url={brand.image_url}
            name={brand.name}
            fixedGroove
            logoShadow
          />
        }
        onClick={() => onBrandClick(brand)}
        bodyStyle={{ padding: 0 }}
      />
    );

  const renderObjectCard = (obj) => (
    <Card
      key={obj.id}
      hoverable
      className="neu-card"
      cover={<CardCover image_url={obj.image_url} name={obj.name} />}
      onClick={() =>
        navigate(`/brands/${obj.brand_id}/objects/${obj.id}`, {
          state: { brandObject: obj },
        })
      }
      bodyStyle={{ padding: 0 }}
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

  return (
    <>
      <div
        style={{
          display: screens.md ? "flex" : "block",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
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
          style={{ width: screens.md ? 260 : "100%" }}
        />
      </div>

      <Spin spinning={spinning}>
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
                    <>
                      <div className="neu-search-section-label">{t("brands")}</div>
                      {searchResultBrands.map(renderBrandCard)}
                    </>
                  )}
                  {showObjectsSection && showObjectCards && (
                    <>
                      <div
                        className={`neu-search-section-label${
                          showBrandCards
                            ? " neu-search-section-label--spaced"
                            : ""
                        }`}
                      >
                        {t("brandObjects")}
                      </div>
                      {searchResultObjects.map(renderObjectCard)}
                    </>
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
            <div style={browseGridStyle}>{dataSource.map(renderBrandCard)}</div>
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
      </Spin>
    </>
  );
}
