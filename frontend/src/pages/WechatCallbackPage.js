import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { bindWechatAccount, exchangeWechatCode } from "../utils";
import { useLocale } from "../LocaleContext";
import { radius } from "../theme/radius";

const BIND_INTENT_KEY = "wechat_intent";

export default function WechatCallbackPage({ onSuccess, onBind }) {
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLocale();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const isBind = localStorage.getItem(BIND_INTENT_KEY) === "bind";

    if (!code || !state) {
      setError(isBind ? t("wechatBindFailed") : t("wechatLoginFailed"));
      return;
    }

    if (isBind) {
      bindWechatAccount({ code, state })
        .then((profile) => {
          localStorage.removeItem(BIND_INTENT_KEY);
          onBind(profile);
          navigate("/profile", { replace: true });
        })
        .catch((err) => {
          localStorage.removeItem(BIND_INTENT_KEY);
          setError(err?.message || t("wechatBindFailed"));
        });
    } else {
      exchangeWechatCode({ code, state })
        .then(() => onSuccess())
        .catch((err) => setError(err?.message || t("wechatLoginFailed")));
    }
  }, []);

  const isBind = localStorage.getItem(BIND_INTENT_KEY) === "bind";

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 16,
          background: "var(--neu-bg)",
        }}
      >
        <div
          style={{
            color: "#e05d5d",
            background: "rgba(224, 93, 93, 0.08)",
            borderRadius: radius.md,
            padding: "12px 20px",
            fontSize: 14,
            boxShadow:
              "inset 2px 2px 6px rgba(163, 177, 198, 0.4), inset -2px -2px 5px rgba(255,255,255,0.6)",
          }}
        >
          {error}
        </div>
        <span
          onClick={() => navigate(isBind ? "/profile" : "/login")}
          style={{ cursor: "pointer", color: "var(--neu-accent)", fontSize: 13 }}
        >
          {isBind ? t("profileTitle") : t("signIn")}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--neu-bg)",
        color: "var(--neu-text-2)",
        fontSize: 14,
      }}
    >
      {isBind ? t("wechatBindingInProgress") : t("wechatLoggingIn")}
    </div>
  );
}
