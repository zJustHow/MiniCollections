import NeuPressableButton from "../components/NeuPressableButton";
import { App, Table, Tag } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TagsOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAdminSubmissions, getBrands } from "../utils";
import { useLocale } from "../LocaleContext";
import { radius } from "../theme/radius";
import { STATUS_COLOR, TYPE_COLOR, useStatusLabel, useTypeLabel } from "./admin/constants";
import ApproveModal from "./admin/ApproveModal";
import ResolveModal from "./admin/ResolveModal";
import RejectModal from "./admin/RejectModal";
import DetailDrawer from "./admin/DetailDrawer";
import BrandsPanel from "./admin/BrandsPanel";

export default function AdminPage() {
  const { message } = App.useApp();
  const { t } = useLocale();
  const location = useLocation();
  const getTypeLabel = useTypeLabel(t);
  const getStatusLabel = useStatusLabel(t);
  const [activeView, setActiveView] = useState(
    () => (location.state?.adminView === "brands" ? "brands" : "submissions")
  );
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

  useEffect(() => {
    if (location.state?.adminView === "brands") {
      setActiveView("brands");
    }
  }, [location.state?.adminView]);

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
            borderRadius: radius.card,
            padding: 5,
            boxShadow: "var(--inset)",
            width: 160,
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 11, color: "var(--neu-text-2)", padding: "4px 10px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("adminSubmissions")}
          </div>
          {statusOptions.map(({ key, label, icon }) => (
            <NeuPressableButton
              key={key}
              active={activeView === "submissions" && activeStatus === key}
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
                    borderRadius: radius.md,
                    fontSize: 11,
                    padding: "1px 7px",
                    lineHeight: "18px",
                    minWidth: 20,
                    textAlign: "center",
                  }}
                >
                  {pendingCount}
                </span>
              )}
            </NeuPressableButton>
          ))}

          <div style={{ height: 1, background: "rgba(184,182,176,0.25)", margin: "4px 8px" }} />

          <div style={{ fontSize: 11, color: "var(--neu-text-2)", padding: "0 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("adminBrands")}
          </div>
          <NeuPressableButton
            active={activeView === "brands"}
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
          </NeuPressableButton>
        </div>

        {/* Right content panel */}
        <div
          style={{
            flex: 1,
            borderRadius: radius.card,
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
