import React from "react";
import { PressableProps, StyleSheet } from "react-native";
import HeaderBarButton from "./HeaderBarButton";
import HeaderBarIcon from "./HeaderBarIcon";
import { HEADER_BAR_ACTION_MIN_WIDTH, HEADER_BAR_BUTTON_PADDING_X } from "../theme/headerBarStyle";

type HeaderActionButtonProps = Omit<PressableProps, "style"> & {
  icon?: React.ReactNode;
  danger?: boolean;
  loading?: boolean;
  active?: boolean;
  children?: React.ReactNode;
};

export default function HeaderActionButton({
  icon,
  danger = false,
  loading = false,
  active = false,
  children,
  ...rest
}: HeaderActionButtonProps) {
  const body = children ?? (icon ? <HeaderBarIcon>{icon}</HeaderBarIcon> : null);

  return (
    <HeaderBarButton
      danger={danger}
      loading={loading}
      active={active}
      style={styles.action}
      {...rest}
    >
      {body}
    </HeaderBarButton>
  );
}

const styles = StyleSheet.create({
  action: {
    minWidth: HEADER_BAR_ACTION_MIN_WIDTH,
    paddingHorizontal: HEADER_BAR_BUTTON_PADDING_X,
  },
});
