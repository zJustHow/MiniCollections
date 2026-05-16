import { App, Button, Drawer, Popconfirm, Space, Table } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { adminDeleteBrandObject, getBrandObjectsByBrandId } from "../../utils";
import { useLocale } from "../../LocaleContext";
import BrandObjectModal from "../../components/ObjectList/modals/BrandObjectModal";

export default function BrandObjectsDrawer({ brand, onClose, onBrandObjectsChanged }) {
  const { message } = App.useApp();
  const { t } = useLocale();
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [objectModalOpen, setObjectModalOpen] = useState(false);
  const [editingObject, setEditingObject] = useState(null);

  const fetchObjects = async () => {
    if (!brand) return;
    setLoading(true);
    try {
      const data = await getBrandObjectsByBrandId(brand.id);
      setObjects(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(err?.message || t("failedToLoadBrandObjects"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brand) fetchObjects();
    else setObjects([]);
  }, [brand]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteObject = async (obj) => {
    try {
      await adminDeleteBrandObject(obj.id);
      message.success(t("brandObjectDeleted"));
      fetchObjects();
      onBrandObjectsChanged?.();
    } catch (err) {
      message.error(err?.message || t("failedToDeleteBrandObject"));
    }
  };

  const columns = [
    { title: "#", dataIndex: "id", width: 60 },
    { title: t("nameEn"), dataIndex: "name_en", ellipsis: true },
    { title: t("nameZh"), dataIndex: "name_zh", ellipsis: true, width: 120 },
    { title: t("scale"), dataIndex: "scale", width: 80 },
    { title: t("category"), dataIndex: "category_en", width: 100, ellipsis: true },
    { title: t("releaseDate"), dataIndex: "release_date", width: 110 },
    {
      title: "",
      key: "actions",
      width: 90,
      render: (_, record) => (
        <Space size={4}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => { setEditingObject(record); setObjectModalOpen(true); }}
          />
          <Popconfirm
            title={t("deleteBrandObjectTitle")}
            description={t("deleteBrandObjectContent").replace("{name}", record.name_en)}
            onConfirm={() => handleDeleteObject(record)}
            okText={t("delete")}
            okButtonProps={{ danger: true }}
            cancelText={t("cancel")}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Drawer
        title={brand ? `${brand.name_en} — ${t("brandObjects")}` : ""}
        open={!!brand}
        onClose={onClose}
        width={720}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditingObject(null); setObjectModalOpen(true); }}
          >
            {t("addBrandObject")}
          </Button>
        }
      >
        <Table
          rowKey="id"
          dataSource={objects}
          columns={columns}
          loading={loading}
          size="small"
          pagination={{ pageSize: 20, showSizeChanger: false }}
        />
      </Drawer>
      <BrandObjectModal
        open={objectModalOpen}
        brandObject={editingObject}
        brandId={brand?.id}
        onClose={() => { setObjectModalOpen(false); setEditingObject(null); }}
        onSuccess={() => { fetchObjects(); onBrandObjectsChanged?.(); }}
      />
    </>
  );
}
