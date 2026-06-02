import { Card, Grid, Input, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CardCover from "./CardCover";
import InfiniteSliceFooter from "../InfiniteSliceFooter";
import { useLocale } from "../../LocaleContext";

const { Search } = Input;
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
  brandsListSlice,
  brandsSearchSlice,
  objectsSearchSlice,
}) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const cols = screens.lg ? 4 : screens.md ? 3 : 2;

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
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
        className="neu-model-card"
        cover={
          <div
            style={{
              position: "relative",
              paddingTop: "75%",
              overflow: "hidden",
              borderRadius: "32px 32px 0 0",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlusOutlined
                style={{ fontSize: 36, color: "var(--neu-text-2)" }}
              />
            </div>
            <div className="neu-nameplate">{t("addBrand")}</div>
          </div>
        }
        onClick={onCreateBrand}
        bodyStyle={{ padding: 0 }}
      />
    ) : (
      <Card
        key={brand.id}
        hoverable
        className="neu-model-card"
        cover={
          <CardCover
            image_url={brand.image_url}
            name={brand.name}
            objectFit="contain"
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
      className="neu-model-card"
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
          defaultValue={searchValue}
          onSearch={onSearch}
          onChange={(e) => {
            if (e.target.value === "") onSearch("");
          }}
          style={{ width: screens.md ? 260 : "100%" }}
        />
      </div>

      <Spin spinning={loading}>
        {searchActive ? (
          <>
            {searchResultBrands.length > 0 && (
              <>
                <div style={sectionLabelStyle}>{t("brands")}</div>
                <div style={gridStyle}>
                  {searchResultBrands.map(renderBrandCard)}
                </div>
                <InfiniteSliceFooter
                  hasMore={brandsSearchSlice?.hasMore}
                  loading={brandsSearchSlice?.loading}
                  loadingMore={brandsSearchSlice?.loadingMore}
                  onLoadMore={brandsSearchSlice?.loadMore}
                  itemCount={searchResultBrands.length}
                  totalElements={brandsSearchSlice?.totalElements}
                  totalExact={brandsSearchSlice?.totalExact}
                />
              </>
            )}
            {searchResultObjects.length > 0 && (
              <>
                <div
                  style={{
                    ...sectionLabelStyle,
                    marginTop: searchResultBrands.length > 0 ? 24 : 0,
                  }}
                >
                  {t("brandObjects")}
                </div>
                <div style={gridStyle}>
                  {searchResultObjects.map(renderObjectCard)}
                </div>
                <InfiniteSliceFooter
                  hasMore={objectsSearchSlice?.hasMore}
                  loading={objectsSearchSlice?.loading}
                  loadingMore={objectsSearchSlice?.loadingMore}
                  onLoadMore={objectsSearchSlice?.loadMore}
                  itemCount={searchResultObjects.length}
                  totalElements={objectsSearchSlice?.totalElements}
                  totalExact={objectsSearchSlice?.totalExact}
                />
              </>
            )}
            {searchResultBrands.length === 0 &&
              searchResultObjects.length === 0 &&
              !brandsSearchSlice?.loading &&
              !objectsSearchSlice?.loading && (
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
            <div style={gridStyle}>{dataSource.map(renderBrandCard)}</div>
            <InfiniteSliceFooter
              hasMore={brandsListSlice?.hasMore}
              loading={brandsListSlice?.loading}
              loadingMore={brandsListSlice?.loadingMore}
              onLoadMore={brandsListSlice?.loadMore}
              itemCount={brands.length}
            />
          </>
        )}
      </Spin>
    </>
  );
}
