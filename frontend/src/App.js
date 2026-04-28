import { Layout, Avatar, Tooltip } from "antd";
import { useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { LoginForm, SignupForm } from "./components/auth";
import UserProfileDrawer from "./components/auth/UserProfileDrawer";
import ObjectList from "./components/ObjectList";
import { getMe } from "./utils";
import { useLocale } from "./LocaleContext";

const { Header, Content } = Layout;

function App() {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState("brands");
  const [profile, setProfile] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t, setLocale } = useLocale();

  const handleLoginSuccess = async () => {
    try {
      const me = await getMe();
      setProfile(me);
      if (me.preferred_locale) setLocale(me.preferred_locale);
    } catch {
      // proceed even if profile fetch fails
    }
    setAuthed(true);
  };

  const handleProfileChange = (updated) => {
    setProfile(updated);
    if (updated.preferred_locale) setLocale(updated.preferred_locale);
  };

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
              {t("brands")}
            </button>
            <button
              className={`neu-tab-btn${activeTab === "groups" ? " active" : ""}`}
              onClick={() => setActiveTab("groups")}
            >
              {t("myGroups")}
            </button>
          </div>
        )}

        {/* Right slot */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 12 }}>
          {authed ? (
            <Tooltip title={profile?.display_name || t("profile")} placement="bottomRight">
              <Avatar
                src={profile?.avatar_url}
                icon={!profile?.avatar_url && <UserOutlined />}
                size={36}
                onClick={() => setDrawerOpen(true)}
                style={{
                  cursor: "pointer",
                  boxShadow: "var(--raised-sm)",
                  background: profile?.avatar_url ? "transparent" : "var(--neu-accent)",
                  flexShrink: 0,
                  transition: "box-shadow 0.15s ease",
                }}
              />
            </Tooltip>
          ) : (
            <SignupForm />
          )}
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
          <LoginForm onSuccess={handleLoginSuccess} />
        )}
      </Content>

      <UserProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        profile={profile}
        onProfileChange={handleProfileChange}
      />
    </Layout>
  );
}

export default App;
