import { App, Form, Input, Modal } from "antd";
import { useState } from "react";
import { approveSubmission } from "../../utils";
import { useLocale } from "../../LocaleContext";

export default function ResolveModal({ open, submission, onClose, onSuccess }) {
  const { message } = App.useApp();
  const { t } = useLocale();
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    setLoading(true);
    try {
      await approveSubmission(submission.id, {
        brand_id: null, name_en: null, name_zh: null, image_url: null,
        release_price_cny: null, release_price_usd: null, release_date: null,
        category_id: null, scale_id: null,
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
