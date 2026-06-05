import {
  App,
  Avatar,
  Button,
  Divider,
  Form,
  Layout,
  Radio,
  Upload,
} from "antd";
import HeaderActionButton from "../components/HeaderActionButton";
import { NeuInput, NeuSelect } from "../components/NeuFormControl";
import {
  ArrowLeftOutlined,
  LoadingOutlined,
  LockOutlined,
  LogoutOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  COUNTRIES,
  getWechatAuthUrl,
  parsePhone,
  sendCode,
  updateIdentifier,
  updateLocale,
  updatePassword,
  updateProfile,
  uploadAvatar,
} from "../utils";
import { useLocale } from "../LocaleContext";
import { radius } from "../theme/radius";

const { Header, Content } = Layout;

function SectionLabel({ title }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: "var(--neu-text-2)",
        marginBottom: 14,
      }}
    >
      {title}
    </div>
  );
}

function SectionCard({ children }) {
  return (
    <div
      style={{
        background: "var(--neu-bg)",
        borderRadius: radius.card,
        padding: "22px 24px",
        boxShadow: "var(--raised-sm)",
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

export default function ProfilePage({ profile, onProfileChange, onLogout }) {
  const { message } = App.useApp();
  const { t, locale } = useLocale();
  const navigate = useNavigate();

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailCodeLoading, setEmailCodeLoading] = useState(false);
  const [emailCodeCountdown, setEmailCodeCountdown] = useState(0);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [localeLoading, setLocaleLoading] = useState(false);

  const [nameForm] = Form.useForm();
  const [pwForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [phoneForm] = Form.useForm();
  const [localeForm] = Form.useForm();

  const handleAvatarUpload = async ({ file }) => {
    setAvatarLoading(true);
    try {
      const updated = await uploadAvatar(file);
      onProfileChange(updated);
      message.success(t("avatarUpdated"));
    } catch (err) {
      message.error(err?.message || t("avatarUploadFailed"));
    } finally {
      setAvatarLoading(false);
    }
    return false;
  };

  const handleNameSave = async (values) => {
    setNameLoading(true);
    try {
      const updated = await updateProfile({ displayName: values.displayName });
      onProfileChange(updated);
      message.success(t("displayNameUpdated"));
    } catch (err) {
      message.error(err?.message || t("updateFailed"));
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordSave = async (values) => {
    setPwLoading(true);
    try {
      await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      pwForm.resetFields();
      message.success(t("passwordUpdated"));
    } catch (err) {
      message.error(err?.message || t("passwordUpdateFailed"));
    } finally {
      setPwLoading(false);
    }
  };

  const handleEmailSendCode = async () => {
    const email = emailForm.getFieldValue("email");
    if (!email) {
      emailForm.validateFields(["email"]);
      return;
    }
    setEmailCodeLoading(true);
    try {
      await sendCode(email, "EMAIL");
      message.success(t("codeSent"));
      setEmailCodeCountdown(60);
      const timer = setInterval(() => {
        setEmailCodeCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      message.error(err?.message || t("sendCodeFailed"));
    } finally {
      setEmailCodeLoading(false);
    }
  };

  const handleEmailSave = async (values) => {
    setEmailLoading(true);
    try {
      const updated = await updateIdentifier({
        type: "email",
        identifier: values.email,
        code: values.emailCode,
      });
      onProfileChange(updated);
      emailForm.resetFields(["emailCode"]);
      setEmailCodeCountdown(0);
      message.success(t("emailUpdated"));
    } catch (err) {
      message.error(err?.message || t("emailUpdateFailed"));
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePhoneSave = async (values) => {
    setPhoneLoading(true);
    try {
      const updated = await updateIdentifier({
        type: "phone",
        identifier: values.countryCode + values.phoneNumber,
      });
      onProfileChange(updated);
      message.success(t("phoneUpdated"));
    } catch (err) {
      message.error(err?.message || t("phoneUpdateFailed"));
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleLocaleSave = async (values) => {
    setLocaleLoading(true);
    try {
      const updated = await updateLocale(values.preferredLocale);
      onProfileChange(updated);
      message.success(t("languageUpdated"));
    } catch (err) {
      message.error(err?.message || t("updateFailed"));
    } finally {
      setLocaleLoading(false);
    }
  };

  const [wechatLoading, setWechatLoading] = useState(false);

  const handleWechatBind = async () => {
    setWechatLoading(true);
    try {
      const isMobile = /MicroMessenger/i.test(navigator.userAgent);
      const { url } = await getWechatAuthUrl(isMobile ? "mp" : "pc");
      localStorage.setItem("wechat_intent", "bind");
      window.location.href = url;
    } catch (err) {
      message.error(err?.message || t("wechatBindFailed"));
      setWechatLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <Layout style={{ height: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div className="header-slot-wrap">
          <div className="header-slot-bar">
            <div className="header-slot-actions">
              <HeaderActionButton
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
              />
            </div>
            <span className="header-slot-title">{t("profileTitle")}</span>
          </div>
        </div>
      </Header>

      <Content
        style={{
          overflowY: "auto",
          padding: "32px 24px 48px",
        }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          {/* Avatar + name card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 28,
              paddingBottom: 28,
            }}
          >
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={({ file }) => handleAvatarUpload({ file })}
            >
              <div
                className={`neu-avatar-btn${profile.avatar_url ? "" : " neu-avatar-btn--accent"}`}
                style={{
                  position: "relative",
                }}
              >
                <Avatar
                  size={96}
                  src={profile.avatar_url}
                  icon={!profile.avatar_url && <UserOutlined />}
                  style={{
                    background: profile.avatar_url
                      ? "transparent"
                      : "var(--neu-accent)",
                  }}
                />
                {avatarLoading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: radius.round,
                      background: "rgba(0,0,0,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 20,
                    }}
                  >
                    <LoadingOutlined />
                  </div>
                )}
              </div>
            </Upload>
            <div
              style={{
                marginTop: 12,
                fontSize: 18,
                color: "var(--neu-text)",
              }}
            >
              {profile.display_name}
            </div>
            {profile.email && (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--neu-text-2)",
                  marginTop: 3,
                }}
              >
                {profile.email}
              </div>
            )}
          </div>

          <Divider style={{ margin: "0 0 24px" }} />

          {/* Display Name */}
          <SectionCard>
            <SectionLabel title={t("displayName")} />
            <Form
              form={nameForm}
              onFinish={handleNameSave}
              initialValues={{ displayName: profile.display_name }}
              layout="vertical"
            >
              <Form.Item
                name="displayName"
                rules={[
                  { required: true, message: t("displayNameRequired") },
                  { max: 64, message: t("displayNameMax") },
                ]}
                style={{ marginBottom: 12 }}
              >
                <NeuInput
                  prefix={<UserOutlined />}
                  placeholder={t("displayName")}
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={nameLoading}
                  style={{ width: "100%" }}
                >
                  {t("saveDisplayName")}
                </Button>
              </Form.Item>
            </Form>
          </SectionCard>

          {/* Password */}
          <SectionCard>
            <SectionLabel title={t("changePassword")} />
            <Form form={pwForm} onFinish={handlePasswordSave} layout="vertical">
              <Form.Item
                name="currentPassword"
                rules={[
                  { required: true, message: t("currentPasswordRequired") },
                ]}
                style={{ marginBottom: 10 }}
              >
                <NeuInput.Password
                  prefix={<LockOutlined />}
                  placeholder={t("currentPassword")}
                />
              </Form.Item>
              <Form.Item
                name="newPassword"
                rules={[
                  { required: true, message: t("newPasswordRequired") },
                  { min: 6, message: t("newPasswordMin") },
                ]}
                style={{ marginBottom: 10 }}
              >
                <NeuInput.Password
                  prefix={<LockOutlined />}
                  placeholder={t("newPassword")}
                />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: t("confirmPasswordRequired") },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value)
                        return Promise.resolve();
                      return Promise.reject(new Error(t("passwordMismatch")));
                    },
                  }),
                ]}
                style={{ marginBottom: 12 }}
              >
                <NeuInput.Password
                  prefix={<LockOutlined />}
                  placeholder={t("confirmPassword")}
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={pwLoading}
                  style={{ width: "100%" }}
                >
                  {t("updatePassword")}
                </Button>
              </Form.Item>
            </Form>
          </SectionCard>

          {/* Email */}
          <SectionCard>
            <SectionLabel title={t("loginEmail")} />
            <Form
              form={emailForm}
              onFinish={handleEmailSave}
              initialValues={{ email: profile.email }}
              layout="vertical"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: t("emailRequired") },
                  { type: "email", message: t("emailInvalid") },
                ]}
                style={{ marginBottom: 10 }}
              >
                <NeuInput
                  prefix={<MailOutlined />}
                  placeholder={t("emailAddress")}
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <Form.Item
                    name="emailCode"
                    noStyle
                    rules={[{ required: true, message: t("codeRequired") }]}
                  >
                    <NeuInput placeholder={t("verificationCode")} />
                  </Form.Item>
                  <Button
                    loading={emailCodeLoading}
                    onClick={
                      emailCodeCountdown > 0 ? undefined : handleEmailSendCode
                    }
                    className={
                      emailCodeCountdown > 0 ? "btn-counting-down" : ""
                    }
                    style={{ flexShrink: 0 }}
                  >
                    {emailCodeCountdown > 0
                      ? `${emailCodeCountdown}s`
                      : t("sendCode")}
                  </Button>
                </div>
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={emailLoading}
                  style={{ width: "100%" }}
                >
                  {t("updateEmail")}
                </Button>
              </Form.Item>
            </Form>
          </SectionCard>

          {/* Phone */}
          <SectionCard>
            <SectionLabel title={t("phoneNumber")} />
            <Form
              form={phoneForm}
              onFinish={handlePhoneSave}
              initialValues={parsePhone(profile.phone)}
              key={profile.phone}
              layout="vertical"
            >
              <Form.Item style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <Form.Item name="countryCode" noStyle>
                    <NeuSelect
                      fullWidth={false}
                      style={{ width: 110 }}
                      optionLabelProp="label"
                    >
                      {COUNTRIES.map((c) => (
                        <NeuSelect.Option
                          key={c.code}
                          value={c.code}
                          label={c.code}
                        >
                          {locale === "zh-CN" ? c.zh : c.en} {c.code}
                        </NeuSelect.Option>
                      ))}
                    </NeuSelect>
                  </Form.Item>
                  <div style={{ flex: 1 }}>
                    <Form.Item
                      name="phoneNumber"
                      noStyle
                      rules={[
                        { required: true, message: t("phoneRequired") },
                        { pattern: /^\d{5,15}$/, message: t("phoneInvalid") },
                      ]}
                    >
                      <NeuInput placeholder={t("phoneNumber")} />
                    </Form.Item>
                  </div>
                </div>
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={phoneLoading}
                  style={{ width: "100%" }}
                >
                  {profile.phone ? t("updatePhone") : t("bindPhone")}
                </Button>
              </Form.Item>
            </Form>
          </SectionCard>

          {/* WeChat */}
          <SectionCard>
            <SectionLabel title={t("wechatAccount")} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: profile.wechat_bound
                    ? "var(--neu-accent)"
                    : "var(--neu-text-2)",
                }}
              >
                {profile.wechat_bound ? t("wechatBound") : t("wechatNotBound")}
              </span>
              <Button
                loading={wechatLoading}
                onClick={handleWechatBind}
                style={{ flexShrink: 0 }}
              >
                {profile.wechat_bound ? t("changeWechat") : t("bindWechat")}
              </Button>
            </div>
          </SectionCard>

          {/* Language */}
          <SectionCard>
            <SectionLabel title={t("preferredLanguage")} />
            <Form
              form={localeForm}
              onFinish={handleLocaleSave}
              initialValues={{
                preferredLocale: profile.preferred_locale || locale,
              }}
              key={profile.preferred_locale}
              layout="vertical"
            >
              <Form.Item name="preferredLocale" style={{ marginBottom: 12 }}>
                <Radio.Group>
                  <Radio value="en-US">English</Radio>
                  <Radio value="zh-CN">中文</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={localeLoading}
                  style={{ width: "100%" }}
                >
                  {t("saveLanguage")}
                </Button>
              </Form.Item>
            </Form>
          </SectionCard>

          <Button
            danger
            icon={<LogoutOutlined />}
            onClick={onLogout}
            style={{ width: "100%", marginTop: 8 }}
          >
            {t("logout")}
          </Button>
        </div>
      </Content>
    </Layout>
  );
}
