import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useSearchParam from "../hooks/useSearchParam";
import useInfiniteSlice from "../hooks/useInfiniteSlice";
import { App, Button, Card, Grid, Input, Popconfirm, Spin } from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import CardCover from "../components/ObjectList/CardCover";
import InfiniteSliceFooter from "../components/InfiniteSliceFooter";
import SubmitObjectModal from "../components/ObjectList/modals/SubmitObjectModal";
import BrandModal from "../components/ObjectList/modals/BrandModal";
import BrandObjectModal from "../components/ObjectList/modals/BrandObjectModal";
import { useLocale } from "../LocaleContext";
import { useHeader } from "../HeaderContext";
import {
  getBrandByBrandId,
  getBrandObjectsSlice,
  searchBrandObjectsByBrandIdSlice,
  adminDeleteBrand,
  SLICE_SIZE,
} from "../utils";

const { Search } = Input;
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
  const [brand, setBrand] = useState(location.state?.brand ?? null);
  const [searchActive, setSearchActive] = useState(Boolean((searchValue ?? "").trim()));
  const [searchKeyword, setSearchKeyword] = useState((searchValue ?? "").trim());
  const [draftQuery, setDraftQuery] = useState(searchValue);

  const [submitModalVisible, setSubmitModalVisible] = useState(false);

  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [brandObjectModalOpen, setBrandObjectModalOpen] = useState(false);
  const [editingBrandObject, setEditingBrandObject] = useState(null);

  const objectsList = useInfiniteSlice(
    ({ size, cursor }) => getBrandObjectsSlice(brandId, { size, cursor }),
    {
      resetKey: `brand-objects:${brandId}`,
      enabled: !searchActive,
      pageSize: SLICE_SIZE,
    },
  );

  const objectsSearch = useInfiniteSlice(
    ({ size, cursor }) =>
      searchBrandObjectsByBrandIdSlice(brandId, searchKeyword, { size, cursor }),
    {
      resetKey: `brand-objects-search:${brandId}:${searchKeyword}`,
      enabled: searchActive && Boolean(searchKeyword),
      pageSize: SLICE_SIZE,
    },
  );

  const activeSlice = searchActive ? objectsSearch : objectsList;
  const displayObjects = activeSlice.items;
  const showAddCard = isAdmin && !searchActive;
  const listData = showAddCard ? [{ id: "__add__" }, ...displayObjects] : displayObjects;

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
      setDraftQuery(keyword);
      setSearchKeyword(keyword);
      setSearchActive(true);
    }
  }, [brandId, searchValue]);

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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")} />
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
    activeSlice.loadInitial();
  }, [activeSlice]);

  const runSearch = useCallback(
    (keyword) => {
      const trimmed = keyword.trim();
      if (!trimmed) {
        setSearchActive(false);
        setSearchKeyword("");
        setSearchParam("");
        return;
      }
      setSearchParam(trimmed);
      setSearchKeyword(trimmed);
      setSearchActive(true);
    },
    [setSearchParam],
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

      <Spin spinning={activeSlice.loading && displayObjects.length === 0}>
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
                    <div className="neu-nameplate">{t("addBrandObject")}</div>
                  </div>
                }
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
                className="neu-model-card"
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

        <InfiniteSliceFooter
          hasMore={activeSlice.hasMore}
          loading={activeSlice.loading}
          loadingMore={activeSlice.loadingMore}
          onLoadMore={activeSlice.loadMore}
          itemCount={displayObjects.length}
          totalElements={searchActive ? activeSlice.totalElements : null}
          totalExact={activeSlice.totalExact}
        />
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
