import ListPagination from "../../components/ListPagination";
import AdminBrandPageHeader from "../../components/pageHeaders/AdminBrandPageHeader";
import AdminDeleteAction from "../../components/admin/AdminDeleteAction";
import AdminEditButton from "../../components/admin/AdminEditButton";
import AdminTableActions, {
  adminTableActionsCellProps,
} from "../../components/admin/AdminTableActions";
import { App, Table } from "antd";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getBrandByBrandId, getBrandObjectsPage } from "../../utils/brandsApi";
import { adminDeleteBrandObject } from "../../utils/adminApi";
import { useLocale } from "../../LocaleContext";
import { useHeader } from "../../HeaderContext";
import usePagedList from "../../hooks/usePagedList";
import { createLazyModal } from "../../utils/lazyModal";

const BrandObjectModal = createLazyModal(
  () => import("../../components/ObjectList/modals/BrandObjectModal"),
);
import AdminBrandAddDrawer from "./AdminBrandAddDrawer";
import { useAdminLayoutContext } from "./AdminLayout";
import { scrollAppToTop } from "../../utils/scroll";
import AdminTableSkeleton from "../../components/AdminTableSkeleton";

const ADMIN_TABLE_PAGE_SIZE = 20;

export default function AdminBrandObjectsPage() {
  const { brandId } = useParams();
  const location = useLocation();
  const { navigateAdmin } = useAdminLayoutContext();
  const { message } = App.useApp();
  const { t } = useLocale();
  const { setHeaderSlot } = useHeader();
  const [brand, setBrand] = useState(location.state?.brand ?? null);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [objectModalOpen, setObjectModalOpen] = useState(false);
  const [editingObject, setEditingObject] = useState(null);
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
    totalPages,
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

  const brandName = brand?.name_en ?? brand?.name ?? "…";

  useLayoutEffect(() => {
    scrollAppToTop();
  }, [brandId]);

  useLayoutEffect(() => {
    setHeaderSlot(
      <AdminBrandPageHeader
        brandName={brandName}
        onBack={() => navigateAdmin("/admin/brands")}
        onAdd={() => setAddDrawerOpen(true)}
      />,
    );
    return () => setHeaderSlot(null);
  }, [brandName, navigateAdmin, setHeaderSlot]);

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
      onCell: adminTableActionsCellProps,
      render: (_, record) => (
        <AdminTableActions>
          <AdminEditButton
            onClick={() => {
              setEditingObject(record);
              setObjectModalOpen(true);
            }}
          />
          <AdminDeleteAction onConfirm={() => handleDeleteObject(record)} />
        </AdminTableActions>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      {loading ? (
        <AdminTableSkeleton columns={8} rows={10} />
      ) : (
        <div className="neu-panel">
          <Table
            rowKey="id"
            dataSource={objects}
            columns={columns}
            size="middle"
            pagination={false}
          />
        </div>
      )}
      <ListPagination
        page={objectsPage}
        totalPages={totalPages}
        loading={loading}
        onPageChange={onPageChange}
      />

      <AdminBrandAddDrawer
        open={addDrawerOpen}
        brandId={brand?.id ?? Number(brandId)}
        onClose={() => setAddDrawerOpen(false)}
        onObjectSuccess={refreshObjects}
        onSeriesSuccess={() => setSeriesRefreshKey((k) => k + 1)}
      />

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
    </div>
  );
}
