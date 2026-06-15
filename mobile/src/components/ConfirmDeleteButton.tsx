import React, { useCallback, useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@minicollections/theme";
import { useLocale } from "../providers/LocaleProvider";
import HeaderActionButton from "./HeaderActionButton";
import HeaderBarButton from "./HeaderBarButton";
import HeaderBarIcon from "./HeaderBarIcon";
import { neuText } from "../theme/neuText";
import { HEADER_BAR_ICON_SIZE } from "../theme/headerBarStyle";

const AUTO_RESET_MS = 4000;

type ConfirmDeleteButtonProps = {
  variant?: "header" | "default";
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  deleteLabel?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
};

export default function ConfirmDeleteButton({
  variant = "default",
  onConfirm,
  confirmLabel,
  deleteLabel,
  icon,
  disabled = false,
  loading: externalLoading = false,
}: ConfirmDeleteButtonProps) {
  const { t } = useLocale();
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pendingText = confirmLabel ?? t("confirmDelete");
  const deleteText = deleteLabel ?? t("delete");
  const actionIcon = icon ?? (
    <HeaderBarIcon>
      <Ionicons name="trash-outline" size={HEADER_BAR_ICON_SIZE} color={colors.dangerLight} />
    </HeaderBarIcon>
  );
  const isBusy = disabled || loading || externalLoading;

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
    resetTimerRef.current = setTimeout(() => {
      setPending(false);
      resetTimerRef.current = null;
    }, AUTO_RESET_MS);
    return () => clearResetTimer();
  }, [clearResetTimer, loading, pending]);

  const handlePress = async () => {
    if (isBusy) return;
    if (!pending) {
      setPending(true);
      return;
    }

    clearResetTimer();
    setLoading(true);
    try {
      await onConfirm();
      setPending(false);
    } finally {
      setLoading(false);
    }
  };

  const pendingContent =
    pending && !loading ? (
      <View style={styles.confirmLabelWrap}>
        {pendingText.split("").map((char, index) => (
          <Text key={`${char}-${index}`} style={styles.confirmLabelChar}>
            {char}
          </Text>
        ))}
      </View>
    ) : null;

  if (variant === "header") {
    return (
      <HeaderActionButton
        danger
        active={pending}
        loading={loading || externalLoading}
        disabled={isBusy && !loading && !externalLoading}
        accessibilityLabel={pending ? pendingText : deleteText}
        onPress={() => void handlePress()}
        icon={pending ? undefined : actionIcon}
      >
        {pendingContent}
      </HeaderActionButton>
    );
  }

  return (
    <HeaderBarButton
      danger
      active={pending}
      loading={loading || externalLoading}
      disabled={isBusy && !loading && !externalLoading}
      accessibilityLabel={pending ? pendingText : deleteText}
      onPress={() => void handlePress()}
    >
      {loading || externalLoading ? null : pending ? (
        pendingContent
      ) : (
        actionIcon
      )}
    </HeaderBarButton>
  );
}

const styles = StyleSheet.create({
  confirmLabelWrap: {
    alignSelf: "stretch",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmLabelChar: {
    ...neuText.caption,
    color: "#fff",
    fontSize: 9,
    letterSpacing: 0.14,
    textTransform: "uppercase",
    lineHeight: 11,
  },
});
