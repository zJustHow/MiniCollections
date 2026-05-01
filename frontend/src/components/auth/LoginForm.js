import { Button, Form, Input, Select } from "antd";
import { useState } from "react";
import { LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { login, COUNTRIES } from "../../utils";
import { useLocale } from "../../LocaleContext";

function LoginForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginType, setLoginType] = useState("email");
  const [form] = Form.useForm();
  const { t, locale } = useLocale();
  const navigate = useNavigate();

  const handleTypeChange = (value) => {
    setLoginType(value);
    setError(null);
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const identifier =
        loginType === "phone"
          ? values.countryCode + values.phoneNumber
          : values.email;
      await login({ identifier, password: values.password, loginType });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="neu-login-panel"
      style={{ maxWidth: 400, width: "100%", margin: 0 }}
    >
      <div className="neu-login-title">
        Mini <span>Collections</span>
      </div>

      {/* Login type toggle */}
      <div
        style={{
          display: "flex",
          gap: 8,
          borderRadius: 14,
          padding: 5,
          boxShadow: "var(--inset-sm)",
          marginBottom: 24,
        }}
      >
        <button
          type="button"
          className={`neu-tab-btn${loginType === "email" ? " active" : ""}`}
          style={{ flex: 1, padding: "8px 0", fontSize: 13 }}
          onClick={() => handleTypeChange("email")}
        >
          <MailOutlined style={{ marginRight: 6 }} />
          {t("registerWithEmail")}
        </button>
        <button
          type="button"
          className={`neu-tab-btn${loginType === "phone" ? " active" : ""}`}
          style={{ flex: 1, padding: "8px 0", fontSize: 13 }}
          onClick={() => handleTypeChange("phone")}
        >
          <PhoneOutlined style={{ marginRight: 6 }} />
          {t("registerWithPhone")}
        </button>
      </div>

      <Form
        form={form}
        name="normal_login"
        initialValues={{ countryCode: "+86" }}
        onFinish={onFinish}
      >
        {/* Email */}
        <Form.Item
          name="email"
          style={{ display: loginType === "email" ? "block" : "none" }}
          rules={
            loginType === "email"
              ? [
                  { required: true, message: t("emailRequired") },
                  { type: "email", message: t("emailInvalid") },
                ]
              : []
          }
        >
          <Input
            prefix={<MailOutlined />}
            placeholder={t("email")}
            size="large"
          />
        </Form.Item>

        {/* Phone */}
        <Form.Item
          style={{
            display: loginType === "phone" ? "block" : "none",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <Form.Item name="countryCode" noStyle>
              <Select
                style={{ width: 115 }}
                optionLabelProp="label"
                size="large"
              >
                {COUNTRIES.map((c) => (
                  <Select.Option key={c.code} value={c.code} label={c.code}>
                    {locale === "zh-CN" ? c.zh : c.en} {c.code}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              noStyle
              rules={
                loginType === "phone"
                  ? [
                      { required: true, message: t("phoneRequired") },
                      { pattern: /^\d{5,15}$/, message: t("phoneInvalid") },
                    ]
                  : []
              }
            >
              <Input
                placeholder={t("phoneNumber")}
                size="large"
                style={{ flex: 1, minWidth: 0 }}
              />
            </Form.Item>
          </div>
        </Form.Item>

        {/* Password */}
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
              boxShadow:
                "inset 2px 2px 6px rgba(163, 177, 198, 0.4), inset -2px -2px 5px rgba(255,255,255,0.6)",
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

      <div
        style={{
          textAlign: "center",
          marginTop: 16,
          color: "var(--neu-text-2)",
          fontSize: 13,
        }}
      >
        or{" "}
        <span
          onClick={() => navigate("/register")}
          style={{
            cursor: "pointer",
            color: "var(--neu-accent)",
            textDecoration: "underline",
          }}
        >
          {t("signUp")}
        </span>
      </div>
    </div>
  );
}

export default LoginForm;
