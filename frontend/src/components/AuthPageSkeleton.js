import { Layout } from "antd";
import SiteLogo from "./SiteLogo";

const { Header, Content } = Layout;

function AuthSkeletonLine({ className = "" }) {
  return <span className={["neu-card-skeleton-line", className].filter(Boolean).join(" ")} />;
}

function AuthSkeletonField() {
  return <AuthSkeletonLine className="neu-auth-skeleton-field" />;
}

function AuthSkeletonToggle() {
  return (
    <div className="neu-auth-skeleton-toggle" aria-hidden="true">
      <span className="neu-auth-skeleton-toggle-btn">
        <AuthSkeletonLine className="neu-auth-skeleton-toggle-btn-fill" />
      </span>
      <span className="neu-auth-skeleton-toggle-btn">
        <AuthSkeletonLine className="neu-auth-skeleton-toggle-btn-fill" />
      </span>
    </div>
  );
}

function AuthSkeletonCodeRow() {
  return (
    <div className="neu-auth-skeleton-code-row" aria-hidden="true">
      <AuthSkeletonLine className="neu-auth-skeleton-code-input" />
      <span className="neu-auth-skeleton-code-btn">
        <AuthSkeletonLine className="neu-auth-skeleton-code-btn-fill" />
      </span>
    </div>
  );
}

function AuthSkeletonPrimaryButton() {
  return (
    <span className="neu-auth-skeleton-primary-btn">
      <AuthSkeletonLine className="neu-auth-skeleton-primary-btn-fill" />
    </span>
  );
}

function AuthSkeletonLanguageSection() {
  return (
    <div className="neu-auth-skeleton-language" aria-hidden="true">
      <AuthSkeletonLine className="neu-auth-skeleton-language-label" />
      <div className="neu-auth-skeleton-toggle neu-auth-skeleton-toggle--compact">
        <span className="neu-auth-skeleton-toggle-btn">
          <AuthSkeletonLine className="neu-auth-skeleton-toggle-btn-fill" />
        </span>
        <span className="neu-auth-skeleton-toggle-btn">
          <AuthSkeletonLine className="neu-auth-skeleton-toggle-btn-fill" />
        </span>
      </div>
    </div>
  );
}

function AuthFormShell({ children, panelClassName = "" }) {
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
        <div
          className={[
            "neu-login-panel",
            "neu-auth-page-skeleton",
            panelClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ maxWidth: 420, width: "100%", margin: 0 }}
          aria-busy="true"
        >
          {children}
        </div>
      </Content>
    </Layout>
  );
}

function RegisterAuthSkeleton() {
  return (
    <AuthFormShell panelClassName="neu-auth-page-skeleton--register">
      <AuthSkeletonLine className="neu-auth-skeleton-title" />
      <AuthSkeletonToggle />
      <div className="neu-auth-skeleton-fields">
        <AuthSkeletonField />
        <AuthSkeletonCodeRow />
        <AuthSkeletonField />
        <AuthSkeletonField />
        <AuthSkeletonLanguageSection />
      </div>
      <AuthSkeletonPrimaryButton />
      <AuthSkeletonLine className="neu-auth-skeleton-footer-link" />
    </AuthFormShell>
  );
}

function ForgotPasswordAuthSkeleton() {
  return (
    <AuthFormShell panelClassName="neu-auth-page-skeleton--forgot-password">
      <AuthSkeletonLine className="neu-auth-skeleton-title" />
      <AuthSkeletonLine className="neu-auth-skeleton-hint" />
      <AuthSkeletonToggle />
      <div className="neu-auth-skeleton-fields">
        <AuthSkeletonField />
        <AuthSkeletonCodeRow />
        <AuthSkeletonField />
        <AuthSkeletonField />
      </div>
      <AuthSkeletonPrimaryButton />
      <AuthSkeletonLine className="neu-auth-skeleton-footer-link" />
    </AuthFormShell>
  );
}

function WechatCallbackAuthSkeleton() {
  return (
    <div className="neu-auth-callback-skeleton" aria-busy="true">
      <AuthSkeletonLine className="neu-auth-callback-skeleton-status" />
    </div>
  );
}

export default function AuthPageSkeleton({ variant = "register" }) {
  if (variant === "forgotPassword") {
    return <ForgotPasswordAuthSkeleton />;
  }

  if (variant === "wechatCallback") {
    return <WechatCallbackAuthSkeleton />;
  }

  return <RegisterAuthSkeleton />;
}
