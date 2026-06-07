import NeuButton from "../../components/NeuButton";
import AdminDeleteAction from "../../components/admin/AdminDeleteAction";
import AdminEditButton from "../../components/admin/AdminEditButton";
import { App, Space, Table } from "antd";
import { PlusOutlined, TagsOutlined } from "@ant-design/icons";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminDeleteBrand, getBrandsPage, SELECT_PAGE_SIZE } from "../../utils";
import { useLocale } from "../../LocaleContext";
import GroovedImage from "../../components/GroovedImage";
import BrandModal from "../../components/ObjectList/modals/BrandModal";
import usePagedList from "../../hooks/usePagedList";
import { neuRem } from "../../theme/fontScale";

export default function BrandsPanel() {
  const { message } = App.useApp();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const fetchBrandsPage = useCallback(
    ({ size, page }) => getBrandsPage({ size, page }),
    [],
  );

  const {
    items: brands,
    page,
    totalElements,
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

  const columns = [
    { title: "#", dataIndex: "id", width: 60 },
    {
      title: t("image"),
      dataIndex: "image_url",
      width: 60,
      render: (url, record) => url
        ? (
          <div className="admin-table-logo">
            <GroovedImage
              imageUrl={url}
              alt={record.name_en ? `${record.name_en} ${t("brandLogo")}` : t("brandLogo")}
              fixedGroove
              wellClassName="neu-card-image-well neu-card-image-well--logo"
              placeholderSize={16}
            />
          </div>
        )
        : <span style={{ color: "var(--neu-text-2)", fontSize: neuRem(12) }}>—</span>,
    },
    { title: t("nameEn"), dataIndex: "name_en", ellipsis: true },
    { title: t("nameZh"), dataIndex: "name_zh", ellipsis: true, width: 140 },
    {
      title: "",
      key: "actions",
      width: 130,
      render: (_, record) => (
        <Space size={4}>
          <NeuButton
            size="small"
            icon={<TagsOutlined />}
            onClick={() =>
              navigate(`/admin/brands/${record.id}`, { state: { brand: record } })
            }
          >
            {t("viewObjects")}
          </NeuButton>
          <AdminEditButton
            onClick={() => { setEditingBrand(record); setBrandModalOpen(true); }}
          />
          <AdminDeleteAction
            title={t("deleteBrandTitle")}
            description={t("deleteBrandContent").replace("{name}", record.name_en ?? record.name ?? "—")}
            onConfirm={() => handleDeleteBrand(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <NeuButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingBrand(null); setBrandModalOpen(true); }}
        >
          {t("addBrand")}
        </NeuButton>
      </div>
      <Table
        rowKey="id"
        dataSource={brands}
        columns={columns}
        loading={loading}
        size="middle"
        pagination={{
          current: page + 1,
          total: totalElements,
          pageSize: SELECT_PAGE_SIZE,
          onChange: onPageChange,
          showSizeChanger: false,
        }}
      />
      <BrandModal
        open={brandModalOpen}
        brand={editingBrand}
        onClose={() => { setBrandModalOpen(false); setEditingBrand(null); }}
        onSuccess={refreshBrands}
      />
    </>
  );
}
