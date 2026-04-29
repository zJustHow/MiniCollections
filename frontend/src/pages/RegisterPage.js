import { Button, Form, Input, Radio, message, Layout } from "antd";
import { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { signup } from "../utils";
import { useLocale } from "../LocaleContext";
import { detectBrowserLocale } from "../i18n";

const { Header, Content } = Layout;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t, setLocale } = useLocale();
  const navigate = useNavigate();

  const onFinish = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await signup(data);
      if (data.preferred_locale) setLocale(data.preferred_locale);
      message.success(t("registerSuccess"));
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: 32,
          paddingRight: 32,
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 2.5,
            textTransform: "uppercase",
            color: "#3c4f68",
          }}
        >
          Mini <span style={{ color: "#5592cc" }}>Collections</span>
        </span>
      </Header>
      <Content
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--neu-bg)",
        }}
      >
        <div className="neu-login-panel">
          <div className="neu-login-title">
            {t("register")}
          </div>

          <Form
            name="register"
            initialValues={{ preferred_locale: detectBrowserLocale() }}
            onFinish={onFinish}
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: t("emailRequired") }]}
            >
              <Input prefix={<UserOutlined />} placeholder={t("email")} size="large" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: t("passwordRequired") }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder={t("password")} size="large" />
            </Form.Item>
            <Form.Item
              name="name"
              rules={[{ required: true, message: t("signupNameRequired") }]}
            >
              <Input prefix={<UserOutlined />} placeholder={t("username")} size="large" />
            </Form.Item>
            <Form.Item name="preferred_locale" label={t("language")}>
              <Radio.Group>
                <Radio value="en-US">English</Radio>
                <Radio value="zh-CN">中文</Radio>
              </Radio.Group>
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
                {t("register")}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: 16, color: "var(--neu-text-2)", fontSize: 13 }}>
            or{" "}
            <span
              onClick={() => navigate("/login")}
              style={{ cursor: "pointer", color: "var(--neu-accent)", textDecoration: "underline" }}
            >
              {t("signIn")}
            </span>
          </div>
        </div>
      </Content>
    </Layout>
  );
}
