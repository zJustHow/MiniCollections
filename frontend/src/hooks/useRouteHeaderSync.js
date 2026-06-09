import { useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useHeader } from "../HeaderContext";
import { useLocale } from "../LocaleContext";
import { usesCustomHeader } from "../utils/routeSkeleton";
import { resolveRouteHeader } from "../utils/routeHeader";

export default function useRouteHeaderSync({ isAdmin, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLocale();
  const { setHeaderSlot } = useHeader();

  useLayoutEffect(() => {
    if (!usesCustomHeader(location.pathname)) {
      setHeaderSlot(null);
      return;
    }

    setHeaderSlot(
      resolveRouteHeader({
        location,
        navigate,
        t,
        isAdmin,
        onLogout,
      }),
    );
  }, [
    location.pathname,
    location.key,
    isAdmin,
    onLogout,
    navigate,
    t,
    setHeaderSlot,
  ]);
}
