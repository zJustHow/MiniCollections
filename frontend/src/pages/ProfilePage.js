import {
  App,
  Avatar,
  Divider,
  Form,
  Radio,
  Upload,
} from "antd";
import HeaderActionButton from "../components/HeaderActionButton";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton";
import NeuButton from "../components/NeuButton";
import PageLoader from "../components/PageLoader";
import { NeuInput, NeuSelect } from "../components/NeuFormControl";
import {
  ArrowLeftOutlined,
  LoadingOutlined,
  LockOutlined,
  LogoutOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useLayoutEffect, useState } from "react";
import useCountdown from "../hooks/useCountdown";
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
import { useHeader } from "../HeaderContext";
import { PHONE_AUTH_ENABLED, WECHAT_AUTH_ENABLED } from "../components/auth/authFeatures";
import "../styles/profile.css";

function SectionLabel({ title }) {
  return <div className="profile-section-label">{title}</div>;
}

function SectionCard({ children }) {
  return <div className="profile-section-card">{children}</div>;
}

export default function ProfilePage({ profile, onProfileChange, onLogout }) {
  const { message } = App.useApp();
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const { setHeaderSlot } = useHeader();

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailCodeLoading, setEmailCodeLoading] = useState(false);
  const { countdown: emailCodeCountdown, start: startEmailCodeCountdown, reset: resetEmailCodeCountdown } = useCountdown();
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
      startEmailCodeCountdown(60);
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
      resetEmailCodeCountdown();
      message.success(t("emailUpdated"));
    } catch (err) {
      message.error(err?.message || t("emailUpdateFailed"));
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePhoneSave = async (values) => {
    if (!PHONE_AUTH_ENABLED) return;
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
    if (!WECHAT_AUTH_ENABLED) return;
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

  useLayoutEffect(() => {
    setHeaderSlot(
      <div className="header-slot-bar">
        <div className="header-slot-actions">
          <HeaderActionButton
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          />
        </div>
        <div className="header-slot-actions header-slot-actions-end">
          <ConfirmDeleteButton
            variant="header"
            icon={<LogoutOutlined />}
            onConfirm={onLogout}
            confirmLabel={t("confirmLogout")}
            deleteLabel={t("logout")}
          />
        </div>
        <span className="header-slot-title">{t("profileTitle")}</span>
      </div>,
    );
    return () => setHeaderSlot(null);
  }, [t, navigate, setHeaderSlot, onLogout]);

  if (!profile) return <PageLoader />;

  return (
    <div className="profile-page-content">
      <div className="profile-page-inner">
          <div className="profile-hero">
            <Upload
              id="profile-avatar-upload"
              className="profile-avatar-upload"
              name="avatar"
              accept="image/*"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={({ file }) => handleAvatarUpload({ file })}
            >
              <div className="neu-card neu-card--avatar profile-avatar-wrap">
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
                  <div className="profile-avatar-overlay">
                    <LoadingOutlined />
                  </div>
                )}
              </div>
            </Upload>
            <div className="profile-display-name">{profile.display_name}</div>
            {profile.email && (
              <div className="profile-display-email">{profile.email}</div>
            )}
          </div>

          <Divider className="profile-divider" />

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
                className="profile-form-item-submit"
              >
                <NeuInput
                  prefix={<UserOutlined />}
                  placeholder={t("displayName")}
                  autoComplete="nickname"
                />
              </Form.Item>
              <Form.Item className="profile-form-item-none">
                <NeuButton
                  type="primary"
                  htmlType="submit"
                  loading={nameLoading}
                  className="profile-btn-full"
                >
                  {t("saveDisplayName")}
                </NeuButton>
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
                className="profile-form-item-tight"
              >
                <NeuInput.Password
                  prefix={<LockOutlined />}
                  placeholder={t("currentPassword")}
                  autoComplete="current-password"
                />
              </Form.Item>
              <Form.Item
                name="newPassword"
                rules={[
                  { required: true, message: t("newPasswordRequired") },
                  { min: 6, message: t("newPasswordMin") },
                ]}
                className="profile-form-item-tight"
              >
                <NeuInput.Password
                  prefix={<LockOutlined />}
                  placeholder={t("newPassword")}
                  autoComplete="new-password"
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
                className="profile-form-item-submit"
              >
                <NeuInput.Password
                  prefix={<LockOutlined />}
                  placeholder={t("confirmPassword")}
                  autoComplete="new-password"
                />
              </Form.Item>
              <Form.Item className="profile-form-item-none">
                <NeuButton
                  type="primary"
                  htmlType="submit"
                  loading={pwLoading}
                  className="profile-btn-full"
                >
                  {t("updatePassword")}
                </NeuButton>
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
                className="profile-form-item-tight"
              >
                <NeuInput
                  prefix={<MailOutlined />}
                  placeholder={t("emailAddress")}
                  autoComplete="email"
                />
              </Form.Item>
              <Form.Item className="profile-form-item-submit">
                <div className="profile-inline-row">
                  <Form.Item
                    name="emailCode"
                    noStyle
                    rules={[{ required: true, message: t("codeRequired") }]}
                    className="profile-inline-grow"
                  >
                    <NeuInput
                      placeholder={t("verificationCode")}
                      autoComplete="one-time-code"
                    />
                  </Form.Item>
                  <NeuButton
                    loading={emailCodeLoading}
                    disabled={emailCodeCountdown > 0}
                    onClick={handleEmailSendCode}
                    className="profile-btn-shrink"
                  >
                    {emailCodeCountdown > 0
                      ? `${emailCodeCountdown}s`
                      : t("sendCode")}
                  </NeuButton>
                </div>
              </Form.Item>
              <Form.Item className="profile-form-item-none">
                <NeuButton
                  type="primary"
                  htmlType="submit"
                  loading={emailLoading}
                  className="profile-btn-full"
                >
                  {t("updateEmail")}
                </NeuButton>
              </Form.Item>
            </Form>
          </SectionCard>

          {/* Phone */}
          <SectionCard>
            <SectionLabel
              title={
                PHONE_AUTH_ENABLED
                  ? t("phoneNumber")
                  : `${t("phoneNumber")} (${t("underDevelopment")})`
              }
            />
            <Form
              form={phoneForm}
              onFinish={handlePhoneSave}
              initialValues={parsePhone(profile.phone)}
              key={profile.phone}
              layout="vertical"
            >
              <Form.Item className="profile-form-item-submit">
                <div className="profile-inline-row">
                  <Form.Item name="countryCode" noStyle>
                    <NeuSelect
                      fullWidth={false}
                      style={{ width: 110 }}
                      optionLabelProp="label"
                      disabled={!PHONE_AUTH_ENABLED}
                      options={COUNTRIES.map((c) => ({
                        value: c.code,
                        label: `${locale === "zh-CN" ? c.zh : c.en} ${c.code}`,
                      }))}
                      optionLabelProp="value"
                    />
                  </Form.Item>
                  <div className="profile-inline-grow">
                    <Form.Item
                      name="phoneNumber"
                      noStyle
                      rules={[
                        { required: true, message: t("phoneRequired") },
                        { pattern: /^\d{5,15}$/, message: t("phoneInvalid") },
                      ]}
                    >
                      <NeuInput
                        placeholder={t("phoneNumber")}
                        disabled={!PHONE_AUTH_ENABLED}
                        autoComplete="tel-national"
                      />
                    </Form.Item>
                  </div>
                </div>
              </Form.Item>
              <Form.Item className="profile-form-item-none">
                <NeuButton
                  type="primary"
                  htmlType="submit"
                  loading={phoneLoading}
                  disabled={!PHONE_AUTH_ENABLED}
                  className="profile-btn-full"
                >
                  {profile.phone ? t("updatePhone") : t("bindPhone")}
                  {!PHONE_AUTH_ENABLED && ` (${t("underDevelopment")})`}
                </NeuButton>
              </Form.Item>
            </Form>
          </SectionCard>

          {/* WeChat */}
          <SectionCard>
            <SectionLabel
              title={
                WECHAT_AUTH_ENABLED
                  ? t("wechatAccount")
                  : `${t("wechatAccount")} (${t("underDevelopment")})`
              }
            />
            <div className="profile-wechat-row">
              <span
                className={`profile-wechat-status ${profile.wechat_bound ? "profile-wechat-status--bound" : "profile-wechat-status--unbound"}`}
              >
                {profile.wechat_bound ? t("wechatBound") : t("wechatNotBound")}
              </span>
              <NeuButton
                loading={wechatLoading}
                onClick={handleWechatBind}
                disabled={!WECHAT_AUTH_ENABLED}
                className="profile-btn-shrink"
              >
                {profile.wechat_bound ? t("changeWechat") : t("bindWechat")}
                {!WECHAT_AUTH_ENABLED && ` (${t("underDevelopment")})`}
              </NeuButton>
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
              <Form.Item name="preferredLocale" className="profile-form-item-submit">
                <Radio.Group>
                  <Radio value="en-US">{t("localeEnglish")}</Radio>
                  <Radio value="zh-CN">{t("localeChinese")}</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item className="profile-form-item-none">
                <NeuButton
                  type="primary"
                  htmlType="submit"
                  loading={localeLoading}
                  className="profile-btn-full"
                >
                  {t("saveLanguage")}
                </NeuButton>
              </Form.Item>
            </Form>
          </SectionCard>
      </div>
    </div>
  );
}
