import { Layout } from "antd";
import { useState } from "react";
import { LoginForm, SignupForm } from "./components/auth";
import ObjectList from "./components/ObjectList";

const { Header, Content } = Layout;

function App() {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState("brands");

  return (
    <Layout style={{ height: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 32,
          paddingRight: 32,
          gap: 24,
        }}
      >
        {/* Logo */}
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 2.5,
            textTransform: "uppercase",
            color: "#3c4f68",
            flexShrink: 0,
          }}
        >
          Mini <span style={{ color: "#5592cc" }}>Collections</span>
        </span>

        {/* Tab buttons — only when logged in */}
        {authed && (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className={`neu-tab-btn${activeTab === "brands" ? " active" : ""}`}
              onClick={() => setActiveTab("brands")}
            >
              Brands
            </button>
            <button
              className={`neu-tab-btn${activeTab === "groups" ? " active" : ""}`}
              onClick={() => setActiveTab("groups")}
            >
              My Groups
            </button>
          </div>
        )}

        {/* Right slot */}
        <div style={{ flexShrink: 0 }}>
          {authed ? null : <SignupForm />}
        </div>
      </Header>

      <Content
        style={{
          padding: "32px 48px",
          maxHeight: "calc(100% - 64px)",
          overflowY: "auto",
        }}
      >
        {authed ? (
          <ObjectList activeTab={activeTab} />
        ) : (
          <LoginForm onSuccess={() => setAuthed(true)} />
        )}
      </Content>
    </Layout>
  );
}

export default App;
