import { Button, Form, Input, Radio, Select, message, Layout } from "antd";
import { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { signup, COUNTRIES } from "../utils";
import { useLocale } from "../LocaleContext";
import { detectBrowserLocale } from "../i18n";

const { Header, Content } = Layout;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registerType, setRegisterType] = useState("email");
  const [form] = Form.useForm();
  const { t, setLocale, locale } = useLocale();
  const navigate = useNavigate();

  const handleTypeChange = (e) => {
    setRegisterType(e.target.value);
    setError(null);
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        password: values.password,
        name: values.name,
        preferred_locale: values.preferred_locale,
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

          <div style={{ marginBottom: 20, textAlign: "center" }}>
            <Radio.Group
              value={registerType}
              onChange={handleTypeChange}
              buttonStyle="solid"
              size="middle"
            >
              <Radio.Button value="email">{t("registerWithEmail")}</Radio.Button>
              <Radio.Button value="phone">{t("registerWithPhone")}</Radio.Button>
            </Radio.Group>
          </div>

          <Form
            form={form}
            name="register"
            initialValues={{ preferred_locale: detectBrowserLocale(), countryCode: "+86" }}
            onFinish={onFinish}
          >
            <Form.Item
              name="email"
              style={{ display: registerType === "email" ? "block" : "none" }}
              rules={registerType === "email" ? [
                { required: true, message: t("emailRequired") },
                { type: "email", message: t("emailInvalid") },
              ] : []}
            >
              <Input prefix={<UserOutlined />} placeholder={t("email")} size="large" />
            </Form.Item>

            <Form.Item
              style={{ display: registerType === "phone" ? "block" : "none", marginBottom: 24 }}
            >
              <Input.Group compact>
                <Form.Item name="countryCode" noStyle>
                  <Select style={{ width: 110 }} optionLabelProp="label" size="large">
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
                  rules={registerType === "phone" ? [
                    { required: true, message: t("phoneRequired") },
                    { pattern: /^\d{5,15}$/, message: t("phoneInvalid") },
                  ] : []}
                >
                  <Input
                    style={{ width: "calc(100% - 110px)" }}
                    placeholder={t("phoneNumber")}
                    size="large"
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: t("passwordRequired") },
                { min: 6, message: t("newPasswordMin") },
              ]}
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
