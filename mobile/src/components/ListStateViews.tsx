import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@minicollections/theme";
import NeuButton from "./NeuButton";
import { InfiniteScrollSkeletonCards, FeedbackListSkeleton } from "./skeleton";
import type { SkeletonVariant } from "../utils/skeletonUtils";

type ListStateProps = {
  loading?: boolean;
  /** Keep children mounted and render skeleton placeholders inline (web-aligned). */
  inlineSkeleton?: boolean;
  errorMessage?: string | null;
  retryLabel: string;
  onRetry?: () => void;
  children: React.ReactNode;
};

export function ListLoadingState() {
  return (
    <SafeAreaView style={styles.centered}>
      <ActivityIndicator size="large" color={colors.accent} />
    </SafeAreaView>
  );
}

export function ListErrorState({
  message,
  retryLabel,
  onRetry,
}: {
  message: string;
  retryLabel: string;
  onRetry?: () => void;
}) {
  return (
    <SafeAreaView style={styles.centered}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? <NeuButton title={retryLabel} onPress={onRetry} /> : null}
    </SafeAreaView>
  );
}

export function ListStateBoundary({
  loading,
  inlineSkeleton = false,
  errorMessage,
  retryLabel,
  onRetry,
  children,
}: ListStateProps) {
  if (loading && !inlineSkeleton) return <ListLoadingState />;
  if (errorMessage) {
    return (
      <ListErrorState
        message={errorMessage}
        retryLabel={retryLabel}
        onRetry={onRetry}
      />
    );
  }
  return <>{children}</>;
}

export function listRefreshControl(
  refreshing: boolean,
  onRefresh: () => void,
) {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.accent}
    />
  );
}

export function ListFooterSpinner({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <ActivityIndicator style={styles.footer} color={colors.accent} />
  );
}

export function ListFooterSkeleton({
  visible,
  variant = "catalog",
  numColumns = 2,
}: {
  visible: boolean;
  variant?: SkeletonVariant | "brand" | "feedback";
  numColumns?: number;
}) {
  if (!visible) return null;
  if (variant === "feedback") {
    return <FeedbackListSkeleton count={2} />;
  }
  return (
    <InfiniteScrollSkeletonCards variant={variant} numColumns={numColumns} />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  errorText: {
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
