import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useSearchParam from "../hooks/useSearchParam";
import useObjectFilterParams from "../hooks/useObjectFilterParams";
import useReturnSearchRef from "../hooks/useReturnSearchRef";
import useObjectListPageSearch from "../hooks/useObjectListPageSearch";
import useDualModePagedList from "../hooks/useDualModePagedList";
import useSearchObjectFacets from "../hooks/useSearchObjectFacets";
import { App } from "antd";
import NeuCard from "../components/NeuCard";
import BrandObjectsPageHeader from "../components/pageHeaders/BrandObjectsPageHeader";
import ObjectListPageShell from "../components/listPage/ObjectListPageShell";
import NoSearchResults from "../components/listPage/NoSearchResults";
import ObjectBrowseSection from "../components/listPage/ObjectBrowseSection";
import ActivePagePagination from "../components/listPage/ActivePagePagination";
import FilteredObjectSearchSection from "../components/listPage/FilteredObjectSearchSection";
import ObjectSearchFilterPanelSlot from "../components/listPage/ObjectSearchFilterPanelSlot";
import { filterKeyFromIds } from "../utils/filterParams";
import {
  buildFilterLayoutProps,
  resolveFilterColumnState,
} from "../utils/objectFilterUtils";
import { withAddCardSlot } from "../utils/listPageUtils";
import { createLazyModal } from "../utils/lazyModal";
import { useLocale } from "../LocaleContext";
import { useHeader } from "../HeaderContext";
import { pickBrandName } from "../utils/displayLocale";
import { PAGE_SIZE } from "../utils/apiClient";
import {
  getBrandByBrandId,
  getBrandObjectsPage,
  searchBrandObjectsByBrandIdPage,
  searchBrandObjectsByBrandIdFacets,
  recordBrandView,
} from "../utils/brandsApi";
import { adminDeleteBrand } from "../utils/adminApi";
import { scrollAppToTop } from "../utils/scroll";
import { neuRem } from "../theme/fontScale";

const SubmitObjectModal = createLazyModal(
  () => import("../components/ObjectList/modals/SubmitObjectModal"),
);
const BrandModal = createLazyModal(
  () => import("../components/ObjectList/modals/BrandModal"),
);
const BrandObjectModal = createLazyModal(
  () => import("../components/ObjectList/modals/BrandObjectModal"),
);

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
  const returnSearchRef = useReturnSearchRef(location.state?.returnSearch);

  const onSearchCleared = useCallback(() => {
    if (
      selectedCategoryIds.length > 0 ||
      selectedScaleIds.length > 0 ||
      selectedSeriesIds.length > 0
    ) {
      clearObjectFilters();
    }
  }, [
    selectedCategoryIds,
    selectedScaleIds,
    selectedSeriesIds,
    clearObjectFilters,
  ]);

  const {
    searchActive,
    searchKeyword,
    draftQuery,
    runSearch,
    handleDraftChange,
  } = useObjectListPageSearch({
    entityKey: brandId,
    searchValue,
    applySearch: setSearchQueryClearingFilters,
    clearSearch: clearSearchAndFilters,
    onFiltersReset: clearObjectFilters,
    onSearchCleared,
    resetFiltersOnKeywordChange: true,
  });

  const objectFilterKey = filterKeyFromIds(
    selectedCategoryIds,
    [],
    selectedScaleIds,
    selectedSeriesIds,
  );

  const { activePage, displayObjects, objectsSearch } = useDualModePagedList({
    entityKey: brandId,
    searchActive,
    searchKeyword,
    pageSize: PAGE_SIZE,
    listResetKey: "brand-objects",
    searchResetKey: "brand-objects-search",
    searchResetExtra: `:${objectFilterKey}`,
    fetchListPage: ({ size, page }) =>
      getBrandObjectsPage(brandId, { size, page }),
    fetchSearchPage: ({ size, page }) =>
      searchBrandObjectsByBrandIdPage(brandId, searchKeyword, {
        size,
        page,
        categoryIds: selectedCategoryIds,
        scaleIds: selectedScaleIds,
        seriesIds: selectedSeriesIds,
      }),
    listOptions: { reservedFirstPageSlots: isAdmin ? 1 : 0 },
  });

  const { searchFacets, facetsLoading } = useSearchObjectFacets({
    enabled: searchActive && Boolean(searchKeyword),
    fetchFacets: () =>
      searchBrandObjectsByBrandIdFacets(brandId, searchKeyword, {
        categoryIds: selectedCategoryIds,
        scaleIds: selectedScaleIds,
        seriesIds: selectedSeriesIds,
      }),
    deps: [brandId, searchKeyword, objectFilterKey],
  });

  const { showFilterColumn } = resolveFilterColumnState({
    searchActive,
    searchKeyword,
    searchFacets,
    facetsLoading,
    includeBrands: false,
  });

  const listData = withAddCardSlot(
    displayObjects,
    isAdmin && !searchActive && activePage.page === 0,
  );

  const showSearchObjectsSection =
    searchActive &&
    (displayObjects.length > 0 ||
      showFilterColumn ||
      objectsSearch.loading);

  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandObjectModalOpen, setBrandObjectModalOpen] = useState(false);
  const [editingBrandObject, setEditingBrandObject] = useState(null);

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

  const objectCardBrandSubtitle = (obj) =>
    pickBrandName(obj, locale) || brand?.name;

  const renderObjectCard = (item) => (
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
  );

  const filterLayoutProps = buildFilterLayoutProps({
    showFilterColumn,
    searchFacets,
    facetsLoading,
    selectedCategoryIds,
    selectedScaleIds,
    selectedSeriesIds,
    onToggleCategory,
    onToggleScale,
    onToggleSeries,
  });

  const spinning = searchActive
    ? objectsSearch.loading || facetsLoading
    : activePage.loading;

  return (
    <div>
      <ObjectListPageShell
        framed
        showFilterColumn={searchActive && showFilterColumn}
        searchActive={searchActive}
        searchKeyword={searchKeyword}
        resultPage={activePage}
        searchFieldId="brand-objects-search"
        searchFieldName="brandObjectsSearch"
        searchPlaceholder={t("searchModels")}
        draftQuery={draftQuery}
        onDraftChange={handleDraftChange}
        onSearch={runSearch}
        filter={
          <ObjectSearchFilterPanelSlot
            visible={searchActive && showFilterColumn}
            facets={searchFacets}
            loading={facetsLoading}
            selectedCategoryIds={selectedCategoryIds}
            selectedScaleIds={selectedScaleIds}
            selectedSeriesIds={selectedSeriesIds}
            onToggleCategory={onToggleCategory}
            onToggleScale={onToggleScale}
            onToggleSeries={onToggleSeries}
          />
        }
      >
          {searchActive ? (
            <>
              <FilteredObjectSearchSection
                filterLayoutProps={filterLayoutProps}
                loading={spinning}
                showContent={showSearchObjectsSection}
              >
                {displayObjects.map(renderObjectCard)}
              </FilteredObjectSearchSection>
              {!spinning && !showSearchObjectsSection && !objectsSearch.loading && (
                <NoSearchResults />
              )}
              <ActivePagePagination activePage={activePage} />
            </>
          ) : (
            <>
              <ObjectBrowseSection loading={spinning}>
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
                    renderObjectCard(item)
                  ),
                )}
              </ObjectBrowseSection>
              <ActivePagePagination activePage={activePage} />
            </>
          )}
      </ObjectListPageShell>

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
