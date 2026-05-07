import {
  App, Button, Form, Input, Select, Layout } from "antd";
import { useRef, useState } from "react";
import { LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { signup, sendCode, COUNTRIES } from "../utils";
import { useLocale } from "../LocaleContext";
import { detectBrowserLocale } from "../i18n";

const { Header, Content } = Layout;

export default function RegisterPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const countdownTimer = useRef(null);
  const [error, setError] = useState(null);
  const [registerType, setRegisterType] = useState("email");
  const [selectedLocale, setSelectedLocale] = useState(detectBrowserLocale);
  const [form] = Form.useForm();
  const { t, setLocale, locale } = useLocale();
  const navigate = useNavigate();

  const handleTypeChange = (value) => {
    setRegisterType(value);
    setError(null);
    clearInterval(countdownTimer.current);
    setCodeCountdown(0);
    form.resetFields(["code"]);
  };

  const handleSendCode = async () => {
    let target;
    try {
      if (registerType === "email") {
        await form.validateFields(["email"]);
        target = form.getFieldValue("email");
      } else {
        await form.validateFields(["phoneNumber"]);
        const countryCode = form.getFieldValue("countryCode") || "+86";
        target = countryCode + form.getFieldValue("phoneNumber");
      }
    } catch {
      return;
    }
    setSendingCode(true);
    try {
      await sendCode(target, registerType === "email" ? "EMAIL" : "PHONE");
      message.success(t("codeSent"));
      setCodeCountdown(60);
      countdownTimer.current = setInterval(() => {
        setCodeCountdown((prev) => {
          if (prev <= 1) { clearInterval(countdownTimer.current); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      message.error(err.message);
    } finally {
      setSendingCode(false);
    }
  };

  const handleLocaleChange = (value) => {
    setSelectedLocale(value);
    form.setFieldsValue({ preferred_locale: value });
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        password: values.password,
        name: values.name,
        preferred_locale: values.preferred_locale,
        code: values.code,
      };
      if (registerType === "email") {
        payload.email = values.email;
      } else {
        payload.phone = values.countryCode + values.phoneNumber;
      }
      await signup(payload);
      if (values.preferred_locale) setLocale(values.preferred_locale);
      message.success(t("registerSuccess"));
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
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
          padding: "40px 16px",
        }}
      >
        <div
          className="neu-login-panel"
          style={{ maxWidth: 420, width: "100%", margin: 0 }}
        >
          <div className="neu-login-title">{t("register")}</div>

          {/* Register type toggle */}
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
              className={`neu-tab-btn${registerType === "email" ? " active" : ""}`}
              style={{ flex: 1, padding: "8px 0", fontSize: 13 }}
              onClick={() => handleTypeChange("email")}
            >
              <MailOutlined style={{ marginRight: 6 }} />
              {t("registerWithEmail")}
            </button>
            <button
              type="button"
              className={`neu-tab-btn${registerType === "phone" ? " active" : ""}`}
              style={{ flex: 1, padding: "8px 0", fontSize: 13 }}
              onClick={() => handleTypeChange("phone")}
            >
              <PhoneOutlined style={{ marginRight: 6 }} />
              {t("registerWithPhone")}
            </button>
          </div>

          <Form
            form={form}
            name="register"
            initialValues={{ preferred_locale: detectBrowserLocale(), countryCode: "+86" }}
            onFinish={onFinish}
          >
            {/* Email */}
            <Form.Item
              name="email"
              style={{ display: registerType === "email" ? "block" : "none" }}
              rules={
                registerType === "email"
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
                display: registerType === "phone" ? "block" : "none",
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
                    registerType === "phone"
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

            {/* Verification Code */}
            <Form.Item>
              <div style={{ display: "flex", gap: 8 }}>
                <Form.Item
                  name="code"
                  noStyle
                  rules={[{ required: true, message: t("codeRequired") }]}
                >
                  <Input
                    placeholder={t("verificationCode")}
                    size="large"
                    style={{ flex: 1 }}
                    maxLength={6}
                  />
                </Form.Item>
                <Button
                  size="large"
                  loading={sendingCode}
                  disabled={codeCountdown > 0}
                  onClick={handleSendCode}
                  style={{ flexShrink: 0, minWidth: 120 }}
                >
                  {codeCountdown > 0 ? `${codeCountdown}s` : t("sendCode")}
                </Button>
              </div>
            </Form.Item>

            {/* Password */}
            <Form.Item
              name="password"
              rules={[
                { required: true, message: t("passwordRequired") },
                { min: 6, message: t("newPasswordMin") },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t("password")}
                size="large"
              />
            </Form.Item>

            {/* Name */}
            <Form.Item
              name="name"
              rules={[{ required: true, message: t("signupNameRequired") }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={t("username")}
                size="large"
              />
            </Form.Item>

            {/* Language toggle */}
            <Form.Item name="preferred_locale" hidden>
              <Input />
            </Form.Item>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--neu-text-2)",
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {t("language")}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  borderRadius: 14,
                  padding: 5,
                  boxShadow: "var(--inset-sm)",
                }}
              >
                <button
                  type="button"
                  className={`neu-tab-btn${selectedLocale === "en-US" ? " active" : ""}`}
                  style={{ flex: 1, padding: "7px 0", fontSize: 13 }}
                  onClick={() => handleLocaleChange("en-US")}
                >
                  English
                </button>
                <button
                  type="button"
                  className={`neu-tab-btn${selectedLocale === "zh-CN" ? " active" : ""}`}
                  style={{ flex: 1, padding: "7px 0", fontSize: 13 }}
                  onClick={() => handleLocaleChange("zh-CN")}
                >
                  中文
                </button>
              </div>
            </div>

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
                {t("register")}
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
              onClick={() => navigate("/login")}
              style={{
                cursor: "pointer",
                color: "var(--neu-accent)",
                textDecoration: "underline",
              }}
            >
              {t("signIn")}
            </span>
          </div>
        </div>
      </Content>
    </Layout>
  );
}
