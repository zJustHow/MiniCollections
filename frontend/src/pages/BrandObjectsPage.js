import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useSearchParam from "../hooks/useSearchParam";
import useObjectFilterParams from "../hooks/useObjectFilterParams";
import usePagedList from "../hooks/usePagedList";
import { App, Button, Card, Grid, Popconfirm, Spin } from "antd";
import { NeuInput } from "../components/NeuFormControl";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import AddCardCover from "../components/ObjectList/AddCardCover";
import CardCover from "../components/ObjectList/CardCover";
import ListPagination from "../components/ListPagination";
import ObjectSearchFilterPanel from "../components/ObjectSearchFilterPanel";
import { filterKeyFromIds } from "../utils/filterParams";
import SubmitObjectModal from "../components/ObjectList/modals/SubmitObjectModal";
import BrandModal from "../components/ObjectList/modals/BrandModal";
import BrandObjectModal from "../components/ObjectList/modals/BrandObjectModal";
import { useLocale } from "../LocaleContext";
import { useHeader } from "../HeaderContext";
import {
  getBrandByBrandId,
  getBrandObjectsPage,
  searchBrandObjectsByBrandIdPage,
  searchBrandObjectsByBrandIdFacets,
  adminDeleteBrand,
  PAGE_SIZE,
} from "../utils";

const { Search } = NeuInput;
const { useBreakpoint } = Grid;

export default function BrandObjectsPage({ isAdmin, authed = true }) {
  const { brandId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { t } = useLocale();
  const { setHeaderSlot } = useHeader();
  const screens = useBreakpoint();
  const cols = screens.lg ? 4 : screens.md ? 3 : 2;

  const [searchValue, setSearchParam] = useSearchParam();
  const {
    selectedCategoryIds,
    selectedScaleIds,
    clearObjectFilters,
    onToggleCategory,
    onToggleScale,
  } = useObjectFilterParams({ includeBrands: false });
  const [brand, setBrand] = useState(location.state?.brand ?? null);
  const [searchActive, setSearchActive] = useState(
    Boolean((searchValue ?? "").trim()),
  );
  const [searchKeyword, setSearchKeyword] = useState(
    (searchValue ?? "").trim(),
  );
  const [draftQuery, setDraftQuery] = useState(searchValue);
  const [searchFacets, setSearchFacets] = useState(null);
  const [facetsLoading, setFacetsLoading] = useState(false);
  const syncedKeywordRef = useRef(searchKeyword);
  const returnSearchRef = useRef(location.state?.returnSearch ?? "");

  useEffect(() => {
    if (location.state?.returnSearch != null) {
      returnSearchRef.current = location.state.returnSearch;
    }
  }, [location.state?.returnSearch]);

  const [submitModalVisible, setSubmitModalVisible] = useState(false);

  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [brandObjectModalOpen, setBrandObjectModalOpen] = useState(false);
  const [editingBrandObject, setEditingBrandObject] = useState(null);

  const objectsList = usePagedList(
    ({ size, page }) => getBrandObjectsPage(brandId, { size, page }),
    {
      resetKey: `brand-objects:${brandId}`,
      enabled: !searchActive,
      pageSize: PAGE_SIZE,
      pageParamKey: "page",
    },
  );

  const objectsSearch = usePagedList(
    ({ size, page }) =>
      searchBrandObjectsByBrandIdPage(brandId, searchKeyword, {
        size,
        page,
        categoryIds: selectedCategoryIds,
        scaleIds: selectedScaleIds,
      }),
    {
      resetKey: `brand-objects-search:${brandId}:${searchKeyword}:${filterKeyFromIds(selectedCategoryIds, [], selectedScaleIds)}`,
      enabled: searchActive && Boolean(searchKeyword),
      pageSize: PAGE_SIZE,
      pageParamKey: "page",
    },
  );

  const activePage = searchActive ? objectsSearch : objectsList;
  const displayObjects = activePage.items;
  const showAddCard = isAdmin && !searchActive;
  const listData = showAddCard
    ? [{ id: "__add__" }, ...displayObjects]
    : displayObjects;

  const showObjectFilters =
    searchActive &&
    Boolean(searchKeyword) &&
    searchFacets != null &&
    ((searchFacets.categories?.length ?? 0) > 0 ||
      (searchFacets.scales?.length ?? 0) > 0);

  const showFilterColumn = showObjectFilters || (searchActive && facetsLoading);

  const showSearchObjectsSection =
    searchActive &&
    (displayObjects.length > 0 || showFilterColumn || objectsSearch.loading);

  useEffect(() => {
    if (!brand) {
      getBrandByBrandId(brandId)
        .then(setBrand)
        .catch((err) => message.error(err?.message || t("failedToLoadBrands")));
    }
  }, [brandId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const keyword = (searchValue ?? "").trim();
    if (keyword) {
      if (keyword !== syncedKeywordRef.current) {
        clearObjectFilters();
        syncedKeywordRef.current = keyword;
      }
      setDraftQuery(keyword);
      setSearchKeyword(keyword);
      setSearchActive(true);
    }
  }, [brandId, searchValue]);

  useEffect(() => {
    if (!searchActive || !searchKeyword) {
      setSearchFacets(null);
      return undefined;
    }

    let cancelled = false;
    setFacetsLoading(true);
    searchBrandObjectsByBrandIdFacets(brandId, searchKeyword)
      .then((data) => {
        if (!cancelled) {
          setSearchFacets(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSearchFacets({ total: 0, categories: [], brands: [], scales: [] });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setFacetsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [brandId, searchKeyword, searchActive]);

  const handleAdminDeleteBrand = async () => {
    if (!brand) return;
    try {
      await adminDeleteBrand(brand.id);
      message.success(t("brandDeleted"));
      navigate("/");
    } catch (err) {
      message.error(err?.message || t("failedToDeleteBrand"));
    }
  };

  useEffect(() => {
    setHeaderSlot(
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          width: "100%",
          gap: 8,
        }}
      >
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              navigate({
                pathname: "/",
                search: returnSearchRef.current,
              })
            }
          />
        </div>
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--neu-text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {brand?.name ?? "…"}
        </span>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          {isAdmin && brand && (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingBrand(brand);
                  setBrandModalOpen(true);
                }}
              />
              <Popconfirm
                title={t("deleteBrandTitle")}
                description={t("deleteBrandContent").replace(
                  "{name}",
                  brand.name,
                )}
                onConfirm={handleAdminDeleteBrand}
                okText={t("delete")}
                okButtonProps={{ danger: true }}
                cancelText={t("cancel")}
              >
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </div>
      </div>,
    );
    return () => setHeaderSlot(null);
  }, [brand, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshObjects = useCallback(() => {
    activePage.loadPage(activePage.page);
  }, [activePage]);

  const runSearch = useCallback(
    (keyword) => {
      const trimmed = keyword.trim();
      if (!trimmed) {
        setSearchActive(false);
        setSearchKeyword("");
        setSearchParam("");
        clearObjectFilters();
        setSearchFacets(null);
        syncedKeywordRef.current = "";
        return;
      }
      if (trimmed !== syncedKeywordRef.current) {
        clearObjectFilters();
        syncedKeywordRef.current = trimmed;
      }
      setSearchParam(trimmed);
      setSearchKeyword(trimmed);
      setSearchActive(true);
    },
    [setSearchParam, clearObjectFilters],
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Search
          placeholder={t("searchModels")}
          allowClear
          value={draftQuery}
          onChange={(e) => {
            const v = e.target.value;
            setDraftQuery(v);
            if (v === "") {
              setSearchActive(false);
              setSearchKeyword("");
              setSearchParam("");
              clearObjectFilters();
              setSearchFacets(null);
            }
          }}
          onSearch={(v) => {
            const keyword = (v ?? "").trim();
            setDraftQuery(keyword);
            runSearch(keyword);
          }}
          style={{ width: screens.md ? 260 : "100%" }}
        />
      </div>

      <Spin spinning={activePage.loading && displayObjects.length === 0}>
        {searchActive ? (
          <>
            {showSearchObjectsSection ? (
              <div className="neu-search-objects-layout">
                {showFilterColumn && (
                  <ObjectSearchFilterPanel
                    facets={searchFacets}
                    loading={facetsLoading}
                    selectedCategoryIds={selectedCategoryIds}
                    selectedBrandIds={[]}
                    selectedScaleIds={selectedScaleIds}
                    onToggleCategory={onToggleCategory}
                    onToggleBrand={() => {}}
                    onToggleScale={onToggleScale}
                  />
                )}
                <div
                  className="neu-search-objects-cards"
                  style={
                    showFilterColumn ? undefined : { gridColumn: "1 / -1" }
                  }
                >
                  {displayObjects.map((item) => (
                    <Card
                      key={item.id}
                      hoverable
                      className="neu-card"
                      cover={
                        <CardCover
                          image_url={item.image_url}
                          name={item.name}
                        />
                      }
                      onClick={() =>
                        navigate(`/brands/${brandId}/objects/${item.id}`, {
                          state: { brandObject: item, brand },
                        })
                      }
                      bodyStyle={{ padding: 0 }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              !objectsSearch.loading && (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--neu-text-2)",
                    padding: "32px 0",
                  }}
                >
                  {t("noSearchResults")}
                </div>
              )
            )}
            <ListPagination
              page={activePage.page}
              totalElements={activePage.totalElements}
              totalPages={activePage.totalPages}
              totalExact={activePage.totalExact}
              loading={activePage.loading}
              onPageChange={activePage.onPageChange}
              pageSize={PAGE_SIZE}
            />
          </>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: 16,
              }}
            >
              {listData.map((item) =>
                item.id === "__add__" ? (
                  <Card
                    key="__add__"
                    hoverable
                    className="neu-card"
                    cover={<AddCardCover label={t("addBrandObject")} />}
                    onClick={() => {
                      setEditingBrandObject(null);
                      setBrandObjectModalOpen(true);
                    }}
                    bodyStyle={{ padding: 0 }}
                  />
                ) : (
                  <Card
                    key={item.id}
                    hoverable
                    className="neu-card"
                    cover={
                      <CardCover image_url={item.image_url} name={item.name} />
                    }
                    onClick={() =>
                      navigate(`/brands/${brandId}/objects/${item.id}`, {
                        state: { brandObject: item, brand },
                      })
                    }
                    bodyStyle={{ padding: 0 }}
                  />
                ),
              )}
            </div>
            <ListPagination
              page={activePage.page}
              totalElements={activePage.totalElements}
              totalPages={activePage.totalPages}
              totalExact={activePage.totalExact}
              loading={activePage.loading}
              onPageChange={activePage.onPageChange}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </Spin>

      {authed && (
        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            paddingTop: 12,
            borderTop: "1px solid rgba(184,182,176,0.2)",
          }}
        >
          <button
            type="button"
            onClick={() => setSubmitModalVisible(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--neu-text-2)",
              fontSize: 13,
              textDecoration: "underline",
              padding: 0,
            }}
          >
            {t("reportFeedback")}
          </button>
        </div>
      )}

      <SubmitObjectModal
        visible={submitModalVisible}
        onCancel={() => setSubmitModalVisible(false)}
        selectedBrand={brand}
        brands={brand ? [brand] : []}
      />

      <BrandModal
        open={brandModalOpen}
        brand={editingBrand}
        onClose={() => setBrandModalOpen(false)}
        onSuccess={() =>
          getBrandByBrandId(brandId)
            .then(setBrand)
            .catch(() => {})
        }
      />

      <BrandObjectModal
        open={brandObjectModalOpen}
        brandObject={editingBrandObject}
        brandId={brandId}
        onClose={() => setBrandObjectModalOpen(false)}
        onSuccess={refreshObjects}
      />
    </div>
  );
}
