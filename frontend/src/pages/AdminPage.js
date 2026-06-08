import ListPagination from "../components/ListPagination";
import { App, Table } from "antd";
import NeuTag from "../components/NeuTag";
import { useCallback, useEffect, useState } from "react";
import { getAdminSubmissions } from "../utils";
import { useLocale } from "../LocaleContext";
import { STATUS_COLOR, TYPE_COLOR, useStatusLabel, useTypeLabel } from "./admin/constants";
import ApproveModal from "./admin/ApproveModal";
import ResolveModal from "./admin/ResolveModal";
import RejectModal from "./admin/RejectModal";
import DetailDrawer from "./admin/DetailDrawer";
import { useAdminLayoutContext } from "./admin/AdminLayout";
import AdminTableSkeleton from "../components/AdminTableSkeleton";

const SUBMISSIONS_PAGE_SIZE = 20;

export default function AdminPage() {
  const { message } = App.useApp();
  const { t } = useLocale();
  const getTypeLabel = useTypeLabel(t);
  const getStatusLabel = useStatusLabel(t);
  const { activeStatus, refreshSubmissions } = useAdminLayoutContext();

  const [submissions, setSubmissions] = useState([]);
  const [submissionsPage, setSubmissionsPage] = useState(0);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setSubmissionsLoading(true);
    try {
      const data = await getAdminSubmissions(null);
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(err?.message || t("failedToLoadSubmissions"));
    } finally {
      setSubmissionsLoading(false);
    }
  }, [message, t]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    setSubmissionsPage(0);
  }, [activeStatus]);

  const handleSubmissionSuccess = () => {
    setSelectedSubmission(null);
    fetchSubmissions();
    refreshSubmissions?.();
  };

  const visibleSubmissions =
    activeStatus === "ALL"
      ? submissions
      : submissions.filter((s) => s.status === activeStatus);

  const submissionsTotalPages = Math.ceil(visibleSubmissions.length / SUBMISSIONS_PAGE_SIZE);
  const paginatedSubmissions = visibleSubmissions.slice(
    submissionsPage * SUBMISSIONS_PAGE_SIZE,
    (submissionsPage + 1) * SUBMISSIONS_PAGE_SIZE,
  );

  const submissionColumns = [
    { title: "#", dataIndex: "id", width: 60 },
    { title: t("submitter"), dataIndex: "submitter_name", width: 120 },
    {
      title: t("submissionType"),
      dataIndex: "submission_type",
      width: 140,
      render: (type) => <NeuTag color={TYPE_COLOR[type]}>{getTypeLabel(type)}</NeuTag>,
    },
    { title: t("brand"), dataIndex: "brand_name", width: 100 },
    { title: t("nameEn"), dataIndex: "name_en", ellipsis: true },
    {
      title: t("submissionStatus"),
      dataIndex: "status",
      width: 110,
      render: (status) => <NeuTag color={STATUS_COLOR[status]}>{getStatusLabel(status)}</NeuTag>,
    },
    {
      title: t("submittedAt"),
      dataIndex: "submitted_at",
      width: 160,
      render: (v) => (v ? new Date(v).toLocaleString() : "—"),
    },
  ];

  return (
    <>
      {submissionsLoading ? (
        <AdminTableSkeleton columns={7} />
      ) : (
        <div className="neu-panel">
          <Table
            rowKey="id"
            dataSource={paginatedSubmissions}
            columns={submissionColumns}
            size="middle"
            onRow={(record) => ({
              onClick: () => setSelectedSubmission(record),
              style: { cursor: "pointer" },
            })}
            pagination={false}
          />
        </div>
      )}
      <ListPagination
        page={submissionsPage}
        totalPages={submissionsTotalPages}
        loading={submissionsLoading}
        onPageChange={(nextPage) => setSubmissionsPage(nextPage - 1)}
      />

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
    </>
  );
}
