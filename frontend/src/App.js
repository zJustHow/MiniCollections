import NeuPressableButton from "./components/NeuPressableButton";
import PageLoader from "./components/PageLoader";
import RouteSkeleton from "./components/RouteSkeleton";
import { Layout, Avatar } from "antd";
import {
  usesCustomHeader,
} from "./utils/routeSkeleton";
import {
  Suspense,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { lazyWithRetry } from "./utils/lazyWithRetry";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import UserOutlined from "@ant-design/icons/es/icons/UserOutlined.js";
import SiteLogo from "./components/SiteLogo";
import AnimatedMenuIcon from "./components/AnimatedMenuIcon";
import { getMe } from "./utils/usersApi";
import { logout } from "./utils/authApi";
import { scrollAppToTop } from "./utils/scroll";
import { useLocale } from "./LocaleContext";
import { HeaderProvider, useHeader } from "./HeaderContext";
import { useMainNavWouldCollapse } from "./hooks/useHeaderNavCollapse";
import { prefetchProfilePage } from "./utils/prefetchRoutes";

const ObjectList = lazyWithRetry(() => import("./components/ObjectList"));
const GuestBrandsView = lazyWithRetry(
  () => import("./components/GuestBrandsView"),
);
const LoginPage = lazyWithRetry(() => import("./pages/LoginPage"));
const BrandObjectsPage = lazyWithRetry(
  () => import("./pages/BrandObjectsPage"),
);
const BrandObjectDetailPage = lazyWithRetry(
  () => import("./pages/BrandObjectDetailPage"),
);
const GroupObjectsPage = lazyWithRetry(
  () => import("./pages/GroupObjectsPage"),
);
const GroupObjectDetailPage = lazyWithRetry(
  () => import("./pages/GroupObjectDetailPage"),
);
const ProfilePage = lazyWithRetry(() => import("./pages/ProfilePage"));
const RegisterPage = lazyWithRetry(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazyWithRetry(
  () => import("./pages/ForgotPasswordPage"),
);
const AdminLayout = lazyWithRetry(() => import("./pages/admin/AdminLayout"));
const AdminPage = lazyWithRetry(() => import("./pages/AdminPage"));
const AdminBrandObjectsPage = lazyWithRetry(
  () => import("./pages/admin/AdminBrandObjectsPage"),
);
const AdminBrandsPage = lazyWithRetry(
  () => import("./pages/admin/AdminBrandsPage"),
);
const AdminCategoriesPage = lazyWithRetry(
  () => import("./pages/admin/AdminCategoriesPage"),
);
const AdminScalesPage = lazyWithRetry(
  () => import("./pages/admin/AdminScalesPage"),
);
const FeedbackPage = lazyWithRetry(() => import("./pages/FeedbackPage"));
const CollectionStatsPage = lazyWithRetry(
  () => import("./pages/CollectionStatsPage"),
);
const WechatCallbackPage = lazyWithRetry(
  () => import("./pages/WechatCallbackPage"),
);

const { Header, Content } = Layout;

function LazyPageFallback() {
  const location = useLocation();
  return <RouteSkeleton pathname={location.pathname} />;
}

function MainLayoutInner({
  authed,
  profile,
  isAdmin,
  authLoading = false,
  onLogout,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocale();
  const { headerSlot } = useHeader();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const headerRef = useRef(null);
  const tabsRef = useRef(null);
  const profileRef = useRef(null);

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

  const customHeaderRoute = usesCustomHeader(location.pathname);
  const headerLoading = authLoading || (customHeaderRoute && !headerSlot);
  const showSiteLogo = !headerSlot && !headerLoading;
  const showDefaultHeaderNav =
    !customHeaderRoute && !headerSlot && !headerLoading;

  const hideProfileButton = customHeaderRoute;

  const mainNavWouldCollapse = useMainNavWouldCollapse({
    enabled: !headerLoading,
    headerRef,
    profileRef: hideProfileButton ? null : profileRef,
    tabCount: isAdmin ? 5 : 4,
  });

  const headerNavCollapsed = mainNavWouldCollapse && showDefaultHeaderNav;

  useEffect(() => {
    if (!headerNavCollapsed) setMenuOpen(false);
  }, [headerNavCollapsed]);

  const activeTab =
    location.pathname === "/groups"
      ? "groups"
      : location.pathname === "/stats"
        ? "stats"
        : location.pathname === "/feedback"
          ? "feedback"
          : location.pathname.startsWith("/admin")
            ? "admin"
            : "brands";

  const goToLogin = () => navigate("/login");

  const handleProfileNavigate = () => {
    setMenuOpen(false);
    scrollAppToTop();
  };

  const renderProfileBtn = (to) => (
    <Link
      to={to}
      prefetch="intent"
      className="neu-card neu-card--avatar"
      aria-label={authed ? profile?.display_name || t("profile") : t("signIn")}
      title={authed ? profile?.display_name || t("profile") : t("signIn")}
      onClick={handleProfileNavigate}
      onMouseEnter={authed ? prefetchProfilePage : undefined}
      onFocus={authed ? prefetchProfilePage : undefined}
    >
      {authed ? (
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
      ) : (
        <Avatar
          icon={<UserOutlined />}
          size={36}
          style={{
            background: "var(--neu-bg)",
            color: "var(--neu-text-2)",
          }}
        />
      )}
    </Link>
  );

  const handleTabChange = (tab) => {
    if (
      !authed &&
      (tab === "groups" || tab === "stats" || tab === "feedback")
    ) {
      goToLogin();
      return;
    }
    if (tab === "brands") navigate("/");
    else if (tab === "groups") navigate("/groups");
    else if (tab === "stats") navigate("/stats");
    else if (tab === "feedback") navigate("/feedback");
    scrollAppToTop();
  };

  return (
    <Layout
      className={
        [
          headerNavCollapsed && "header-nav-collapsed",
          mainNavWouldCollapse && "content-toolbar-compact",
        ]
          .filter(Boolean)
          .join(" ") || undefined
      }
      style={{ height: "100vh", overflow: "hidden" }}
    >
      <Header
        ref={headerRef}
        aria-busy={headerLoading || undefined}
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: 32,
          paddingRight: 32,
          gap: 24,
        }}
      >
        {/* Logo — hidden while header is loading or a page injects its own slot */}
        {showSiteLogo && <SiteLogo />}

        {/* Center slot: custom page header or default nav tabs */}
        {!headerLoading &&
          (headerSlot ? (
            <div className="header-slot-wrap">{headerSlot}</div>
          ) : !customHeaderRoute ? (
          <div className="header-tabs" ref={tabsRef}>
            <NeuPressableButton
              variant="header-bar"
              active={activeTab === "brands"}
              onClick={() => handleTabChange("brands")}
            >
              {t("brands")}
            </NeuPressableButton>
            <NeuPressableButton
              variant="header-bar"
              active={activeTab === "groups"}
              onClick={() => handleTabChange("groups")}
            >
              {t("groups")}
            </NeuPressableButton>
            <NeuPressableButton
              variant="header-bar"
              active={activeTab === "stats"}
              onClick={() => handleTabChange("stats")}
            >
              {t("stats")}
            </NeuPressableButton>
            <NeuPressableButton
              variant="header-bar"
              active={activeTab === "feedback"}
              onClick={() => handleTabChange("feedback")}
            >
              {t("feedback")}
            </NeuPressableButton>
            {isAdmin && (
              <NeuPressableButton
                variant="header-bar"
                active={activeTab === "admin"}
                onClick={() => navigate("/admin")}
              >
                {t("adminPanel")}
              </NeuPressableButton>
            )}
          </div>
          ) : null)}

        {!hideProfileButton && !headerLoading && (
          <div
            ref={profileRef}
            className="header-right"
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {authed ? renderProfileBtn("/profile") : renderProfileBtn("/login")}
          </div>
        )}

        {/* Mobile hamburger button — only visible on small screens */}
        {showDefaultHeaderNav && (
          <NeuPressableButton
            variant="header-bar"
            className="mobile-menu-btn"
            active={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "close menu" : "menu"}
            aria-expanded={menuOpen}
          >
            <AnimatedMenuIcon open={menuOpen} />
          </NeuPressableButton>
        )}
      </Header>

      {/* Mobile dropdown menu */}
      {menuOpen && showDefaultHeaderNav && headerNavCollapsed && (
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
            className={`mobile-menu-item${activeTab === "stats" ? " active" : ""}`}
            onClick={() => handleTabChange("stats")}
          >
            {t("stats")}
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
          {!hideProfileButton && (
            <>
              <div className="mobile-menu-divider" />
              <div className="mobile-menu-profile">
                {renderProfileBtn(authed ? "/profile" : "/login")}
              </div>
            </>
          )}
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
        {authLoading ? (
          <RouteSkeleton pathname={location.pathname} />
        ) : (
          <Outlet />
        )}
      </Content>
    </Layout>
  );
}

function MainLayout({
  authed,
  profile,
  isAdmin,
  authLoading = false,
  onLogout,
}) {
  return (
    <HeaderProvider>
      <MainLayoutInner
        authed={authed}
        profile={profile}
        isAdmin={isAdmin}
        authLoading={authLoading}
        onLogout={onLogout}
      />
    </HeaderProvider>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
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
        prefetchProfilePage();
      })
      .catch(() => {
        localStorage.removeItem("auth_token");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (authed) {
      prefetchProfilePage();
    }
  }, [authed]);

  const handleProfileChange = (updated) => {
    setProfile(updated);
    if (updated.preferred_locale) setLocale(updated.preferred_locale);
  };

  const handleLogout = useCallback(() => {
    logout();
    setAuthed(false);
    setProfile(null);
    navigate("/");
  }, [navigate]);

  const handleLoginSuccess = async () => {
    try {
      const me = await getMe();
      setProfile(me);
      if (me.preferred_locale) setLocale(me.preferred_locale);
      setAuthed(true);
      prefetchProfilePage();
      navigate("/");
    } catch {
      localStorage.removeItem("auth_token");
    }
  };

  const handleWechatBind = (updatedProfile) => {
    handleProfileChange(updatedProfile);
    // navigation to /profile is handled inside WechatCallbackPage
  };

  const objectListElement = (
    <Suspense fallback={<LazyPageFallback />}>
      <ObjectList isAdmin={isAdmin} />
    </Suspense>
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authed ? (
            <Navigate to="/" replace />
          ) : (
            <Suspense fallback={<PageLoader variant="splash" />}>
              <LoginPage onSuccess={handleLoginSuccess} />
            </Suspense>
          )
        }
      />
      <Route
        path="/register"
        element={
          authed ? (
            <Navigate to="/" replace />
          ) : (
            <Suspense fallback={<PageLoader variant="register" />}>
              <RegisterPage />
            </Suspense>
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          authed ? (
            <Navigate to="/" replace />
          ) : (
            <Suspense fallback={<PageLoader variant="forgotPassword" />}>
              <ForgotPasswordPage />
            </Suspense>
          )
        }
      />
      <Route
        path="/wechat-callback"
        element={
          authed && localStorage.getItem("wechat_intent") !== "bind" ? (
            <Navigate to="/" replace />
          ) : (
            <Suspense fallback={<PageLoader variant="wechatCallback" />}>
              <WechatCallbackPage
                onSuccess={handleLoginSuccess}
                onBind={handleWechatBind}
              />
            </Suspense>
          )
        }
      />
      <Route
        element={
          <MainLayout
            authed={authed}
            profile={profile}
            isAdmin={isAdmin}
            authLoading={loading}
            onLogout={handleLogout}
          />
        }
      >
        <Route
          path="profile"
          element={
            !authed ? (
              <Navigate to="/login" replace />
            ) : (
              <Suspense fallback={<PageLoader variant="profile" />}>
                <ProfilePage
                  profile={profile}
                  onProfileChange={handleProfileChange}
                  onLogout={handleLogout}
                />
              </Suspense>
            )
          }
        />
        <Route
          index
          element={
            authed ? (
              objectListElement
            ) : (
              <Suspense fallback={<PageLoader variant="brands" />}>
                <GuestBrandsView />
              </Suspense>
            )
          }
        />
        <Route
          path="groups"
          element={
            authed ? (
              objectListElement
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="brands/:brandId"
          element={
            <Suspense fallback={<PageLoader variant="brandObjects" />}>
              <BrandObjectsPage isAdmin={isAdmin && authed} authed={authed} />
            </Suspense>
          }
        />
        <Route
          path="brands/:brandId/objects/:objectId"
          element={
            <Suspense fallback={<PageLoader variant="brandObjectDetail" />}>
              <BrandObjectDetailPage
                isAdmin={isAdmin && authed}
                authed={authed}
              />
            </Suspense>
          }
        />
        <Route
          path="groups/:groupId"
          element={
            authed ? (
              <Suspense fallback={<PageLoader variant="groupObjects" />}>
                <GroupObjectsPage />
              </Suspense>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="groups/:groupId/objects/:objectId"
          element={
            authed ? (
              <Suspense fallback={<PageLoader variant="groupObjectDetail" />}>
                <GroupObjectDetailPage />
              </Suspense>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="stats"
          element={
            authed ? (
              <Suspense fallback={<PageLoader variant="stats" />}>
                <CollectionStatsPage />
              </Suspense>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="feedback"
          element={
            authed ? (
              <Suspense fallback={<PageLoader variant="feedback" />}>
                <FeedbackPage />
              </Suspense>
            ) : (
              <Navigate to="/login" replace />
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
              <Suspense fallback={<PageLoader variant="admin" />}>
                <AdminLayout />
              </Suspense>
            )
          }
        >
          <Route index element={<AdminPage />} />
          <Route path="brands" element={<AdminBrandsPage />} />
          <Route path="brands/:brandId" element={<AdminBrandObjectsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="scales" element={<AdminScalesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
