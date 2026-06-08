import ListPagination from "../../components/ListPagination";
import AdminBrandPageHeader from "../../components/pageHeaders/AdminBrandPageHeader";
import AdminDeleteAction from "../../components/admin/AdminDeleteAction";
import AdminEditButton from "../../components/admin/AdminEditButton";
import AdminTableActions, {
  adminTableActionsCellProps,
} from "../../components/admin/AdminTableActions";
import { App, Table } from "antd";
import { useCallback, useLayoutEffect, useState } from "react";
import { useAdminLayoutContext } from "./AdminLayout";
import { adminDeleteBrand, getBrandsPage, SELECT_PAGE_SIZE } from "../../utils";
import { useLocale } from "../../LocaleContext";
import { useHeader } from "../../HeaderContext";
import BrandModal from "../../components/ObjectList/modals/BrandModal";
import usePagedList from "../../hooks/usePagedList";
import { scrollAppToTop } from "../../utils/scroll";
import AdminTableSkeleton from "../../components/AdminTableSkeleton";

export default function AdminBrandsPage() {
  const { message } = App.useApp();
  const { t } = useLocale();
  const { navigateAdmin } = useAdminLayoutContext();
  const { setHeaderSlot } = useHeader();
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const fetchBrandsPage = useCallback(
    ({ size, page }) => getBrandsPage({ size, page }),
    [],
  );

  const {
    items: brands,
    page,
    totalPages,
    loading,
    loadPage,
    onPageChange,
  } = usePagedList(fetchBrandsPage, {
    resetKey: "admin-brands",
    pageSize: SELECT_PAGE_SIZE,
  });

  const refreshBrands = useCallback(() => {
    loadPage(page);
  }, [loadPage, page]);

  const handleDeleteBrand = async (brand) => {
    try {
      await adminDeleteBrand(brand.id);
      message.success(t("brandDeleted"));
      refreshBrands();
    } catch (err) {
      message.error(err?.message || t("failedToDeleteBrand"));
    }
  };

  useLayoutEffect(() => {
    scrollAppToTop();
  }, []);

  useLayoutEffect(() => {
    setHeaderSlot(
      <AdminBrandPageHeader
        brandName={t("brands")}
        onBack={() => navigateAdmin("/admin")}
        onAdd={() => {
          setEditingBrand(null);
          setBrandModalOpen(true);
        }}
      />,
    );
    return () => setHeaderSlot(null);
  }, [navigateAdmin, setHeaderSlot, t]);

  const columns = [
    { title: "#", dataIndex: "id", width: 60 },
    { title: t("nameEn"), dataIndex: "name_en", ellipsis: true },
    {
      title: "",
      key: "actions",
      width: 80,
      onCell: adminTableActionsCellProps,
      render: (_, record) => (
        <AdminTableActions>
          <AdminEditButton
            onClick={() => { setEditingBrand(record); setBrandModalOpen(true); }}
          />
          <AdminDeleteAction onConfirm={() => handleDeleteBrand(record)} />
        </AdminTableActions>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      {loading ? (
        <AdminTableSkeleton columns={3} rows={10} />
      ) : (
        <div className="neu-panel">
          <Table
            rowKey="id"
            dataSource={brands}
            columns={columns}
            size="middle"
            pagination={false}
            onRow={(record) => ({
              onClick: () =>
                navigateAdmin(String(record.id), { state: { brand: record } }),
              style: { cursor: "pointer" },
            })}
          />
        </div>
      )}
      <ListPagination
        page={page}
        totalPages={totalPages}
        loading={loading}
        onPageChange={onPageChange}
      />
      <BrandModal
        open={brandModalOpen}
        brand={editingBrand}
        onClose={() => { setBrandModalOpen(false); setEditingBrand(null); }}
        onSuccess={refreshBrands}
      />
    </div>
  );
}
