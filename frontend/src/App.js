import NeuPressableButton from "./components/NeuPressableButton";
import PageLoader from "./components/PageLoader";
import RouteSkeleton from "./components/RouteSkeleton";
import HeaderSlotSkeleton from "./components/HeaderSlotSkeleton";
import { Layout, Avatar } from "antd";
import {
  resolveHeaderSkeletonEndActions,
  usesCustomHeader,
  usesMainLayout,
} from "./utils/routeSkeleton";
import {
  Suspense,
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
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
import MenuOutlined from "@ant-design/icons/es/icons/MenuOutlined.js";
import CloseOutlined from "@ant-design/icons/es/icons/CloseOutlined.js";
import SiteLogo from "./components/SiteLogo";
import { getMe } from "./utils/usersApi";
import { logout } from "./utils/authApi";
import { scrollAppToTop } from "./utils/scroll";
import { useLocale } from "./LocaleContext";
import { HeaderProvider, useHeader } from "./HeaderContext";
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
  const { headerSlot, setHeaderSlot } = useHeader();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    setHeaderSlot(null);
  }, [location.pathname, location.key, setHeaderSlot]);

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
  const headerSkeletonEndActions = resolveHeaderSkeletonEndActions(
    location.pathname,
    { isAdmin },
  );
  const showDefaultHeaderNav = !customHeaderRoute && !headerSlot;

  const hideProfileButton = customHeaderRoute;

  const activeTab =
    location.pathname === "/groups"
      ? "groups"
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
        {showDefaultHeaderNav && <SiteLogo />}

        {/* Center slot: custom page header, skeleton, or default nav tabs */}
        {headerSlot ? (
          <div className="header-slot-wrap">{headerSlot}</div>
        ) : customHeaderRoute ? (
          <div className="header-slot-wrap">
            <HeaderSlotSkeleton endActions={headerSkeletonEndActions} />
          </div>
        ) : (
          <div className="header-tabs">
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
        )}

        {!hideProfileButton && (
          <div
            className="header-right"
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {authed ? (
              renderProfileBtn("/profile")
            ) : (
              renderProfileBtn("/login")
            )}
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
            {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </NeuPressableButton>
        )}
      </Header>

      {/* Mobile dropdown menu */}
      {menuOpen && showDefaultHeaderNav && (
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
          <Suspense fallback={<RouteSkeleton pathname={location.pathname} />}>
            <Outlet />
          </Suspense>
        )}
      </Content>
    </Layout>
  );
}

function MainLayout({ authed, profile, isAdmin, authLoading = false, onLogout }) {
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

  if (loading) {
    if (usesMainLayout(location.pathname)) {
      return (
        <MainLayout
          authed={false}
          profile={null}
          isAdmin={false}
          authLoading
          onLogout={handleLogout}
        />
      );
    }

    return <RouteSkeleton pathname={location.pathname} />;
  }

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
          element={
            authed ? (
              <Suspense fallback={<LazyPageFallback />}>
                <ObjectList isAdmin={isAdmin} />
              </Suspense>
            ) : (
              <Outlet />
            )
          }
        >
          <Route
            index
            element={
              authed ? null : (
                <Suspense fallback={<PageLoader variant="brands" />}>
                  <GuestBrandsView />
                </Suspense>
              )
            }
          />
          <Route
            path="groups"
            element={authed ? null : <Navigate to="/login" replace />}
          />
        </Route>
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
