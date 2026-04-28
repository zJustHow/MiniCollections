import { Button, Form, Input, message, Modal, Radio } from "antd";
import { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { signup } from "../../utils";
import { useLocale } from "../../LocaleContext";
import { detectBrowserLocale } from "../../i18n";

function SignupForm() {
  const [displayModal, setDisplayModal] = useState(false);
  const { t, setLocale } = useLocale();

  const handleCancel = () => {
    setDisplayModal(false);
  };

  const onFinish = async (data) => {
    try {
      await signup(data);
      if (data.preferred_locale) setLocale(data.preferred_locale);
      setDisplayModal(false);
      message.success(t("registerSuccess"));
    } catch (err) {
      message.error(err.message);
    }
  };

  return (
    <>
      <Button shape="round" type="primary" onClick={() => setDisplayModal(true)}>
        {t("register")}
      </Button>
      <Modal
        title={t("register")}
        open={displayModal}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose={true}
      >
        <Form
          name="normal_register"
          initialValues={{ preferred_locale: detectBrowserLocale() }}
          onFinish={onFinish}
          preserve={false}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: t("emailRequired") }]}
          >
            <Input prefix={<UserOutlined />} placeholder={t("email")} />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: t("passwordRequired") }]}
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
