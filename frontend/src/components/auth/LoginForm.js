import { Button, Form, Input } from "antd";
import { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { login } from "../../utils";
import { useLocale } from "../../LocaleContext";

function LoginForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useLocale();

  const onFinish = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await login(data);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neu-login-panel">
      <div className="neu-login-title">
        Mini <span>Collections</span>
      </div>

      <Form name="normal_login" onFinish={onFinish}>
        <Form.Item
          name="username"
          rules={[{ required: true, message: t("usernameRequired") }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={t("username")}
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: t("passwordRequired") }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t("password")}
            size="large"
          />
        </Form.Item>

        {error && (
          <div
            style={{
              color: "#e05d5d",
              background: "rgba(224, 93, 93, 0.08)",
              borderRadius: 10,
              padding: "8px 14px",
              marginBottom: 16,
              fontSize: 13,
              boxShadow: "inset 2px 2px 6px rgba(163, 177, 198, 0.4), inset -2px -2px 5px rgba(255,255,255,0.6)",
            }}
          >
            {error}
          </div>
        )}

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            style={{ width: "100%", borderRadius: 12 }}
          >
            {t("signIn")}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default LoginForm;
