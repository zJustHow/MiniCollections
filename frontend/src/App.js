import { Layout, Avatar, Tooltip } from "antd";
import { useState, useEffect, useRef } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { UserOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import ObjectList from "./components/ObjectList";
import GuestBrandsView from "./components/GuestBrandsView";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import AdminBrandObjectsPage from "./pages/admin/AdminBrandObjectsPage";
import FeedbackPage from "./pages/FeedbackPage";
import ProfilePage from "./pages/ProfilePage";
import BrandObjectsPage from "./pages/BrandObjectsPage";
import BrandObjectDetailPage from "./pages/BrandObjectDetailPage";
import GroupObjectsPage from "./pages/GroupObjectsPage";
import GroupObjectDetailPage from "./pages/GroupObjectDetailPage";
import WechatCallbackPage from "./pages/WechatCallbackPage";
import { getMe, logout } from "./utils";
import { useLocale } from "./LocaleContext";
import { HeaderProvider, useHeader } from "./HeaderContext";

const { Header, Content } = Layout;

function MainLayoutInner({ authed, profile, isAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocale();
  const { headerSlot } = useHeader();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const activeTab =
    location.pathname === "/groups"
      ? "groups"
      : location.pathname === "/feedback"
        ? "feedback"
        : location.pathname.startsWith("/admin")
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
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
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
          <span className="header-logo">
            Mini <span className="header-logo-accent">Collections</span>
          </span>
        )}

        {/* Center slot: either custom page content or default nav tabs */}
        {headerSlot ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              minWidth: 0,
            }}
          >
            {headerSlot}
          </div>
        ) : (
          <div className="header-tabs">
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
        <div
          className="header-right"
          style={{
            flexShrink: 0,
            display: headerSlot ? "none" : "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {authed ? (
            <Tooltip
              title={profile?.display_name || t("profile")}
              placement="bottomRight"
            >
              <button
                type="button"
                className={`neu-avatar-btn${profile?.avatar_url ? "" : " neu-avatar-btn--accent"}`}
                aria-label={profile?.display_name || t("profile")}
                onClick={() => navigate("/profile")}
              >
                <Avatar
                  src={profile?.avatar_url}
                  icon={!profile?.avatar_url && <UserOutlined />}
                  size={36}
                  style={{
                    background: profile?.avatar_url
                      ? "transparent"
                      : "var(--neu-accent)",
                  }}
                />
              </button>
            </Tooltip>
          ) : (
            <Tooltip title={t("signIn")} placement="bottomRight">
              <button
                type="button"
                className="neu-avatar-btn"
                aria-label={t("signIn")}
                onClick={goToLogin}
              >
                <Avatar
                  icon={<UserOutlined />}
                  size={36}
                  style={{
                    background: "var(--neu-bg)",
                    color: "var(--neu-text-2)",
                  }}
                />
              </button>
            </Tooltip>
          )}
        </div>

        {/* Mobile hamburger button — only visible on small screens */}
        {!headerSlot && (
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="menu"
          >
            {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        )}
      </Header>

      {/* Mobile dropdown menu */}
      {menuOpen && !headerSlot && (
        <div className="mobile-menu-overlay" ref={menuRef}>
          <button
            className={`mobile-menu-item${activeTab === "brands" ? " active" : ""}`}
            onClick={() => handleTabChange("brands")}
          >
            {t("brands")}
          </button>
          <button
            className={`mobile-menu-item${activeTab === "groups" ? " active" : ""}`}
            onClick={() => handleTabChange("groups")}
          >
            {t("groups")}
          </button>
          <button
            className={`mobile-menu-item${activeTab === "feedback" ? " active" : ""}`}
            onClick={() => handleTabChange("feedback")}
          >
            {t("feedback")}
          </button>
          {isAdmin && (
            <button
              className={`mobile-menu-item${activeTab === "admin" ? " active" : ""}`}
              onClick={() => navigate("/admin")}
            >
              {t("adminPanel")}
            </button>
          )}
          <div className="mobile-menu-divider" />
          <button
            type="button"
            className="mobile-menu-profile-btn"
            onClick={() => (authed ? navigate("/profile") : navigate("/login"))}
          >
            {authed ? profile?.display_name || t("profile") : t("signIn")}
          </button>
        </div>
      )}

      <Content
        id="main-content"
        style={{
          flex: 1,
          minHeight: 0,
          padding: "clamp(12px, 3vw, 32px) clamp(12px, 4vw, 48px)",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarGutter: "stable",
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

  const handleWechatBind = (updatedProfile) => {
    handleProfileChange(updatedProfile);
    // navigation to /profile is handled inside WechatCallbackPage
  };

  if (loading) return null;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authed ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage onSuccess={handleLoginSuccess} />
          )
        }
      />
      <Route
        path="/register"
        element={authed ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route
        path="/wechat-callback"
        element={
          authed && localStorage.getItem("wechat_intent") !== "bind" ? (
            <Navigate to="/" replace />
          ) : (
            <WechatCallbackPage
              onSuccess={handleLoginSuccess}
              onBind={handleWechatBind}
            />
          )
        }
      />
      <Route
        path="/profile"
        element={
          !authed ? (
            <Navigate to="/login" replace />
          ) : (
            <ProfilePage
              profile={profile}
              onProfileChange={handleProfileChange}
              onLogout={handleLogout}
            />
          )
        }
      />
      <Route
        element={
          <MainLayout authed={authed} profile={profile} isAdmin={isAdmin} />
        }
      >
        <Route
          index
          element={
            authed ? (
              <ObjectList activeTab="brands" isAdmin={isAdmin} />
            ) : (
              <GuestBrandsView />
            )
          }
        />
        <Route
          path="groups"
          element={
            authed ? (
              <ObjectList activeTab="groups" isAdmin={isAdmin} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="brands/:brandId"
          element={
            <BrandObjectsPage isAdmin={isAdmin && authed} authed={authed} />
          }
        />
        <Route
          path="brands/:brandId/objects/:objectId"
          element={
            <BrandObjectDetailPage
              isAdmin={isAdmin && authed}
              authed={authed}
            />
          }
        />
        <Route
          path="groups/:groupId"
          element={
            authed ? <GroupObjectsPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="groups/:groupId/objects/:objectId"
          element={
            authed ? (
              <GroupObjectDetailPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="feedback"
          element={authed ? <FeedbackPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="admin/brands/:brandId"
          element={
            !authed ? (
              <Navigate to="/login" replace />
            ) : !isAdmin ? (
              <Navigate to="/" replace />
            ) : (
              <AdminBrandObjectsPage />
            )
          }
        />
        <Route
          path="admin"
          element={
            !authed ? (
              <Navigate to="/login" replace />
            ) : !isAdmin ? (
              <Navigate to="/" replace />
            ) : (
              <AdminPage />
            )
          }
        />
      </Route>
    </Routes>
  );
}
