import { App, Button, Popconfirm, Space, Table } from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  adminDeleteBrandObject,
  getBrandByBrandId,
  getBrandObjectsByBrandId,
} from "../../utils";
import { useLocale } from "../../LocaleContext";
import { radius } from "../../theme/radius";
import BrandObjectModal from "../../components/ObjectList/modals/BrandObjectModal";
import SeriesModal from "../../components/ObjectList/modals/SeriesModal";

export default function AdminBrandObjectsPage() {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const { t } = useLocale();
  const [brand, setBrand] = useState(location.state?.brand ?? null);
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const fetchObjects = async () => {
    if (!brandId) return;
    setLoading(true);
    try {
      const data = await getBrandObjectsByBrandId(brandId);
      setObjects(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(err?.message || t("failedToLoadBrandObjects"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjects();
  }, [brandId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteObject = async (obj) => {
    try {
      await adminDeleteBrandObject(obj.id);
      message.success(t("brandObjectDeleted"));
      fetchObjects();
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
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingObject(record);
              setObjectModalOpen(true);
            }}
          />
          <Popconfirm
            title={t("deleteBrandObjectTitle")}
            description={t("deleteBrandObjectContent").replace(
              "{name}",
              record.name_en
            )}
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
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              navigate("/admin", { state: { adminView: "brands" } })
            }
          />
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: "var(--neu-text)",
            }}
          >
            {brandName} — {t("brandObjects")}
          </h2>
        </div>
        <Space>
          <Button onClick={() => setSeriesModalOpen(true)}>
            {t("addSeries")}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingObject(null);
              setObjectModalOpen(true);
            }}
          >
            {t("addBrandObject")}
          </Button>
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
          pagination={{ pageSize: 20, showSizeChanger: false }}
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
        onSuccess={fetchObjects}
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
