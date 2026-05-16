import {
  App, Button, Form, Input, Radio, Select, Modal,
} from "antd";
import { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { signup, COUNTRIES } from "../../utils";
import { useLocale } from "../../LocaleContext";
import { detectBrowserLocale } from "../../i18n";

function SignupForm({ linkMode = false }) {
  const { message } = App.useApp();
  const [displayModal, setDisplayModal] = useState(false);
  const [registerType, setRegisterType] = useState("email");
  const [form] = Form.useForm();
  const { t, setLocale, locale } = useLocale();

  const handleCancel = () => {
    setDisplayModal(false);
    setRegisterType("email");
  };

  const handleTypeChange = (e) => {
    setRegisterType(e.target.value);
  };

  const onFinish = async (values) => {
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
      setDisplayModal(false);
      message.success(t("registerSuccess"));
    } catch (err) {
      message.error(err?.message);
    }
  };

  return (
    <>
      <Button
        type={linkMode ? "link" : "primary"}
        shape={linkMode ? undefined : "round"}
        onClick={() => setDisplayModal(true)}
        style={linkMode ? { padding: 0, height: "auto", fontSize: 13 } : undefined}
      >
        {t("register")}
      </Button>
      <Modal
        title={t("register")}
        open={displayModal}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose={true}
      >
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <Radio.Group
            value={registerType}
            onChange={handleTypeChange}
            buttonStyle="solid"
          >
            <Radio.Button value="email">{t("registerWithEmail")}</Radio.Button>
            <Radio.Button value="phone">{t("registerWithPhone")}</Radio.Button>
          </Radio.Group>
        </div>

        <Form
          form={form}
          name="normal_register"
          initialValues={{ preferred_locale: detectBrowserLocale(), countryCode: "+86" }}
          onFinish={onFinish}
          preserve={false}
        >
          <Form.Item
            name="email"
            style={{ display: registerType === "email" ? "block" : "none" }}
            rules={registerType === "email" ? [
              { required: true, message: t("emailRequired") },
              { type: "email", message: t("emailInvalid") },
            ] : []}
          >
            <Input prefix={<UserOutlined />} placeholder={t("email")} />
          </Form.Item>

          <Form.Item
            style={{ display: registerType === "phone" ? "block" : "none", marginBottom: 24 }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <Form.Item name="countryCode" noStyle>
                <Select style={{ width: 110 }} optionLabelProp="label">
                  {COUNTRIES.map((c) => (
                    <Select.Option key={c.code} value={c.code} label={c.code}>
                      {locale === "zh-CN" ? c.zh : c.en} {c.code}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <div style={{ flex: 1 }}>
                <Form.Item
                  name="phoneNumber"
                  noStyle
                  rules={registerType === "phone" ? [
                    { required: true, message: t("phoneRequired") },
                    { pattern: /^\d{5,15}$/, message: t("phoneInvalid") },
                  ] : []}
                >
                  <Input style={{ width: "100%" }} placeholder={t("phoneNumber")} />
                </Form.Item>
              </div>
            </div>
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: t("passwordRequired") },
              { min: 6, message: t("newPasswordMin") },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t("password")} />
          </Form.Item>
          <Form.Item
            name="name"
            rules={[{ required: true, message: t("signupNameRequired") }]}
          >
            <Input prefix={<UserOutlined />} placeholder={t("username")} />
          </Form.Item>
          <Form.Item name="preferred_locale" label={t("language")}>
            <Radio.Group>
              <Radio value="en-US">English</Radio>
              <Radio value="zh-CN">中文</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t("register")}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default SignupForm;
