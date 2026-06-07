import NeuButton from "../../components/NeuButton";
import AdminDeleteAction from "../../components/admin/AdminDeleteAction";
import AdminEditButton from "../../components/admin/AdminEditButton";
import { App, Space, Table } from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  adminDeleteBrandObject,
  getBrandByBrandId,
  getBrandObjectsPage,
} from "../../utils";
import { useLocale } from "../../LocaleContext";
import { radius } from "../../theme/radius";
import usePagedList from "../../hooks/usePagedList";
import BrandObjectModal from "../../components/ObjectList/modals/BrandObjectModal";
import SeriesModal from "../../components/ObjectList/modals/SeriesModal";

const ADMIN_TABLE_PAGE_SIZE = 20;

export default function AdminBrandObjectsPage() {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const { t } = useLocale();
  const [brand, setBrand] = useState(location.state?.brand ?? null);
  const [objectModalOpen, setObjectModalOpen] = useState(false);
  const [editingObject, setEditingObject] = useState(null);
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);
  const [seriesRefreshKey, setSeriesRefreshKey] = useState(0);

  useEffect(() => {
    if (!brandId) return;
    if (brand?.id === Number(brandId)) return;
    getBrandByBrandId(brandId)
      .then(setBrand)
      .catch(() => setBrand(null));
  }, [brandId, brand?.id]);

  const fetchPage = useCallback(
    ({ size, page }) => getBrandObjectsPage(brandId, { size, page }),
    [brandId],
  );

  const {
    items: objects,
    page: objectsPage,
    totalElements,
    loading,
    loadPage,
    onPageChange,
  } = usePagedList(fetchPage, {
    resetKey: `admin-brand-objects:${brandId}`,
    enabled: Boolean(brandId),
    pageSize: ADMIN_TABLE_PAGE_SIZE,
  });

  const refreshObjects = useCallback(() => {
    loadPage(objectsPage);
  }, [loadPage, objectsPage]);

  const handleDeleteObject = async (obj) => {
    try {
      await adminDeleteBrandObject(obj.id);
      message.success(t("brandObjectDeleted"));
      refreshObjects();
    } catch (err) {
      message.error(err?.message || t("failedToDeleteBrandObject"));
    }
  };

  const columns = [
    { title: "#", dataIndex: "id", width: 60 },
    { title: t("nameEn"), dataIndex: "name_en", ellipsis: true },
    { title: t("nameZh"), dataIndex: "name_zh", ellipsis: true, width: 120 },
    { title: t("scale"), dataIndex: "scale", width: 80 },
    { title: t("category"), dataIndex: "category", width: 100, ellipsis: true },
    { title: t("releaseDate"), dataIndex: "release_date", width: 110 },
    { title: t("series"), dataIndex: "series", width: 100, ellipsis: true },
    {
      title: "",
      key: "actions",
      width: 90,
      render: (_, record) => (
        <Space size={4}>
          <AdminEditButton
            onClick={() => {
              setEditingObject(record);
              setObjectModalOpen(true);
            }}
          />
          <AdminDeleteAction
            title={t("deleteBrandObjectTitle")}
            description={t("deleteBrandObjectContent").replace(
              "{name}",
              record.name_en
            )}
            onConfirm={() => handleDeleteObject(record)}
          />
        </Space>
      ),
    },
  ];

  const brandName = brand?.name_en ?? brand?.name ?? "—";

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <NeuButton
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              navigate("/admin", { state: { adminView: "brands" } })
            }
          />
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              color: "var(--neu-text)",
            }}
          >
            {brandName} — {t("brandObjects")}
          </h2>
        </div>
        <Space>
          <NeuButton onClick={() => setSeriesModalOpen(true)}>
            {t("addSeries")}
          </NeuButton>
          <NeuButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingObject(null);
              setObjectModalOpen(true);
            }}
          >
            {t("addBrandObject")}
          </NeuButton>
        </Space>
      </div>

      <div
        style={{
          borderRadius: radius.card,
          padding: 24,
          boxShadow: "var(--inset)",
        }}
      >
        <Table
          rowKey="id"
          dataSource={objects}
          columns={columns}
          loading={loading}
          size="middle"
          pagination={{
            current: objectsPage + 1,
            pageSize: ADMIN_TABLE_PAGE_SIZE,
            total: totalElements,
            showSizeChanger: false,
            onChange: (page) => onPageChange(page),
          }}
        />
      </div>

      <BrandObjectModal
        open={objectModalOpen}
        brandObject={editingObject}
        brandId={brand?.id ?? Number(brandId)}
        seriesRefreshKey={seriesRefreshKey}
        onClose={() => {
          setObjectModalOpen(false);
          setEditingObject(null);
        }}
        onSuccess={refreshObjects}
      />
      <SeriesModal
        open={seriesModalOpen}
        brandId={brand?.id ?? Number(brandId)}
        onClose={() => setSeriesModalOpen(false)}
        onSuccess={() => setSeriesRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
