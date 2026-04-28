import { useState } from "react";
import {
  Drawer,
  Avatar,
  Form,
  Input,
  Button,
  message,
  Divider,
  Upload,
  Radio,
} from "antd";
import {
  UserOutlined,
  CameraOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import {
  updateProfile,
  updatePassword,
  updateIdentifier,
  updateLocale,
  uploadAvatar,
} from "../../utils";
import { useLocale } from "../../LocaleContext";

function Section({ title }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: "var(--neu-text-2)",
        marginBottom: 14,
        marginTop: 4,
      }}
    >
      {title}
    </div>
  );
}

function UserProfileDrawer({ open, onClose, profile, onProfileChange }) {
  const { t, locale } = useLocale();
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
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
      message.error(err.message || t("avatarUploadFailed"));
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
      message.error(err.message || t("updateFailed"));
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
      message.error(err.message || t("passwordUpdateFailed"));
    } finally {
      setPwLoading(false);
    }
  };

  const handleEmailSave = async (values) => {
    setEmailLoading(true);
    try {
      const updated = await updateIdentifier({ type: "email", identifier: values.email });
      onProfileChange(updated);
      message.success(t("emailUpdated"));
    } catch (err) {
      message.error(err.message || t("emailUpdateFailed"));
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePhoneSave = async (values) => {
    setPhoneLoading(true);
    try {
      const updated = await updateIdentifier({ type: "phone", identifier: values.phone });
      onProfileChange(updated);
      message.success(t("phoneUpdated"));
    } catch (err) {
      message.error(err.message || t("phoneUpdateFailed"));
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
      message.error(err.message || t("updateFailed"));
    } finally {
      setLocaleLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <Drawer
      title={t("profileTitle")}
      placement="right"
      width={380}
      open={open}
      onClose={onClose}
    >
      {/* Avatar */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <Avatar
            size={88}
            src={profile.avatar_url}
            icon={!profile.avatar_url && <UserOutlined />}
            style={{
              boxShadow: "var(--raised)",
              background: profile.avatar_url ? "transparent" : "var(--neu-accent)",
            }}
          />
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={({ file }) => handleAvatarUpload({ file })}
          >
            <Button
              size="small"
              icon={<CameraOutlined />}
              loading={avatarLoading}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                borderRadius: "50%",
                width: 28,
                height: 28,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
              }}
            />
          </Upload>
        </div>
        <div
          style={{
            marginTop: 10,
            fontWeight: 700,
            fontSize: 16,
            color: "var(--neu-text)",
          }}
        >
          {profile.display_name}
        </div>
        <div style={{ fontSize: 12, color: "var(--neu-text-2)", marginTop: 2 }}>
          {profile.email}
        </div>
      </div>

      <Divider style={{ margin: "0 0 20px" }} />

      {/* Display Name */}
      <Section title={t("displayName")} />
      <Form
        form={nameForm}
        onFinish={handleNameSave}
        initialValues={{ displayName: profile.display_name }}
        layout="vertical"
        style={{ marginBottom: 24 }}
      >
        <Form.Item
          name="displayName"
          rules={[
            { required: true, message: t("displayNameRequired") },
            { max: 64, message: t("displayNameMax") },
          ]}
          style={{ marginBottom: 10 }}
        >
          <Input prefix={<UserOutlined />} placeholder={t("displayName")} />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={nameLoading} style={{ width: "100%" }}>
            {t("saveDisplayName")}
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: "0 0 20px" }} />

      {/* Password */}
      <Section title={t("changePassword")} />
      <Form
        form={pwForm}
        onFinish={handlePasswordSave}
        layout="vertical"
        style={{ marginBottom: 24 }}
      >
        <Form.Item
          name="currentPassword"
          rules={[{ required: true, message: t("currentPasswordRequired") }]}
          style={{ marginBottom: 10 }}
        >
          <Input.Password prefix={<LockOutlined />} placeholder={t("currentPassword")} />
        </Form.Item>
        <Form.Item
          name="newPassword"
          rules={[
            { required: true, message: t("newPasswordRequired") },
            { min: 6, message: t("newPasswordMin") },
          ]}
          style={{ marginBottom: 10 }}
        >
          <Input.Password prefix={<LockOutlined />} placeholder={t("newPassword")} />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: t("confirmPasswordRequired") },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                return Promise.reject(new Error(t("passwordMismatch")));
              },
            }),
          ]}
          style={{ marginBottom: 10 }}
        >
          <Input.Password prefix={<LockOutlined />} placeholder={t("confirmPassword")} />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={pwLoading} style={{ width: "100%" }}>
            {t("updatePassword")}
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: "0 0 20px" }} />

      {/* Email */}
      <Section title={t("loginEmail")} />
      <Form
        form={emailForm}
        onFinish={handleEmailSave}
        initialValues={{ email: profile.email }}
        layout="vertical"
        style={{ marginBottom: 24 }}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: t("emailRequired") },
            { type: "email", message: t("emailInvalid") },
          ]}
          style={{ marginBottom: 10 }}
        >
          <Input prefix={<MailOutlined />} placeholder={t("emailAddress")} />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={emailLoading} style={{ width: "100%" }}>
            {t("updateEmail")}
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: "0 0 20px" }} />

      {/* Phone */}
      <Section title={t("phoneNumber")} />
      <Form
        form={phoneForm}
        onFinish={handlePhoneSave}
        initialValues={{ phone: profile.phone }}
        key={profile.phone}
        layout="vertical"
        style={{ marginBottom: 24 }}
      >
        <Form.Item
          name="phone"
          rules={[{ required: true, message: t("phoneRequired") }]}
          style={{ marginBottom: 10 }}
        >
          <Input prefix={<PhoneOutlined />} placeholder={t("phoneNumber")} />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={phoneLoading} style={{ width: "100%" }}>
            {profile.phone ? t("updatePhone") : t("bindPhone")}
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: "0 0 20px" }} />

      {/* Preferred Language */}
      <Section title={t("preferredLanguage")} />
      <Form
        form={localeForm}
        onFinish={handleLocaleSave}
        initialValues={{ preferredLocale: profile.preferred_locale || locale }}
        key={profile.preferred_locale}
        layout="vertical"
      >
        <Form.Item name="preferredLocale" style={{ marginBottom: 10 }}>
          <Radio.Group>
            <Radio value="en-US">English</Radio>
            <Radio value="zh-CN">中文</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={localeLoading} style={{ width: "100%" }}>
            {t("saveLanguage")}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
}

export default UserProfileDrawer;
