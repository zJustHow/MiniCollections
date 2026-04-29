import { Layout } from "antd";
import LoginForm from "../components/auth/LoginForm";

const { Header, Content } = Layout;

export default function LoginPage({ onSuccess }) {
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
        <LoginForm onSuccess={onSuccess} />
      </Content>
    </Layout>
  );
}
