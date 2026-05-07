import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Upload,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PictureOutlined,
  PlusOutlined,
  TagsOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  adminCreateBrand,
  adminCreateBrandObject,
  adminDeleteBrand,
  adminDeleteBrandObject,
  adminUpdateBrand,
  adminUpdateBrandObject,
  approveSubmission,
  getAdminSubmissions,
  getBrandObjectsByBrandId,
  getBrands,
  rejectSubmission,
  uploadImage,
} from "../utils";
import { useLocale } from "../LocaleContext";

const STATUS_COLOR = {
  PENDING: "orange",
  APPROVED: "green",
  REJECTED: "red",
};

const TYPE_COLOR = {
  MISSING_MODEL: "blue",
  BUG_REPORT: "volcano",
  DATA_CORRECTION: "purple",
};

function useStatusLabel(t) {
  return (status) => {
    if (status === "PENDING") return t("statusPending");
    if (status === "APPROVED") return t("statusApproved");
    if (status === "REJECTED") return t("statusRejected");
    if (status === "RESOLVED") return t("statusResolved");
    if (status === "CLOSED") return t("statusClosed");
    return status;
  };
}

function useTypeLabel(t) {
  return (type) => {
    if (type === "MISSING_MODEL") return t("feedbackTypeMissingModel");
    if (type === "BUG_REPORT") return t("feedbackTypeBugReport");
    if (type === "DATA_CORRECTION") return t("feedbackTypeDataCorrection");
    return type;
  };
}

// ── Submission modals ────────────────────────────────────────────────────────

function ApproveModal({ open, submission, brands, onClose, onSuccess }) {
  const { t } = useLocale();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && submission) {
      form.setFieldsValue({
        brandId: submission.brand_id,
        nameEn: submission.name_en,
        nameZh: submission.name_zh,
        imageUrl: submission.image_url,
        releasePriceCny: submission.release_price_cny,
        releasePriceUsd: submission.release_price_usd,
        releaseDate: submission.release_date ? dayjs(submission.release_date) : null,
        categoryEn: submission.category_en,
        categoryZh: submission.category_zh,
        scale: submission.scale,
      });
    }
  }, [open, submission, form]);

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setLoading(true);
    try {
      await approveSubmission(submission.id, {
        brand_id: values.brandId,
        name_en: values.nameEn,
        name_zh: values.nameZh || null,
        image_url: values.imageUrl || null,
        release_price_cny: values.releasePriceCny ?? null,
        release_price_usd: values.releasePriceUsd ?? null,
        release_date: values.releaseDate ? values.releaseDate.format("YYYY-MM-DD") : null,
        category_en: values.categoryEn || null,
        category_zh: values.categoryZh || null,
        scale: values.scale || null,
        admin_note: null,
      });
      message.success(t("submissionApproved"));
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err?.message || t("failedToApprove"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t("approveTitle")}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={t("approveSubmission")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      width={600}
      centered
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item label={t("brand")} name="brandId" rules={[{ required: true, message: t("brandRequired") }]}>
          <Select showSearch optionFilterProp="children">
            {brands.map((b) => (
              <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={t("nameEn")} name="nameEn" rules={[{ required: true, message: t("nameRequired") }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t("nameZh")} name="nameZh">
          <Input />
        </Form.Item>
        <Form.Item label={t("image")} name="imageUrl">
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item label={t("scale")} name="scale">
          <Input />
        </Form.Item>
        <Form.Item label={t("category")} name="categoryEn">
          <Input />
        </Form.Item>
        <Form.Item label="Category (ZH)" name="categoryZh">
          <Input />
        </Form.Item>
        <Form.Item label={t("releaseDate")} name="releaseDate">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label={t("priceCNY")} name="releasePriceCny">
          <InputNumber style={{ width: "100%" }} min={0} step={0.01} stringMode />
        </Form.Item>
        <Form.Item label={t("priceUSD")} name="releasePriceUsd">
          <InputNumber style={{ width: "100%" }} min={0} step={0.01} stringMode />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function ResolveModal({ open, submission, onClose, onSuccess }) {
  const { t } = useLocale();
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    setLoading(true);
    try {
      await approveSubmission(submission.id, {
        brand_id: null, name_en: null, name_zh: null, image_url: null,
        release_price_cny: null, release_price_usd: null, release_date: null,
        category_en: null, category_zh: null, scale: null,
        admin_note: adminNote || null,
      });
      message.success(t("submissionResolved"));
      setAdminNote("");
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err?.message || t("failedToResolve"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t("resolveTitle")}
      open={open}
      onOk={handleOk}
      onCancel={() => { setAdminNote(""); onClose(); }}
      okText={t("resolveSubmission")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      centered
      destroyOnClose
    >
      <Form layout="vertical">
        <Form.Item label={t("adminNote")}>
          <Input.TextArea rows={3} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function RejectModal({ open, submission, onClose, onSuccess }) {
  const { t } = useLocale();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const isMissingModel = submission?.submission_type === "MISSING_MODEL";

  const handleOk = async () => {
    setLoading(true);
    try {
      await rejectSubmission(submission.id, reason || null);
      message.success(isMissingModel ? t("submissionRejected") : t("submissionClosed"));
      setReason("");
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err?.message || t("failedToReject"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isMissingModel ? t("rejectTitle") : t("closeTitle")}
      open={open}
      onOk={handleOk}
      onCancel={() => { setReason(""); onClose(); }}
      okText={isMissingModel ? t("rejectSubmission") : t("closeSubmission")}
      okButtonProps={{ danger: true }}
      cancelText={t("cancel")}
      confirmLoading={loading}
      centered
      destroyOnClose
    >
      <Form layout="vertical">
        <Form.Item label={isMissingModel ? t("rejectReason") : t("closeReason")}>
          <Input.TextArea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function DetailDrawer({ submission, brands, onClose, onApprove, onResolve, onReject }) {
  const { t } = useLocale();
  const getTypeLabel = useTypeLabel(t);
  const getStatusLabel = useStatusLabel(t);
  const [imgHovered, setImgHovered] = useState(false);
  if (!submission) return null;

  const isMissingModel = submission.submission_type === "MISSING_MODEL";

  const rows = [
    { label: t("submitter"), value: submission.submitter_name },
    { label: t("submissionType"), value: getTypeLabel(submission.submission_type) },
    ...(isMissingModel
      ? [
          { label: t("brand"), value: submission.brand_name },
          { label: t("nameEn"), value: submission.name_en },
          { label: t("nameZh"), value: submission.name_zh },
          { label: t("scale"), value: submission.scale },
          { label: t("category"), value: submission.category_en },
          { label: t("releaseDate"), value: submission.release_date },
          { label: t("priceCNY"), value: submission.release_price_cny },
          { label: t("priceUSD"), value: submission.release_price_usd },
          { label: t("additionalNotes"), value: submission.notes },
        ]
      : [
          { label: t("bugSubject"), value: submission.name_en },
          { label: t("bugDescription"), value: submission.notes },
          ...(submission.submission_type === "DATA_CORRECTION"
            ? [{ label: t("brand"), value: submission.brand_name }]
            : []),
        ]),
    { label: t("adminNote"), value: submission.admin_note },
    { label: t("rejectReason"), value: submission.reject_reason },
  ];

  return (
    <Drawer
      title={`#${submission.id} — ${submission.name_en || submission.notes?.slice(0, 40) || "—"}`}
      open={!!submission}
      onClose={onClose}
      width={480}
      footer={
        submission.status === "PENDING" ? (
          <Space>
            {isMissingModel ? (
              <Button type="primary" onClick={onApprove}>{t("approveSubmission")}</Button>
            ) : (
              <Button type="primary" onClick={onResolve}>{t("resolveSubmission")}</Button>
            )}
            <Button danger onClick={onReject}>
              {isMissingModel ? t("rejectSubmission") : t("closeSubmission")}
            </Button>
          </Space>
        ) : null
      }
    >
      {submission.image_url && (
        <div
          onClick={() => window.open(submission.image_url, "_blank")}
          onMouseEnter={() => setImgHovered(true)}
          onMouseLeave={() => setImgHovered(false)}
          style={{
            position: "relative",
            marginBottom: 16,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "var(--raised-sm)",
            cursor: "pointer",
            lineHeight: 0,
          }}
        >
          <img
            src={submission.image_url}
            alt={submission.name_en}
            style={{
              width: "100%",
              maxHeight: 220,
              objectFit: "contain",
              display: "block",
              background: "rgba(0,0,0,0.03)",
              transition: "transform 0.2s",
              transform: imgHovered ? "scale(1.02)" : "scale(1)",
            }}
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: imgHovered ? 1 : 0,
            transition: "opacity 0.2s",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.5px",
            lineHeight: 1,
          }}>
            {t("image")} ↗
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Tag color={TYPE_COLOR[submission.submission_type]}>{getTypeLabel(submission.submission_type)}</Tag>
        <Tag color={STATUS_COLOR[submission.status]}>{getStatusLabel(submission.status)}</Tag>
      </div>
      {rows.map(({ label, value }) =>
        value != null && value !== "" ? (
          <div
            key={label}
            style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(184,182,176,0.2)" }}
          >
            <span style={{ color: "var(--neu-text-2)", fontSize: 13, minWidth: 120, flexShrink: 0 }}>{label}</span>
            <span style={{ color: "var(--neu-text)", fontSize: 13, whiteSpace: "pre-wrap", fontWeight: 500 }}>{String(value)}</span>
          </div>
        ) : null
      )}
    </Drawer>
  );
}

// ── Brand management components ──────────────────────────────────────────────

function BrandModal({ open, brand, onClose, onSuccess }) {
  const { t } = useLocale();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const isEdit = !!brand;

  useEffect(() => {
    if (open) {
      form.setFieldsValue(brand
        ? { nameEn: brand.name_en, nameZh: brand.name_zh }
        : { nameEn: "", nameZh: "" }
      );
      setImageUrl(brand?.image_url || null);
    }
  }, [open, brand, form]);

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name_en: values.nameEn,
        name_zh: values.nameZh || null,
        image_url: imageUrl || null,
      };
      if (isEdit) {
        await adminUpdateBrand(brand.id, payload);
        message.success(t("brandUpdated"));
      } else {
        await adminCreateBrand(payload);
        message.success(t("brandCreated"));
      }
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err?.message || (isEdit ? t("failedToUpdateBrand") : t("failedToCreateBrand")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? t("editBrand") : t("addBrand")}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEdit ? t("edit") : t("addBrand")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      centered
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item label={t("nameEn")} name="nameEn" rules={[{ required: true, message: t("nameRequired") }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t("nameZh")} name="nameZh">
          <Input />
        </Form.Item>
        <Form.Item label={t("image")}>
          <Upload
            listType="picture-card"
            showUploadList={false}
            beforeUpload={async (file) => {
              try {
                const url = await uploadImage(file);
                setImageUrl(url);
              } catch (e) {
                message.error(e.message || t("uploadFailed"));
              }
              return false;
            }}
          >
            <div style={{ width: 120 }}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="brand-preview"
                  style={{ width: "100%", maxHeight: 120, objectFit: "contain", display: "block", marginBottom: 8 }}
                />
              ) : (
                <PictureOutlined style={{ fontSize: 32, color: "var(--neu-text-2)", marginBottom: 8, display: "block" }} />
              )}
              <div style={{ fontSize: 12 }}>{t("selectImage")}</div>
            </div>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}

function BrandObjectModal({ open, brandObject, brandId, onClose, onSuccess }) {
  const { t } = useLocale();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const isEdit = !!brandObject;

  useEffect(() => {
    if (open) {
      form.setFieldsValue(brandObject ? {
        nameEn: brandObject.name_en,
        nameZh: brandObject.name_zh,
        scale: brandObject.scale,
        categoryEn: brandObject.category_en,
        categoryZh: brandObject.category_zh,
        releaseDate: brandObject.release_date ? dayjs(brandObject.release_date) : null,
        releasePriceCny: brandObject.release_price_cny,
        releasePriceUsd: brandObject.release_price_usd,
      } : {
        nameEn: "", nameZh: "", scale: "",
        categoryEn: "", categoryZh: "", releaseDate: null,
        releasePriceCny: null, releasePriceUsd: null,
      });
      setImageUrl(brandObject?.image_url || null);
    }
  }, [open, brandObject, form]);

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name_en: values.nameEn,
        name_zh: values.nameZh || null,
        image_url: imageUrl || null,
        scale: values.scale || null,
        category_en: values.categoryEn || null,
        category_zh: values.categoryZh || null,
        release_date: values.releaseDate ? values.releaseDate.format("YYYY-MM-DD") : null,
        release_price_cny: values.releasePriceCny ?? null,
        release_price_usd: values.releasePriceUsd ?? null,
      };
      if (isEdit) {
        await adminUpdateBrandObject(brandObject.id, payload);
        message.success(t("brandObjectUpdated"));
      } else {
        await adminCreateBrandObject(brandId, payload);
        message.success(t("brandObjectCreated"));
      }
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err?.message || (isEdit ? t("failedToUpdateBrandObject") : t("failedToCreateBrandObject")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? t("editBrandObject") : t("addBrandObject")}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEdit ? t("edit") : t("addBrandObject")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      width={600}
      centered
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item label={t("nameEn")} name="nameEn" rules={[{ required: true, message: t("nameRequired") }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t("nameZh")} name="nameZh">
          <Input />
        </Form.Item>
        <Form.Item label={t("scale")} name="scale">
          <Input />
        </Form.Item>
        <Form.Item label={t("categoryEn")} name="categoryEn">
          <Input />
        </Form.Item>
        <Form.Item label={t("categoryZh")} name="categoryZh">
          <Input />
        </Form.Item>
        <Form.Item label={t("releaseDate")} name="releaseDate">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label={t("priceCNY")} name="releasePriceCny">
          <InputNumber style={{ width: "100%" }} min={0} step={0.01} stringMode />
        </Form.Item>
        <Form.Item label={t("priceUSD")} name="releasePriceUsd">
          <InputNumber style={{ width: "100%" }} min={0} step={0.01} stringMode />
        </Form.Item>
        <Form.Item label={t("image")}>
          <Upload
            listType="picture-card"
            showUploadList={false}
            beforeUpload={async (file) => {
              try {
                const url = await uploadImage(file);
                setImageUrl(url);
              } catch (e) {
                message.error(e.message || t("uploadFailed"));
              }
              return false;
            }}
          >
            <div style={{ width: 120 }}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="object-preview"
                  style={{ width: "100%", maxHeight: 120, objectFit: "contain", display: "block", marginBottom: 8 }}
                />
              ) : (
                <PictureOutlined style={{ fontSize: 32, color: "var(--neu-text-2)", marginBottom: 8, display: "block" }} />
              )}
              <div style={{ fontSize: 12 }}>{t("selectImage")}</div>
            </div>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}

function BrandObjectsDrawer({ brand, onClose, onBrandObjectsChanged }) {
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
    } catch {
      message.error(t("failedToLoadBrandObjects"));
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

function BrandsPanel({ brands, onBrandsChanged }) {
  const { t } = useLocale();
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

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
        ? <img src={url} alt="" style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 6 }} />
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
          <Button
            size="small"
            icon={<TagsOutlined />}
            onClick={() => setSelectedBrand(record)}
          >
            {t("viewObjects")}
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => { setEditingBrand(record); setBrandModalOpen(true); }}
          />
          <Popconfirm
            title={t("deleteBrandTitle")}
            description={t("deleteBrandContent").replace("{name}", record.name_en)}
            onConfirm={() => handleDeleteBrand(record)}
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
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingBrand(null); setBrandModalOpen(true); }}
        >
          {t("addBrand")}
        </Button>
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
      <BrandObjectsDrawer
        brand={selectedBrand}
        onClose={() => setSelectedBrand(null)}
        onBrandObjectsChanged={() => {}}
      />
    </>
  );
}

// ── Main AdminPage ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { t } = useLocale();
  const getTypeLabel = useTypeLabel(t);
  const getStatusLabel = useStatusLabel(t);
  const [activeView, setActiveView] = useState("submissions");
  const [activeStatus, setActiveStatus] = useState("PENDING");

  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [brands, setBrands] = useState([]);

  const fetchSubmissions = async (status) => {
    setSubmissionsLoading(true);
    try {
      const data = await getAdminSubmissions(status === "ALL" ? null : status);
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(err?.message || t("failedToLoadSubmissions"));
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchSubmissions(activeStatus);
    fetchBrands();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (key) => {
    setActiveStatus(key);
    fetchSubmissions(key);
  };

  const handleSubmissionSuccess = () => {
    setSelectedSubmission(null);
    fetchSubmissions(activeStatus);
    fetchBrands();
  };

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;

  const statusOptions = [
    { key: "PENDING",  label: t("submissionsPending"),  icon: <ClockCircleOutlined /> },
    { key: "APPROVED", label: t("submissionsApproved"), icon: <CheckCircleOutlined /> },
    { key: "REJECTED", label: t("submissionsRejected"), icon: <CloseCircleOutlined /> },
    { key: "ALL",      label: t("submissionsAll"),      icon: <UnorderedListOutlined /> },
  ];

  const submissionColumns = [
    { title: "#", dataIndex: "id", width: 60 },
    { title: t("submitter"), dataIndex: "submitter_name", width: 120 },
    {
      title: t("submissionType"),
      dataIndex: "submission_type",
      width: 140,
      render: (type) => <Tag color={TYPE_COLOR[type]}>{getTypeLabel(type)}</Tag>,
    },
    { title: t("brand"), dataIndex: "brand_name", width: 100 },
    { title: t("nameEn"), dataIndex: "name_en", ellipsis: true },
    {
      title: t("submissionStatus"),
      dataIndex: "status",
      width: 110,
      render: (status) => <Tag color={STATUS_COLOR[status]}>{getStatusLabel(status)}</Tag>,
    },
    {
      title: t("submittedAt"),
      dataIndex: "submitted_at",
      width: 160,
      render: (v) => v ? new Date(v).toLocaleString() : "—",
    },
  ];

  return (
    <div>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 24, alignItems: "flex-start" }}>

        {/* Left sidebar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            borderRadius: 14,
            padding: 5,
            boxShadow: "var(--inset-sm)",
            width: 160,
            flexShrink: 0,
          }}
        >
          {/* Submissions section */}
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--neu-text-2)", padding: "4px 10px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("adminSubmissions")}
          </div>
          {statusOptions.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              className={`neu-tab-btn${activeView === "submissions" && activeStatus === key ? " active" : ""}`}
              style={{
                width: "100%",
                padding: "10px 14px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                fontSize: 13,
              }}
              onClick={() => { setActiveView("submissions"); handleTabChange(key); }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {icon}
                {label}
              </span>
              {key === "PENDING" && pendingCount > 0 && (
                <span
                  style={{
                    background: "var(--neu-accent)",
                    color: "#fff",
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 7px",
                    lineHeight: "18px",
                    minWidth: 20,
                    textAlign: "center",
                  }}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          ))}

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(184,182,176,0.25)", margin: "4px 8px" }} />

          {/* Brands section */}
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--neu-text-2)", padding: "0 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("adminBrands")}
          </div>
          <button
            type="button"
            className={`neu-tab-btn${activeView === "brands" ? " active" : ""}`}
            style={{
              width: "100%",
              padding: "10px 14px",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
            }}
            onClick={() => setActiveView("brands")}
          >
            <TagsOutlined />
            {t("brands")}
          </button>
        </div>

        {/* Right content panel */}
        <div
          style={{
            flex: 1,
            borderRadius: 14,
            padding: 24,
            boxShadow: "var(--inset)",
          }}
        >
          {activeView === "submissions" ? (
            <Table
              rowKey="id"
              dataSource={submissions}
              columns={submissionColumns}
              loading={submissionsLoading}
              size="middle"
              onRow={(record) => ({ onClick: () => setSelectedSubmission(record), style: { cursor: "pointer" } })}
              pagination={{ pageSize: 20, showSizeChanger: false }}
            />
          ) : (
            <BrandsPanel brands={brands} onBrandsChanged={fetchBrands} />
          )}
        </div>
      </div>

      <DetailDrawer
        submission={selectedSubmission}
        brands={brands}
        onClose={() => setSelectedSubmission(null)}
        onApprove={() => setApproveModalOpen(true)}
        onResolve={() => setResolveModalOpen(true)}
        onReject={() => setRejectModalOpen(true)}
      />
      <ApproveModal
        open={approveModalOpen}
        submission={selectedSubmission}
        brands={brands}
        onClose={() => setApproveModalOpen(false)}
        onSuccess={handleSubmissionSuccess}
      />
      <ResolveModal
        open={resolveModalOpen}
        submission={selectedSubmission}
        onClose={() => setResolveModalOpen(false)}
        onSuccess={handleSubmissionSuccess}
      />
      <RejectModal
        open={rejectModalOpen}
        submission={selectedSubmission}
        onClose={() => setRejectModalOpen(false)}
        onSuccess={handleSubmissionSuccess}
      />
    </div>
  );
}
