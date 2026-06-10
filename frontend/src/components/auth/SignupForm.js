import NeuButton from "../../components/NeuButton";
import { App, Form, Radio } from "antd";
import NeuFormDrawer from "../NeuFormDrawer";
import { NeuInput, NeuSelect } from "../NeuFormControl";
import { useState } from "react";
import LockOutlined from "@ant-design/icons/es/icons/LockOutlined.js";
import UserOutlined from "@ant-design/icons/es/icons/UserOutlined.js";
import { signup, COUNTRIES } from "../../utils";
import { useLocale } from "../../LocaleContext";
import { detectBrowserLocale } from "../../i18n";
import { PHONE_AUTH_ENABLED } from "./authFeatures";
import { neuRem } from "../../theme/fontScale";

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
      <NeuButton
        type={linkMode ? "link" : "primary"}
        onClick={() => setDisplayModal(true)}
        style={linkMode ? { padding: 0, height: "auto", fontSize: neuRem(13) } : undefined}
      >
        {t("register")}
      </NeuButton>
      <NeuFormDrawer
        title={t("register")}
        open={displayModal}
        onClose={handleCancel}
        footer={null}
        destroyOnClose
      >
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <Radio.Group
            value={registerType}
            onChange={handleTypeChange}
            buttonStyle="solid"
          >
            <Radio.Button value="email">{t("registerWithEmail")}</Radio.Button>
            <Radio.Button value="phone" disabled={!PHONE_AUTH_ENABLED}>
              {t("registerWithPhone")}
              {!PHONE_AUTH_ENABLED && ` (${t("underDevelopment")})`}
            </Radio.Button>
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
            <NeuInput
              prefix={<UserOutlined />}
              placeholder={t("email")}
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            style={{ display: registerType === "phone" ? "block" : "none", marginBottom: 24 }}
          >
            <div className="neu-phone-row">
              <Form.Item name="countryCode" noStyle>
                <NeuSelect fullWidth={false} style={{ width: 110 }} optionLabelProp="label">
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
                rules={registerType === "phone" ? [
                  { required: true, message: t("phoneRequired") },
                  { pattern: /^\d{5,15}$/, message: t("phoneInvalid") },
                ] : []}
              >
                <NeuInput
                  fullWidth
                  placeholder={t("phoneNumber")}
                  autoComplete="tel-national"
                />
              </Form.Item>
            </div>
          </Form.Item>

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
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            name="name"
            rules={[{ required: true, message: t("signupNameRequired") }]}
          >
            <NeuInput
              prefix={<UserOutlined />}
              placeholder={t("username")}
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item name="preferred_locale" label={t("language")}>
            <Radio.Group>
              <Radio value="en-US">English</Radio>
              <Radio value="zh-CN">中文</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <NeuButton type="primary" htmlType="submit">
              {t("register")}
            </NeuButton>
          </Form.Item>
        </Form>
      </NeuFormDrawer>
    </>
  );
}

export default SignupForm;
