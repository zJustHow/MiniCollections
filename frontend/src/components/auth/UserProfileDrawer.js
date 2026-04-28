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
  uploadAvatar,
} from "../../utils";

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
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const [nameForm] = Form.useForm();
  const [pwForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [phoneForm] = Form.useForm();

  const handleAvatarUpload = async ({ file }) => {
    setAvatarLoading(true);
    try {
      const updated = await uploadAvatar(file);
      onProfileChange(updated);
      message.success("头像已更新");
    } catch (err) {
      message.error(err.message || "头像上传失败");
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
      message.success("用户名已更新");
    } catch (err) {
      message.error(err.message || "更新失败");
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
      message.success("密码已更新");
    } catch (err) {
      message.error(err.message || "密码更新失败");
    } finally {
      setPwLoading(false);
    }
  };

  const handleEmailSave = async (values) => {
    setEmailLoading(true);
    try {
      const updated = await updateIdentifier({ type: "email", identifier: values.email });
      onProfileChange(updated);
      message.success("邮箱已更新");
    } catch (err) {
      message.error(err.message || "邮箱更新失败");
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePhoneSave = async (values) => {
    setPhoneLoading(true);
    try {
      const updated = await updateIdentifier({ type: "phone", identifier: values.phone });
      onProfileChange(updated);
      message.success("手机号已更新");
    } catch (err) {
      message.error(err.message || "手机号更新失败");
    } finally {
      setPhoneLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <Drawer
      title="个人资料"
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
      <Section title="用户名" />
      <Form
        form={nameForm}
        onFinish={handleNameSave}
        initialValues={{ displayName: profile.display_name }}
        layout="vertical"
        style={{ marginBottom: 24 }}
      >
        <Form.Item
          name="displayName"
          rules={[{ required: true, message: "请输入用户名" }, { max: 64, message: "最多 64 个字符" }]}
          style={{ marginBottom: 10 }}
        >
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={nameLoading} style={{ width: "100%" }}>
            保存用户名
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: "0 0 20px" }} />

      {/* Avatar URL (fallback text input when no upload service) */}

      {/* Password */}
      <Section title="修改密码" />
      <Form
        form={pwForm}
        onFinish={handlePasswordSave}
        layout="vertical"
        style={{ marginBottom: 24 }}
      >
        <Form.Item
          name="currentPassword"
          rules={[{ required: true, message: "请输入当前密码" }]}
          style={{ marginBottom: 10 }}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="当前密码" />
        </Form.Item>
        <Form.Item
          name="newPassword"
          rules={[{ required: true, message: "请输入新密码" }, { min: 6, message: "至少 6 个字符" }]}
          style={{ marginBottom: 10 }}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="新密码" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "请确认新密码" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                return Promise.reject(new Error("两次输入的密码不一致"));
              },
            }),
          ]}
          style={{ marginBottom: 10 }}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="确认新密码" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={pwLoading} style={{ width: "100%" }}>
            更新密码
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: "0 0 20px" }} />

      {/* Email */}
      <Section title="登录邮箱" />
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
            { required: true, message: "请输入邮箱" },
            { type: "email", message: "邮箱格式不正确" },
          ]}
          style={{ marginBottom: 10 }}
        >
          <Input prefix={<MailOutlined />} placeholder="邮箱地址" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={emailLoading} style={{ width: "100%" }}>
            更新邮箱
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: "0 0 20px" }} />

      {/* Phone */}
      <Section title="手机号码" />
      <Form
        form={phoneForm}
        onFinish={handlePhoneSave}
        initialValues={{ phone: profile.phone }}
        key={profile.phone}
        layout="vertical"
      >
        <Form.Item
          name="phone"
          rules={[{ required: true, message: "请输入手机号" }]}
          style={{ marginBottom: 10 }}
        >
          <Input prefix={<PhoneOutlined />} placeholder="手机号码" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={phoneLoading} style={{ width: "100%" }}>
            {profile.phone ? "更新手机号" : "绑定手机号"}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
}

export default UserProfileDrawer;
