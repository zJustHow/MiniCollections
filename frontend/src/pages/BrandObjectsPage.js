import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useSearchParam from "../hooks/useSearchParam";
import useObjectFilterParams from "../hooks/useObjectFilterParams";
import usePagedList from "../hooks/usePagedList";
import { App } from "antd";
import NeuCardGridSkeleton from "../components/NeuCardGridSkeleton";
import NeuCard from "../components/NeuCard";
import BrandObjectsPageHeader from "../components/pageHeaders/BrandObjectsPageHeader";
import { NeuInput } from "../components/NeuFormControl";
import ListPagination from "../components/ListPagination";
import ObjectSearchFilterLayout from "../components/ObjectSearchFilterLayout";
import ObjectSearchFilterPanel from "../components/ObjectSearchFilterPanel";
import ObjectListPageLayout from "../components/ObjectListPageLayout";
import SearchResultsSummary from "../components/SearchResultsSummary";
import { filterKeyFromIds } from "../utils/filterParams";
import SubmitObjectModal from "../components/ObjectList/modals/SubmitObjectModal";
import BrandModal from "../components/ObjectList/modals/BrandModal";
import BrandObjectModal from "../components/ObjectList/modals/BrandObjectModal";
import { useLocale } from "../LocaleContext";
import { useHeader } from "../HeaderContext";
import { pickBrandName } from "../utils/displayLocale";
import {
  getBrandByBrandId,
  getBrandObjectsPage,
  searchBrandObjectsByBrandIdPage,
  searchBrandObjectsByBrandIdFacets,
  adminDeleteBrand,
  PAGE_SIZE,
  recordBrandView,
} from "../utils";
import { scrollAppToTop } from "../utils/scroll";
import { neuRem } from "../theme/fontScale";

const { Search } = NeuInput;

export default function BrandObjectsPage({ isAdmin, authed = true }) {
  const { brandId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { t, locale } = useLocale();
  const { setHeaderSlot } = useHeader();

  const [searchValue] = useSearchParam();
  const {
    selectedCategoryIds,
    selectedScaleIds,
    selectedSeriesIds,
    clearObjectFilters,
    clearSearchAndFilters,
    setSearchQueryClearingFilters,
    onToggleCategory,
    onToggleScale,
    onToggleSeries,
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

  const objectFilterKey = filterKeyFromIds(
    selectedCategoryIds,
    [],
    selectedScaleIds,
    selectedSeriesIds,
  );

  const objectsList = usePagedList(
    ({ size, page }) => getBrandObjectsPage(brandId, { size, page }),
    {
      resetKey: `brand-objects:${brandId}`,
      enabled: !searchActive,
      pageSize: PAGE_SIZE,
      pageParamKey: "page",
      reservedFirstPageSlots: isAdmin ? 1 : 0,
    },
  );

  const objectsSearch = usePagedList(
    ({ size, page }) =>
      searchBrandObjectsByBrandIdPage(brandId, searchKeyword, {
        size,
        page,
        categoryIds: selectedCategoryIds,
        scaleIds: selectedScaleIds,
        seriesIds: selectedSeriesIds,
      }),
    {
      resetKey: `brand-objects-search:${brandId}:${searchKeyword}:${objectFilterKey}`,
      enabled: searchActive && Boolean(searchKeyword),
      pageSize: PAGE_SIZE,
      pageParamKey: "page",
    },
  );

  const activePage = searchActive ? objectsSearch : objectsList;
  const displayObjects = activePage.items;
  const showAddCard =
    isAdmin && !searchActive && activePage.page === 0;
  const listData = showAddCard
    ? [{ id: "__add__" }, ...displayObjects]
    : displayObjects;

  const showObjectFilters =
    searchActive &&
    Boolean(searchKeyword) &&
    searchFacets != null &&
    ((searchFacets.categories?.length ?? 0) > 0 ||
      (searchFacets.scales?.length ?? 0) > 0 ||
      (searchFacets.series?.length ?? 0) > 0);

  const showFilterColumn = showObjectFilters || (searchActive && facetsLoading);

  const showSearchObjectsSection =
    searchActive &&
    (displayObjects.length > 0 || showFilterColumn || objectsSearch.loading);

  useEffect(() => {
    if (brand?.id === Number(brandId)) return;
    getBrandByBrandId(brandId)
      .then(setBrand)
      .catch((err) => message.error(err?.message || t("failedToLoadBrands")));
  }, [brandId, brand?.id, message, t]);

  useEffect(() => {
    if (isAdmin || !brandId) return;
    const key = `viewed:brand:${brandId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    recordBrandView(brandId);
  }, [brandId, isAdmin]);

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
    } else {
      syncedKeywordRef.current = "";
      setSearchKeyword("");
      setSearchActive(false);
      setSearchFacets(null);
      if (
        selectedCategoryIds.length > 0 ||
        selectedScaleIds.length > 0 ||
        selectedSeriesIds.length > 0
      ) {
        clearObjectFilters();
      }
    }
  }, [brandId, searchValue]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!searchActive || !searchKeyword) {
      setSearchFacets(null);
      return undefined;
    }

    let cancelled = false;
    setFacetsLoading(true);
    searchBrandObjectsByBrandIdFacets(brandId, searchKeyword, {
      categoryIds: selectedCategoryIds,
      scaleIds: selectedScaleIds,
      seriesIds: selectedSeriesIds,
    })
      .then((data) => {
        if (!cancelled) {
          setSearchFacets(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSearchFacets({ total: 0, categories: [], brands: [], scales: [], series: [] });
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
  }, [brandId, searchKeyword, objectFilterKey]);

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

  useLayoutEffect(() => {
    scrollAppToTop();
  }, [brandId]);

  useLayoutEffect(() => {
    setHeaderSlot(
      <BrandObjectsPageHeader
        brand={brand}
        returnSearch={returnSearchRef.current}
        isAdmin={isAdmin}
        onEditBrand={() => {
          setEditingBrand(brand);
          setBrandModalOpen(true);
        }}
        onDeleteBrand={handleAdminDeleteBrand}
      />,
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
        clearSearchAndFilters();
        setSearchActive(false);
        setSearchKeyword("");
        syncedKeywordRef.current = "";
        return;
      }
      setSearchQueryClearingFilters(trimmed);
      syncedKeywordRef.current = trimmed;
      setSearchKeyword(trimmed);
      setSearchActive(true);
    },
    [clearSearchAndFilters, setSearchQueryClearingFilters],
  );

  const objectCardBrandSubtitle = (obj) =>
    pickBrandName(obj, locale) || brand?.name;

  const spinning = searchActive
    ? objectsSearch.loading || facetsLoading
    : activePage.loading;

  return (
    <div>
      <div style={{ position: "relative", minHeight: 200, width: "100%" }}>
        <ObjectListPageLayout
            showFilterColumn={searchActive && showFilterColumn}
            summary={
              <SearchResultsSummary
                active={searchActive}
                keyword={searchKeyword}
                count={activePage.totalElements}
                exact={activePage.totalExact}
                loading={searchActive && activePage.loading}
              />
            }
            search={
            <Search
              id="brand-objects-search"
              name="brandObjectsSearch"
              placeholder={t("searchModels")}
              allowClear
              value={draftQuery}
              onChange={(e) => {
                const v = e.target.value;
                setDraftQuery(v);
                if (v === "") {
                  clearSearchAndFilters();
                  setSearchActive(false);
                  setSearchKeyword("");
                  syncedKeywordRef.current = "";
                }
              }}
              onSearch={(v) => {
                const keyword = (v ?? "").trim();
                setDraftQuery(keyword);
                runSearch(keyword);
              }}
            />
          }
          filter={
            searchActive && showFilterColumn ? (
              <ObjectSearchFilterPanel
                facets={searchFacets}
                loading={facetsLoading}
                selectedCategoryIds={selectedCategoryIds}
                selectedBrandIds={[]}
                selectedScaleIds={selectedScaleIds}
                selectedSeriesIds={selectedSeriesIds}
                onToggleCategory={onToggleCategory}
                onToggleBrand={() => {}}
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
                  selectedBrandIds={[]}
                  selectedScaleIds={selectedScaleIds}
                  selectedSeriesIds={selectedSeriesIds}
                  onToggleCategory={onToggleCategory}
                  onToggleBrand={() => {}}
                  onToggleScale={onToggleScale}
                  onToggleSeries={onToggleSeries}
                >
                  <NeuCardGridSkeleton
                    variant="object"
                    withFilter={showFilterColumn}
                    className="neu-search-section-grid"
                  />
                </ObjectSearchFilterLayout>
              ) : showSearchObjectsSection ? (
                <ObjectSearchFilterLayout
                  showFilterColumn={showFilterColumn}
                  facets={searchFacets}
                  loading={facetsLoading}
                  selectedCategoryIds={selectedCategoryIds}
                  selectedBrandIds={[]}
                  selectedScaleIds={selectedScaleIds}
                  selectedSeriesIds={selectedSeriesIds}
                  onToggleCategory={onToggleCategory}
                  onToggleBrand={() => {}}
                  onToggleScale={onToggleScale}
                  onToggleSeries={onToggleSeries}
                >
                  {displayObjects.map((item) => (
                    <NeuCard
                      key={item.id}
                      name={item.name}
                      subtitle={objectCardBrandSubtitle(item)}
                      nameplateVariant="object"
                      imageUrl={item.image_url}
                      onClick={() =>
                        navigate(`/brands/${brandId}/objects/${item.id}`, {
                          state: { brandObject: item, brand },
                        })
                      }
                    />
                  ))}
                </ObjectSearchFilterLayout>
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
              {spinning ? (
                <NeuCardGridSkeleton variant="object" />
              ) : (
                <div className="neu-list-page-browse-grid">
                  {listData.map((item) =>
                    item.id === "__add__" ? (
                      <NeuCard
                        key="__add__"
                        add
                        name={t("addBrandObject")}
                        onClick={() => {
                          setEditingBrandObject(null);
                          setBrandObjectModalOpen(true);
                        }}
                      />
                    ) : (
                      <NeuCard
                        key={item.id}
                        name={item.name}
                        subtitle={objectCardBrandSubtitle(item)}
                        nameplateVariant="object"
                        imageUrl={item.image_url}
                        onClick={() =>
                          navigate(`/brands/${brandId}/objects/${item.id}`, {
                            state: { brandObject: item, brand },
                          })
                        }
                      />
                    ),
                  )}
                </div>
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
          )}
          </ObjectListPageLayout>
      </div>

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
              fontSize: neuRem(13),
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
