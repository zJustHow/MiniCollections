import NeuPressableButton from "../components/NeuPressableButton";
import SiteLogo from "../components/SiteLogo";
import NeuButton from "../components/NeuButton";
import { App, Form, Layout } from "antd";
import { NeuInput, NeuSelect } from "../components/NeuFormControl";
import { useRef, useState, useEffect } from "react";
import LockOutlined from "@ant-design/icons/es/icons/LockOutlined.js";
import MailOutlined from "@ant-design/icons/es/icons/MailOutlined.js";
import PhoneOutlined from "@ant-design/icons/es/icons/PhoneOutlined.js";
import UserOutlined from "@ant-design/icons/es/icons/UserOutlined.js";
import { Link, useNavigate } from "react-router-dom";
import { signup, sendCode, COUNTRIES } from "../utils";
import { useLocale } from "../LocaleContext";
import { radius } from "../theme/radius";
import { PHONE_AUTH_ENABLED } from "../components/auth/authFeatures";
import { neuRem } from "../theme/fontScale";
import { prefetchLoginPage } from "../utils/prefetchRoutes";

const { Header, Content } = Layout;

export default function RegisterPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const countdownTimer = useRef(null);
  const [error, setError] = useState(null);
  const [registerType, setRegisterType] = useState("email");
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
        target = form.getFieldValue("email")?.trim();
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
          if (prev <= 1) {
            clearInterval(countdownTimer.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      message.error(err?.message);
    } finally {
      setSendingCode(false);
    }
  };

  const handleLocaleChange = (value) => {
    form.setFieldsValue({ preferred_locale: value });
    setLocale(value);
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    const preferredLocale = values.preferred_locale || locale;
    try {
      const payload = {
        password: values.password,
        name: values.name,
        preferred_locale: preferredLocale,
        code: values.code,
      };
      if (registerType === "email") {
        payload.email = values.email?.trim();
      } else {
        payload.phone = values.countryCode + values.phoneNumber;
      }
      await signup(payload);
      message.success(t("registerSuccess"));
      navigate("/login");
      if (preferredLocale) setLocale(preferredLocale);
    } catch (err) {
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    prefetchLoginPage();
  }, []);

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
        <SiteLogo />
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
              borderRadius: radius.card,
              padding: 5,
              boxShadow: "var(--inset)",
              marginBottom: 24,
            }}
          >
            <NeuPressableButton
              active={registerType === "email"}
              style={{ flex: 1, padding: "8px 0", fontSize: neuRem(13) }}
              onClick={() => handleTypeChange("email")}
            >
              <MailOutlined style={{ marginRight: 6 }} />
              {t("registerWithEmail")}
            </NeuPressableButton>
            <NeuPressableButton
              active={registerType === "phone"}
              disabled={!PHONE_AUTH_ENABLED}
              style={{
                flex: 1,
                padding: "8px 0",
                fontSize: neuRem(13),
              }}
              onClick={() => PHONE_AUTH_ENABLED && handleTypeChange("phone")}
            >
              <PhoneOutlined style={{ marginRight: 6 }} />
              {t("registerWithPhone")}
              {!PHONE_AUTH_ENABLED && (
                <span style={{ marginLeft: 4, fontSize: neuRem(11) }}>({t("underDevelopment")})</span>
              )}
            </NeuPressableButton>
          </div>

          <Form
            form={form}
            name="register"
            initialValues={{
              preferred_locale: locale,
              countryCode: "+86",
            }}
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
              <NeuInput
                prefix={<MailOutlined />}
                placeholder={t("email")}
                size="large"
                autoComplete="email"
              />
            </Form.Item>

            {/* Phone */}
            <Form.Item
              style={{
                display: registerType === "phone" ? "block" : "none",
                marginBottom: 24,
              }}
            >
              <div className="neu-phone-row">
                <Form.Item name="countryCode" noStyle>
                  <NeuSelect
                    fullWidth={false}
                    style={{ width: 115 }}
                    optionLabelProp="label"
                    size="large"
                  >
                    {COUNTRIES.map((c) => (
                      <NeuSelect.Option key={c.code} value={c.code} label={c.code}>
                        {locale === "zh-CN" ? c.zh : c.en} {c.code}
                      </NeuSelect.Option>
                    ))}
                  </NeuSelect>
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
                  <NeuInput
                    fullWidth
                    placeholder={t("phoneNumber")}
                    size="large"
                    autoComplete="tel-national"
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
                  <NeuInput
                    fullWidth={false}
                    placeholder={t("verificationCode")}
                    size="large"
                    style={{ flex: 1 }}
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </Form.Item>
                <NeuButton
                  size="large"
                  loading={sendingCode}
                  disabled={codeCountdown > 0}
                  onClick={handleSendCode}
                  style={{ flexShrink: 0, minWidth: 120 }}
                >
                  {codeCountdown > 0 ? `${codeCountdown}s` : t("sendCode")}
                </NeuButton>
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
              <NeuInput.Password
                prefix={<LockOutlined />}
                placeholder={t("password")}
                size="large"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: t("confirmPasswordRequired") },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t("passwordMismatch")));
                  },
                }),
              ]}
            >
              <NeuInput.Password
                prefix={<LockOutlined />}
                placeholder={t("confirmPassword")}
                size="large"
                autoComplete="new-password"
              />
            </Form.Item>

            {/* Name */}
            <Form.Item
              name="name"
              rules={[{ required: true, message: t("signupNameRequired") }]}
            >
              <NeuInput
                prefix={<UserOutlined />}
                placeholder={t("username")}
                size="large"
                autoComplete="username"
              />
            </Form.Item>

            {/* Language toggle */}
            <Form.Item name="preferred_locale" hidden>
              <NeuInput autoComplete="off" />
            </Form.Item>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: neuRem(12),
                  color: "var(--neu-text-2)",
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
                  borderRadius: radius.card,
                  padding: 5,
                  boxShadow: "var(--inset)",
                }}
              >
                <NeuPressableButton
                  active={locale === "en-US"}
                  style={{ flex: 1, padding: "7px 0", fontSize: neuRem(13) }}
                  onClick={() => handleLocaleChange("en-US")}
                >
                  English
                </NeuPressableButton>
                <NeuPressableButton
                  active={locale === "zh-CN"}
                  style={{ flex: 1, padding: "7px 0", fontSize: neuRem(13) }}
                  onClick={() => handleLocaleChange("zh-CN")}
                >
                  中文
                </NeuPressableButton>
              </div>
            </div>

            {error && (
              <div
                style={{
                  color: "#e05d5d",
                  background: "rgba(224, 93, 93, 0.08)",
                  borderRadius: radius.md,
                  padding: "8px 14px",
                  marginBottom: 16,
                  fontSize: neuRem(13),
                  boxShadow:
                    "inset 2px 2px 6px rgba(163, 177, 198, 0.4), inset -2px -2px 5px rgba(255,255,255,0.6)",
                }}
              >
                {error}
              </div>
            )}

            <Form.Item style={{ marginBottom: 0 }}>
              <NeuButton
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{ width: "100%", borderRadius: radius.md }}
              >
                {t("register")}
              </NeuButton>
            </Form.Item>
          </Form>

          <div
            style={{
              textAlign: "center",
              marginTop: 16,
              color: "var(--neu-text-2)",
              fontSize: neuRem(13),
            }}
          >
            <Link
              to="/login"
              onMouseEnter={prefetchLoginPage}
              onFocus={prefetchLoginPage}
              style={{
                color: "var(--neu-accent)",
                textDecoration: "underline",
              }}
            >
              {t("signIn")}
            </Link>
          </div>
        </div>
      </Content>
    </Layout>
  );
}
