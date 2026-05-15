import { App, Form } from "antd";
import { useState } from "react";

export default function useModalForm({ onSubmit, successMessage, errorMessage, onSuccess, onClose }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setLoading(true);
    try {
      await onSubmit(values);
      message.success(successMessage);
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err?.message || errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, handleOk };
}
