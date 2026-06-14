import React, { useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useLocale } from "../providers/LocaleProvider";

function ProfileLocaleSync() {
  const { profile } = useAuth();
  const { setLocale } = useLocale();

  useEffect(() => {
    const preferred = profile?.preferred_locale;
    if (preferred === "en-US" || preferred === "zh-CN") {
      setLocale(preferred);
    }
  }, [profile?.preferred_locale, setLocale]);

  return null;
}

export default ProfileLocaleSync;
