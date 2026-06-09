import AdminBrandPageHeader from "../../components/pageHeaders/AdminBrandPageHeader";
import AdminDeleteAction from "../../components/admin/AdminDeleteAction";
import AdminEditButton from "../../components/admin/AdminEditButton";
import AdminTableActions, {
  adminTableActionsCellProps,
} from "../../components/admin/AdminTableActions";
import { App, Table } from "antd";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useAdminLayoutContext } from "./AdminLayout";
import { adminDeleteCategory } from "../../utils/adminApi";
import { getCategories } from "../../utils/brandsApi";
import { useLocale } from "../../LocaleContext";
import { useHeader } from "../../HeaderContext";
import { createLazyModal } from "../../utils/lazyModal";
import { scrollAppToTop } from "../../utils/scroll";
import AdminTableSkeleton from "../../components/AdminTableSkeleton";

const CategoryModal = createLazyModal(
  () => import("../../components/ObjectList/modals/CategoryModal"),
);

function sortCategories(items) {
  return [...items].sort((a, b) => {
    const orderDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    return orderDiff !== 0 ? orderDiff : (a.id ?? 0) - (b.id ?? 0);
  });
}

export default function AdminCategoriesPage() {
  const { message } = App.useApp();
  const { t } = useLocale();
  const { navigateAdmin } = useAdminLayoutContext();
  const { setHeaderSlot } = useHeader();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(sortCategories(Array.isArray(data) ? data : []));
    } catch (err) {
      message.error(err?.message || t("failedToLoadCategories"));
    } finally {
      setLoading(false);
    }
  }, [message, t]);

  const handleDeleteCategory = async (category) => {
    try {
      await adminDeleteCategory(category.id);
      message.success(t("categoryDeleted"));
      loadCategories();
    } catch (err) {
      message.error(err?.message || t("failedToDeleteCategory"));
    }
  };

  useLayoutEffect(() => {
    scrollAppToTop();
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useLayoutEffect(() => {
    setHeaderSlot(
      <AdminBrandPageHeader
        brandName={t("categories")}
        addAriaLabel={t("addCategory")}
        onBack={() => navigateAdmin("/admin")}
        onAdd={() => {
          setEditingCategory(null);
          setModalOpen(true);
        }}
      />,
    );
    return () => setHeaderSlot(null);
  }, [navigateAdmin, setHeaderSlot, t]);

  const columns = [
    { title: "#", dataIndex: "id", width: 60 },
    { title: t("slug"), dataIndex: "slug", ellipsis: true },
    { title: t("nameEn"), dataIndex: "name_en", ellipsis: true },
    { title: t("nameZh"), dataIndex: "name_zh", ellipsis: true },
    { title: t("sortOrder"), dataIndex: "sort_order", width: 100 },
    {
      title: "",
      key: "actions",
      width: 80,
      onCell: adminTableActionsCellProps,
      render: (_, record) => (
        <AdminTableActions>
          <AdminEditButton
            onClick={() => {
              setEditingCategory(record);
              setModalOpen(true);
            }}
          />
          <AdminDeleteAction onConfirm={() => handleDeleteCategory(record)} />
        </AdminTableActions>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      {loading ? (
        <AdminTableSkeleton columns={6} rows={10} />
      ) : (
        <div className="neu-panel">
          <Table
            rowKey="id"
            dataSource={categories}
            columns={columns}
            size="middle"
            pagination={false}
          />
        </div>
      )}
      <CategoryModal
        open={modalOpen}
        category={editingCategory}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={loadCategories}
      />
    </div>
  );
}
