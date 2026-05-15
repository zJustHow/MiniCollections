import { App, Form, Input, Modal } from "antd";
import { useState } from "react";
import { rejectSubmission } from "../../utils";
import { useLocale } from "../../LocaleContext";

export default function RejectModal({ open, submission, onClose, onSuccess }) {
  const { message } = App.useApp();
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
