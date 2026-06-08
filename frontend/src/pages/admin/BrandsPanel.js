import NeuButton from "../../components/NeuButton";
import ListPagination from "../../components/ListPagination";
import AdminDeleteAction from "../../components/admin/AdminDeleteAction";
import AdminEditButton from "../../components/admin/AdminEditButton";
import { App, Space, Table } from "antd";
import { PlusOutlined, TagsOutlined } from "@ant-design/icons";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminDeleteBrand, getBrandsPage, SELECT_PAGE_SIZE } from "../../utils";
import { useLocale } from "../../LocaleContext";
import BrandModal from "../../components/ObjectList/modals/BrandModal";
import usePagedList from "../../hooks/usePagedList";

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

  const columns = [
    { title: "#", dataIndex: "id", width: 60 },
    { title: t("nameEn"), dataIndex: "name_en", ellipsis: true },
    {
      title: "",
      key: "actions",
      width: 130,
      onCell: () => ({
        onClick: (event) => event.stopPropagation(),
        onMouseDown: (event) => event.stopPropagation(),
      }),
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
          <AdminDeleteAction onConfirm={() => handleDeleteBrand(record)} />
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
        pagination={false}
      />
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
    </>
  );
}
