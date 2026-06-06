import NeuButton, { neuBtnProps } from "../../components/NeuButton";
import { App, Popconfirm, Space, Table } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, TagsOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminDeleteBrand } from "../../utils";
import { useLocale } from "../../LocaleContext";
import { radius } from "../../theme/radius";
import BrandModal from "../../components/ObjectList/modals/BrandModal";

export default function BrandsPanel({ brands, onBrandsChanged }) {
  const { message } = App.useApp();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const handleDeleteBrand = async (brand) => {
    try {
      await adminDeleteBrand(brand.id);
      message.success(t("brandDeleted"));
      onBrandsChanged();
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
      render: (url) => url
        ? <img src={url} alt="" style={{ width: 36, height: 36, objectFit: "contain", borderRadius: radius.sm }} />
        : <span style={{ color: "var(--neu-text-2)", fontSize: 12 }}>—</span>,
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
          <NeuButton
            size="small"
            icon={<EditOutlined />}
            onClick={() => { setEditingBrand(record); setBrandModalOpen(true); }}
          />
          <Popconfirm
            title={t("deleteBrandTitle")}
            description={t("deleteBrandContent").replace("{name}", record.name_en)}
            onConfirm={() => handleDeleteBrand(record)}
            okText={t("delete")}
            okButtonProps={neuBtnProps({ danger: true })}
            cancelButtonProps={neuBtnProps()}
            cancelText={t("cancel")}
          >
            <NeuButton size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
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
        size="middle"
        pagination={{ pageSize: 20, showSizeChanger: false }}
      />
      <BrandModal
        open={brandModalOpen}
        brand={editingBrand}
        onClose={() => { setBrandModalOpen(false); setEditingBrand(null); }}
        onSuccess={() => { onBrandsChanged(); }}
      />
    </>
  );
}
