import { Layout, Avatar, Tooltip } from "antd";
import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import UserProfileDrawer from "./components/auth/UserProfileDrawer";
import ObjectList from "./components/ObjectList";
import GuestBrandsView from "./components/GuestBrandsView";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import { getMe } from "./utils";
import { useLocale } from "./LocaleContext";

const { Header, Content } = Layout;

function MainLayout({ authed, setAuthed, profile, setProfile, isAdmin }) {
  const [activeTab, setActiveTab] = useState("brands");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { t, setLocale } = useLocale();

  const handleProfileChange = (updated) => {
    setProfile(updated);
    if (updated.preferred_locale) setLocale(updated.preferred_locale);
  };

  const goToLogin = () => navigate("/login");

  const handleTabChange = (tab) => {
    if (!authed && tab === "groups") {
      goToLogin();
      return;
    }
    setActiveTab(tab);
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

        {/* Tab buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className={`neu-tab-btn${activeTab === "brands" ? " active" : ""}`}
            onClick={() => handleTabChange("brands")}
          >
            {t("brands")}
          </button>
          <button
            className={`neu-tab-btn${activeTab === "groups" ? " active" : ""}`}
            onClick={() => handleTabChange("groups")}
          >
            {t("myGroups")}
          </button>
          {isAdmin && (
            <button
              className="neu-tab-btn"
              onClick={() => navigate("/admin")}
            >
              {t("adminPanel")}
            </button>
          )}
        </div>

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
            <Tooltip title={t("signIn")} placement="bottomRight">
              <Avatar
                icon={<UserOutlined />}
                size={36}
                onClick={goToLogin}
                style={{
                  cursor: "pointer",
                  boxShadow: "var(--raised-sm)",
                  background: "var(--neu-surface)",
                  color: "var(--neu-text-2)",
                  flexShrink: 0,
                  transition: "box-shadow 0.15s ease",
                }}
              />
            </Tooltip>
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
          <GuestBrandsView onAuthRequired={goToLogin} />
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

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const { setLocale } = useLocale();

  const isAdmin = profile?.admin === true;

  const handleLoginSuccess = async () => {
    try {
      const me = await getMe();
      setProfile(me);
      if (me.preferred_locale) setLocale(me.preferred_locale);
    } catch {
      // proceed even if profile fetch fails
    }
    setAuthed(true);
    navigate("/");
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authed ? <Navigate to="/" replace /> : <LoginPage onSuccess={handleLoginSuccess} />
        }
      />
      <Route
        path="/register"
        element={
          authed ? <Navigate to="/" replace /> : <RegisterPage />
        }
      />
      <Route
        path="/admin"
        element={
          !authed ? <Navigate to="/login" replace /> :
          !isAdmin ? <Navigate to="/" replace /> :
          <AdminPage />
        }
      />
      <Route
        path="/*"
        element={
          <MainLayout
            authed={authed}
            setAuthed={setAuthed}
            profile={profile}
            setProfile={setProfile}
            isAdmin={isAdmin}
          />
        }
      />
    </Routes>
  );
}
