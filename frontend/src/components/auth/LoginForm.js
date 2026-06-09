import NeuPressableButton from "../NeuPressableButton";
import NeuButton from "../NeuButton";
import { Form } from "antd";
import { NeuInput, NeuSelect } from "../NeuFormControl";
import { useState } from "react";
import LockOutlined from "@ant-design/icons/es/icons/LockOutlined.js";
import MailOutlined from "@ant-design/icons/es/icons/MailOutlined.js";
import PhoneOutlined from "@ant-design/icons/es/icons/PhoneOutlined.js";
import WechatOutlined from "@ant-design/icons/es/icons/WechatOutlined.js";
import { useNavigate } from "react-router-dom";
import { login, getWechatAuthUrl, COUNTRIES } from "../../utils";
import { useLocale } from "../../LocaleContext";
import { radius } from "../../theme/radius";
import { PHONE_AUTH_ENABLED, WECHAT_AUTH_ENABLED } from "./authFeatures";
import { neuRem } from "../../theme/fontScale";

const isWechatBrowser = () => /MicroMessenger/i.test(navigator.userAgent);
const isMobileBrowser = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function LoginForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [wechatLoading, setWechatLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginType, setLoginType] = useState("email");
  const inWeChat = isWechatBrowser();
  const inMobileNonWeChat = !inWeChat && isMobileBrowser();
  const [form] = Form.useForm();
  const { t, locale } = useLocale();
  const navigate = useNavigate();

  const handleTypeChange = (value) => {
    setLoginType(value);
    setError(null);
  };

  const handleWechatLogin = async () => {
    if (!WECHAT_AUTH_ENABLED) return;
    setWechatLoading(true);
    setError(null);
    try {
      const platform = inWeChat ? "mp" : "pc";
      const { url } = await getWechatAuthUrl(platform);
      window.location.href = url;
    } catch (err) {
      setError(err?.message);
      setWechatLoading(false);
    }
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
      setError(err?.message);
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

      {/* 微信浏览器内：一键登录置顶 */}
      {inWeChat && (
        <>
          {WECHAT_AUTH_ENABLED ? (
            <NeuButton
              onClick={handleWechatLogin}
              loading={wechatLoading}
              size="large"
              style={{
                width: "100%",
                borderRadius: radius.md,
                marginBottom: 8,
                background: "#07C160",
                color: "#fff",
              }}
              icon={<WechatOutlined style={{ fontSize: neuRem(20) }} />}
            >
              {t("loginWithWechat")}
            </NeuButton>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "12px 0",
                fontSize: neuRem(15),
                borderRadius: radius.md,
                marginBottom: 8,
                boxShadow: "var(--inset)",
                color: "var(--neu-text-2)",
                opacity: 0.75,
                cursor: "not-allowed",
              }}
            >
              <WechatOutlined style={{ fontSize: neuRem(20), color: "#07C160" }} />
              {t("loginWithWechat")} ({t("underDevelopment")})
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--neu-border)" }} />
            <span style={{ color: "var(--neu-text-2)", fontSize: neuRem(12) }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--neu-border)" }} />
          </div>
        </>
      )}

      {/* Login type toggle */}
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
          active={loginType === "email"}
          style={{ flex: 1, padding: "8px 0", fontSize: neuRem(13) }}
          onClick={() => handleTypeChange("email")}
        >
          <MailOutlined style={{ marginRight: 6 }} />
          {t("registerWithEmail")}
        </NeuPressableButton>
        <NeuPressableButton
          active={loginType === "phone"}
          disabled={!PHONE_AUTH_ENABLED}
          style={{
            flex: 1,
            padding: "8px 0",
            fontSize: neuRem(13),
            opacity: PHONE_AUTH_ENABLED ? 1 : 0.6,
            cursor: PHONE_AUTH_ENABLED ? "pointer" : "not-allowed",
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
          <NeuInput
            prefix={<MailOutlined />}
            placeholder={t("email")}
            size="large"
            autoComplete="username"
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
                loginType === "phone"
                  ? [
                      { required: true, message: t("phoneRequired") },
                      { pattern: /^\d{5,15}$/, message: t("phoneInvalid") },
                    ]
                  : []
              }
            >
              <NeuInput
                fullWidth={false}
                placeholder={t("phoneNumber")}
                size="large"
                style={{ flex: 1, minWidth: 0 }}
                autoComplete="tel-national"
              />
            </Form.Item>
          </div>
        </Form.Item>

        {/* Password */}
        <Form.Item
          name="password"
          rules={[{ required: true, message: t("passwordRequired") }]}
        >
          <NeuInput.Password
            prefix={<LockOutlined />}
            placeholder={t("password")}
            size="large"
            autoComplete="current-password"
          />
        </Form.Item>

        <div style={{ textAlign: "right", marginTop: -12, marginBottom: 16 }}>
          <span
            onClick={() => navigate("/forgot-password")}
            style={{
              cursor: "pointer",
              color: "var(--neu-accent)",
              fontSize: neuRem(13),
              textDecoration: "underline",
            }}
          >
            {t("forgotPassword")}
          </span>
        </div>

        {error && (
          <div
            style={{
              color: "#fff",
              background: "var(--neu-danger-light)",
              borderRadius: radius.md,
              padding: "8px 14px",
              marginBottom: 16,
              fontSize: neuRem(13),
              boxShadow: "var(--inset-danger)",
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
            {t("signIn")}
          </NeuButton>
        </Form.Item>
      </Form>

      {/* 底部微信登录区域 */}
      {!inWeChat && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 8px" }}>
            <div style={{ flex: 1, height: 1, background: "var(--neu-border)" }} />
            <span style={{ color: "var(--neu-text-2)", fontSize: neuRem(12) }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--neu-border)" }} />
          </div>
          {WECHAT_AUTH_ENABLED ? (
            inMobileNonWeChat ? (
              // 手机普通浏览器：提示在微信内打开
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: radius.md,
                  boxShadow: "var(--inset)",
                  color: "var(--neu-text-2)",
                  fontSize: neuRem(13),
                }}
              >
                <WechatOutlined style={{ color: "#07C160", fontSize: neuRem(18), flexShrink: 0 }} />
                {t("wechatOpenInApp")}
              </div>
            ) : (
              // PC 浏览器：微信扫码按钮
              <NeuButton
                onClick={handleWechatLogin}
                loading={wechatLoading}
                size="large"
                style={{ width: "100%", borderRadius: radius.md }}
                icon={<WechatOutlined style={{ color: "#07C160", fontSize: neuRem(18) }} />}
              >
                {t("loginWithWechat")}
              </NeuButton>
            )
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: radius.md,
                boxShadow: "var(--inset)",
                color: "var(--neu-text-2)",
                fontSize: neuRem(13),
                opacity: 0.75,
                cursor: "not-allowed",
              }}
            >
              <WechatOutlined style={{ color: "#07C160", fontSize: neuRem(18), flexShrink: 0 }} />
              {t("loginWithWechat")} ({t("underDevelopment")})
            </div>
          )}
        </>
      )}

      <div
        style={{
          textAlign: "center",
          marginTop: 16,
          color: "var(--neu-text-2)",
          fontSize: neuRem(13),
        }}
      >
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
