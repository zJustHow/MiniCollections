import { Layout, Avatar, Tooltip } from "antd";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import ObjectList from "./components/ObjectList";
import GuestBrandsView from "./components/GuestBrandsView";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import FeedbackPage from "./pages/FeedbackPage";
import ProfilePage from "./pages/ProfilePage";
import BrandObjectsPage from "./pages/BrandObjectsPage";
import GroupObjectsPage from "./pages/GroupObjectsPage";
import { getMe, logout } from "./utils";
import { useLocale } from "./LocaleContext";
import { HeaderProvider, useHeader } from "./HeaderContext";

const { Header, Content } = Layout;

function MainLayoutInner({ authed, profile, isAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocale();
  const { headerSlot } = useHeader();

  const activeTab =
    location.pathname === "/groups"
      ? "groups"
      : location.pathname === "/feedback"
      ? "feedback"
      : location.pathname === "/admin"
      ? "admin"
      : "brands";

  const goToLogin = () => navigate("/login");

  const handleTabChange = (tab) => {
    if (!authed && (tab === "groups" || tab === "feedback")) {
      goToLogin();
      return;
    }
    if (tab === "brands") navigate("/");
    else if (tab === "groups") navigate("/groups");
    else if (tab === "feedback") navigate("/feedback");
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: 32,
          paddingRight: 32,
          gap: 24,
        }}
      >
        {/* Logo — hidden when a page injects its own header slot */}
        {!headerSlot && (
          <span
            className="header-logo"
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
        )}

        {/* Center slot: either custom page content or default nav tabs */}
        {headerSlot ? (
          <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
            {headerSlot}
          </div>
        ) : (
          <div className="header-tabs" style={{ display: "flex", gap: 10, flex: 1 }}>
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
              {t("groups")}
            </button>
            <button
              className={`neu-tab-btn${activeTab === "feedback" ? " active" : ""}`}
              onClick={() => handleTabChange("feedback")}
            >
              {t("feedback")}
            </button>
            {isAdmin && (
              <button
                className={`neu-tab-btn${activeTab === "admin" ? " active" : ""}`}
                onClick={() => navigate("/admin")}
              >
                {t("adminPanel")}
              </button>
            )}
          </div>
        )}

        {/* Right slot — hidden when page has its own header slot */}
        <div className="header-right" style={{ flexShrink: 0, display: headerSlot ? "none" : "flex", alignItems: "center", gap: 12 }}>
          {authed ? (
            <Tooltip title={profile?.display_name || t("profile")} placement="bottomRight">
              <Avatar
                src={profile?.avatar_url}
                icon={!profile?.avatar_url && <UserOutlined />}
                size={36}
                onClick={() => navigate("/profile")}
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
                  background: "var(--neu-bg)",
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
          padding: "clamp(12px, 3vw, 32px) clamp(12px, 4vw, 48px)",
          maxHeight: "calc(100% - 64px)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
}

function MainLayout({ authed, profile, isAdmin }) {
  return (
    <HeaderProvider>
      <MainLayoutInner authed={authed} profile={profile} isAdmin={isAdmin} />
    </HeaderProvider>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setLocale } = useLocale();

  const isAdmin = profile?.admin === true;

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then((me) => {
        setProfile(me);
        if (me.preferred_locale) setLocale(me.preferred_locale);
        setAuthed(true);
      })
      .catch(() => {
        localStorage.removeItem("auth_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleProfileChange = (updated) => {
    setProfile(updated);
    if (updated.preferred_locale) setLocale(updated.preferred_locale);
  };

  const handleLogout = () => {
    logout();
    setAuthed(false);
    setProfile(null);
    navigate("/");
  };

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

  if (loading) return null;

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
        path="/profile"
        element={
          !authed ? <Navigate to="/login" replace /> :
          <ProfilePage
            profile={profile}
            onProfileChange={handleProfileChange}
            onLogout={handleLogout}
          />
        }
      />
      <Route element={<MainLayout authed={authed} profile={profile} isAdmin={isAdmin} />}>
        <Route
          index
          element={authed ? <ObjectList activeTab="brands" isAdmin={isAdmin} /> : <GuestBrandsView />}
        />
        <Route
          path="groups"
          element={authed ? <ObjectList activeTab="groups" isAdmin={isAdmin} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="brands/:brandId"
          element={authed ? <BrandObjectsPage isAdmin={isAdmin} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="groups/:groupId"
          element={authed ? <GroupObjectsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="feedback"
          element={authed ? <FeedbackPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="admin"
          element={
            !authed ? <Navigate to="/login" replace /> :
            !isAdmin ? <Navigate to="/" replace /> :
            <AdminPage />
          }
        />
      </Route>
    </Routes>
  );
}
