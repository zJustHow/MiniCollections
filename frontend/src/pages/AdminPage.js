import {
  Badge,
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Layout,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { approveSubmission, getAdminSubmissions, getBrands, rejectSubmission } from "../utils";
import { useLocale } from "../LocaleContext";

const { Header, Content } = Layout;

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

function useTypeLabel(t) {
  return (type) => {
    if (type === "MISSING_MODEL") return t("feedbackTypeMissingModel");
    if (type === "BUG_REPORT") return t("feedbackTypeBugReport");
    if (type === "DATA_CORRECTION") return t("feedbackTypeDataCorrection");
    return type;
  };
}

// Modal for MISSING_MODEL: approve & create brand object
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
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label={t("brand")}
          name="brandId"
          rules={[{ required: true, message: t("brandRequired") }]}
        >
          <Select showSearch optionFilterProp="children">
            {brands.map((b) => (
              <Select.Option key={b.id} value={b.id}>
                {b.name}
              </Select.Option>
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

// Modal for BUG_REPORT / DATA_CORRECTION: resolve with optional note
function ResolveModal({ open, submission, onClose, onSuccess }) {
  const { t } = useLocale();
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    setLoading(true);
    try {
      await approveSubmission(submission.id, {
        brand_id: null,
        name_en: null,
        name_zh: null,
        image_url: null,
        release_price_cny: null,
        release_price_usd: null,
        release_date: null,
        category_en: null,
        category_zh: null,
        scale: null,
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
      destroyOnClose
    >
      <Form layout="vertical">
        <Form.Item label={t("adminNote")}>
          <Input.TextArea
            rows={3}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
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
      destroyOnClose
    >
      <Form layout="vertical">
        <Form.Item label={isMissingModel ? t("rejectReason") : t("closeReason")}>
          <Input.TextArea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function DetailDrawer({ submission, brands, onClose, onApprove, onResolve, onReject }) {
  const { t } = useLocale();
  const getTypeLabel = useTypeLabel(t);
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
              <Button type="primary" onClick={onApprove}>
                {t("approveSubmission")}
              </Button>
            ) : (
              <Button type="primary" onClick={onResolve}>
                {t("resolveSubmission")}
              </Button>
            )}
            <Button danger onClick={onReject}>
              {isMissingModel ? t("rejectSubmission") : t("closeSubmission")}
            </Button>
          </Space>
        ) : null
      }
    >
      {submission.image_url && (
        <img
          src={submission.image_url}
          alt={submission.name_en}
          style={{ width: "100%", maxHeight: 240, objectFit: "contain", marginBottom: 16, borderRadius: 8 }}
        />
      )}
      <div style={{ marginBottom: 12 }}>
        <Tag color={STATUS_COLOR[submission.status]}>{submission.status}</Tag>
        <Tag color={TYPE_COLOR[submission.submission_type]}>{getTypeLabel(submission.submission_type)}</Tag>
      </div>
      {rows.map(({ label, value }) =>
        value != null && value !== "" ? (
          <div key={label} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(184,182,176,0.2)" }}>
            <span style={{ color: "var(--neu-text-2)", fontSize: 13, minWidth: 120, flexShrink: 0 }}>{label}</span>
            <span style={{ color: "var(--neu-text)", fontSize: 13, whiteSpace: "pre-wrap" }}>{String(value)}</span>
          </div>
        ) : null
      )}
    </Drawer>
  );
}

export default function AdminPage() {
  const { t } = useLocale();
  const getTypeLabel = useTypeLabel(t);
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState("PENDING");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const fetchSubmissions = async (status) => {
    setLoading(true);
    try {
      const data = await getAdminSubmissions(status === "ALL" ? null : status);
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(err?.message || t("failedToLoadSubmissions"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(activeStatus);
    getBrands().then((data) => setBrands(Array.isArray(data) ? data : [])).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (key) => {
    setActiveStatus(key);
    fetchSubmissions(key);
  };

  const handleSuccess = () => {
    setSelectedSubmission(null);
    fetchSubmissions(activeStatus);
  };

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;

  const columns = [
    { title: "#", dataIndex: "id", width: 60 },
    { title: t("submitter"), dataIndex: "submitter_name", width: 120 },
    {
      title: t("submissionType"),
      dataIndex: "submission_type",
      width: 120,
      render: (type) => (
        <Tag color={TYPE_COLOR[type]}>{getTypeLabel(type)}</Tag>
      ),
    },
    { title: t("brand"), dataIndex: "brand_name", width: 100 },
    { title: t("nameEn"), dataIndex: "name_en", ellipsis: true },
    {
      title: t("submissionStatus"),
      dataIndex: "status",
      width: 100,
      render: (status) => <Tag color={STATUS_COLOR[status]}>{status}</Tag>,
    },
    {
      title: t("submittedAt"),
      dataIndex: "submitted_at",
      width: 160,
      render: (v) => v ? new Date(v).toLocaleString() : "—",
    },
  ];

  const tabItems = [
    { key: "PENDING", label: <Badge count={activeStatus !== "PENDING" ? 0 : pendingCount} offset={[8, 0]}>{t("submissionsPending")}</Badge> },
    { key: "APPROVED", label: t("submissionsApproved") },
    { key: "REJECTED", label: t("submissionsRejected") },
    { key: "ALL", label: t("submissionsAll") },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingLeft: 32,
          paddingRight: 32,
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--neu-text-2)", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}
        >
          <ArrowLeftOutlined /> {t("brands")}
        </button>
        <span style={{ fontSize: 16, fontWeight: 600, color: "var(--neu-text)" }}>
          {t("adminPanel")}
        </span>
      </Header>

      <Content style={{ padding: "32px 48px" }}>
        <Tabs activeKey={activeStatus} onChange={handleTabChange} items={tabItems} />
        <Table
          rowKey="id"
          dataSource={submissions}
          columns={columns}
          loading={loading}
          size="small"
          onRow={(record) => ({ onClick: () => setSelectedSubmission(record), style: { cursor: "pointer" } })}
        />
      </Content>

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
        onSuccess={handleSuccess}
      />

      <ResolveModal
        open={resolveModalOpen}
        submission={selectedSubmission}
        onClose={() => setResolveModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <RejectModal
        open={rejectModalOpen}
        submission={selectedSubmission}
        onClose={() => setRejectModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </Layout>
  );
}
