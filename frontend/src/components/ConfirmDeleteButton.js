import { useCallback, useEffect, useRef, useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import NeuButton from "./NeuButton";
import HeaderActionButton from "./HeaderActionButton";
import { useLocale } from "../LocaleContext";

const AUTO_RESET_MS = 4000;

export default function ConfirmDeleteButton({
  variant = "neu",
  size = "small",
  onConfirm,
  className = "",
  confirmLabel,
  deleteLabel,
  disabled = false,
  loading: externalLoading = false,
}) {
  const { t } = useLocale();
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const resetTimerRef = useRef(null);
  const rootRef = useRef(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const resetPending = useCallback(() => {
    clearResetTimer();
    setPending(false);
  }, [clearResetTimer]);

  useEffect(() => clearResetTimer, [clearResetTimer]);

  useEffect(() => {
    if (!pending || loading) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      resetPending();
    };

    const attachTimerId = setTimeout(() => {
      document.addEventListener("mousedown", handlePointerDown, true);
      document.addEventListener("touchstart", handlePointerDown, true);
    }, 0);

    return () => {
      clearTimeout(attachTimerId);
      document.removeEventListener("mousedown", handlePointerDown, true);
      document.removeEventListener("touchstart", handlePointerDown, true);
    };
  }, [pending, loading, resetPending]);

  const scheduleReset = useCallback(() => {
    clearResetTimer();
    resetTimerRef.current = setTimeout(() => {
      setPending(false);
      resetTimerRef.current = null;
    }, AUTO_RESET_MS);
  }, [clearResetTimer]);

  const handleConfirm = async (event) => {
    event.stopPropagation();
    clearResetTimer();
    setLoading(true);
    try {
      await onConfirm?.();
      setPending(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    event.stopPropagation();
    if (disabled || loading || externalLoading) return;

    if (!pending) {
      setPending(true);
      scheduleReset();
      return;
    }

    handleConfirm(event);
  };

  const pendingText = confirmLabel ?? t("confirmDelete");
  const deleteText = deleteLabel ?? t("delete");
  const isBusy = disabled || loading || externalLoading;
  const buttonClassName = [
    "confirm-delete-btn",
    variant === "header" ? "confirm-delete-btn--header" : "confirm-delete-btn--neu",
    variant === "neu" && size === "small" && "confirm-delete-btn--sm",
    pending && "confirm-delete-btn--pending",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (variant === "header") {
    return (
      <HeaderActionButton
        ref={rootRef}
        danger
        active={pending}
        loading={loading}
        disabled={isBusy && !loading}
        onClick={handleClick}
        aria-label={pending ? pendingText : deleteText}
        className={buttonClassName}
        icon={
          pending ? undefined : <DeleteOutlined />
        }
      >
        {pending && !loading ? (
          <span className="confirm-delete-label">{pendingText}</span>
        ) : null}
      </HeaderActionButton>
    );
  }

  return (
    <NeuButton
      ref={rootRef}
      size={size}
      danger
      loading={loading}
      disabled={isBusy && !loading}
      onClick={handleClick}
      aria-label={pending ? pendingText : deleteText}
      className={buttonClassName}
      icon={pending ? undefined : <DeleteOutlined />}
    >
      {pending && !loading ? (
        <span className="confirm-delete-label">{pendingText}</span>
      ) : null}
    </NeuButton>
  );
}
