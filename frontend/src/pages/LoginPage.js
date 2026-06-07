import { Layout } from "antd";
import LoginForm from "../components/auth/LoginForm";
import SiteLogo from "../components/SiteLogo";

const { Header, Content } = Layout;

export default function LoginPage({ onSuccess }) {
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
        <LoginForm onSuccess={onSuccess} />
      </Content>
    </Layout>
  );
}
