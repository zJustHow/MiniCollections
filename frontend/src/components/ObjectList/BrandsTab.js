import { useEffect, useState } from "react";
import { Card, Grid, Spin } from "antd";
import { NeuInput } from "../NeuFormControl";
import { useNavigate } from "react-router-dom";
import AddCardCover from "./AddCardCover";
import CardCover from "./CardCover";
import ListPagination from "../ListPagination";
import ObjectSearchFilterPanel from "../ObjectSearchFilterPanel";
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
  brandsSearchPage,
  objectsSearchPage,
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

  const sectionLabelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--neu-text-2)",
    marginBottom: 10,
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
      objectsSearchPage?.loading);

  const spinning = searchActive
    ? (brandsSearchPage?.loading || objectsSearchPage?.loading) &&
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
            {searchResultBrands.length > 0 && (
              <>
                <div style={sectionLabelStyle}>{t("brands")}</div>
                <div style={browseGridStyle}>
                  {searchResultBrands.map(renderBrandCard)}
                </div>
                <ListPagination
                  page={brandsSearchPage?.page ?? 0}
                  totalElements={brandsSearchPage?.totalElements ?? 0}
                  totalPages={brandsSearchPage?.totalPages ?? 0}
                  totalExact={brandsSearchPage?.totalExact}
                  loading={brandsSearchPage?.loading}
                  onPageChange={brandsSearchPage?.onPageChange}
                  pageSize={PAGE_SIZE}
                />
              </>
            )}

            {showObjectsSection && (
              <>
                <div
                  style={{
                    ...sectionLabelStyle,
                    marginTop: searchResultBrands.length > 0 ? 24 : 0,
                  }}
                >
                  {t("brandObjects")}
                </div>
                <div className="neu-search-objects-layout">
                  {showFilterColumn && (
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
                  )}
                  <div
                    className="neu-search-objects-cards"
                    style={
                      showFilterColumn ? undefined : { gridColumn: "1 / -1" }
                    }
                  >
                    {searchResultObjects.map(renderObjectCard)}
                  </div>
                </div>
                <ListPagination
                  page={objectsSearchPage?.page ?? 0}
                  totalElements={objectsSearchPage?.totalElements ?? 0}
                  totalPages={objectsSearchPage?.totalPages ?? 0}
                  totalExact={objectsSearchPage?.totalExact}
                  loading={objectsSearchPage?.loading}
                  onPageChange={objectsSearchPage?.onPageChange}
                  pageSize={PAGE_SIZE}
                />
              </>
            )}

            {searchResultBrands.length === 0 &&
              !showObjectsSection &&
              !brandsSearchPage?.loading &&
              !objectsSearchPage?.loading && (
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
