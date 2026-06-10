import { App, Form } from "antd";
import NeuFormDrawer from "../../components/NeuFormDrawer";
import { NeuInput } from "../../components/NeuFormControl";
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
    <NeuFormDrawer
      title={t("resolveTitle")}
      open={open}
      onOk={handleOk}
      onClose={() => { setAdminNote(""); onClose(); }}
      okText={t("resolveSubmission")}
      cancelText={t("cancel")}
      confirmLoading={loading}
      destroyOnClose
      zIndex={1100}
    >
      <Form layout="vertical">
        <Form.Item label={t("adminNote")}>
          <NeuInput.TextArea
            name="adminNote"
            rows={3}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
        </Form.Item>
      </Form>
    </NeuFormDrawer>
  );
}
