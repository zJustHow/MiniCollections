import AdminBrandPageHeader from "../../components/pageHeaders/AdminBrandPageHeader";
import AdminDeleteAction from "../../components/admin/AdminDeleteAction";
import AdminEditButton from "../../components/admin/AdminEditButton";
import AdminTableActions, {
  adminTableActionsCellProps,
} from "../../components/admin/AdminTableActions";
import { App, Table } from "antd";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useAdminLayoutContext } from "./AdminLayout";
import { adminDeleteScale } from "../../utils/adminApi";
import { getScales } from "../../utils/brandsApi";
import { useLocale } from "../../LocaleContext";
import { useHeader } from "../../HeaderContext";
import { createLazyModal } from "../../utils/lazyModal";
import { scrollAppToTop } from "../../utils/scroll";
import AdminTableSkeleton from "../../components/AdminTableSkeleton";

const ScaleModal = createLazyModal(
  () => import("../../components/ObjectList/modals/ScaleModal"),
);

function sortScales(items) {
  return [...items].sort((a, b) => {
    const denomDiff = (a.denominator ?? 0) - (b.denominator ?? 0);
    return denomDiff !== 0 ? denomDiff : (a.id ?? 0) - (b.id ?? 0);
  });
}

export default function AdminScalesPage() {
  const { message } = App.useApp();
  const { t } = useLocale();
  const { navigateAdmin } = useAdminLayoutContext();
  const { setHeaderSlot } = useHeader();
  const [scales, setScales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScale, setEditingScale] = useState(null);

  const loadScales = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getScales();
      setScales(sortScales(Array.isArray(data) ? data : []));
    } catch (err) {
      message.error(err?.message || t("failedToLoadScales"));
    } finally {
      setLoading(false);
    }
  }, [message, t]);

  const handleDeleteScale = async (scale) => {
    try {
      await adminDeleteScale(scale.id);
      message.success(t("scaleDeleted"));
      loadScales();
    } catch (err) {
      message.error(err?.message || t("failedToDeleteScale"));
    }
  };

  useLayoutEffect(() => {
    scrollAppToTop();
  }, []);

  useEffect(() => {
    loadScales();
  }, [loadScales]);

  useLayoutEffect(() => {
    setHeaderSlot(
      <AdminBrandPageHeader
        brandName={t("scales")}
        addAriaLabel={t("addScale")}
        onBack={() => navigateAdmin("/admin")}
        onAdd={() => {
          setEditingScale(null);
          setModalOpen(true);
        }}
      />,
    );
    return () => setHeaderSlot(null);
  }, [navigateAdmin, setHeaderSlot, t]);

  const columns = [
    { title: "#", dataIndex: "id", width: 60 },
    { title: t("scale"), dataIndex: "code", ellipsis: true },
    { title: t("denominator"), dataIndex: "denominator", width: 120 },
    {
      title: "",
      key: "actions",
      width: 80,
      onCell: adminTableActionsCellProps,
      render: (_, record) => (
        <AdminTableActions>
          <AdminEditButton
            onClick={() => {
              setEditingScale(record);
              setModalOpen(true);
            }}
          />
          <AdminDeleteAction onConfirm={() => handleDeleteScale(record)} />
        </AdminTableActions>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      {loading ? (
        <AdminTableSkeleton columns={4} rows={10} />
      ) : (
        <div className="neu-panel">
          <Table
            rowKey="id"
            dataSource={scales}
            columns={columns}
            size="middle"
            pagination={false}
          />
        </div>
      )}
      <ScaleModal
        open={modalOpen}
        scale={editingScale}
        onClose={() => {
          setModalOpen(false);
          setEditingScale(null);
        }}
        onSuccess={loadScales}
      />
    </div>
  );
}
