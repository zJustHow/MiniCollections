import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@minicollections/theme";
import { HEADER_BAR_ICON_SIZE } from "../../theme/headerBarStyle";
import ConfirmDeleteButton from "../ConfirmDeleteButton";
import HeaderActionButton from "../HeaderActionButton";
import HeaderSlotBar from "./HeaderSlotBar";
import HeaderBackButton from "./HeaderBackButton";

type ProfileRouteHeaderProps = {
  title: string;
  onBack: () => void;
  onLogout: () => void | Promise<void>;
  logoutLabel: string;
  confirmLogoutLabel: string;
};

export default function ProfileRouteHeader({
  title,
  onBack,
  onLogout,
  logoutLabel,
  confirmLogoutLabel,
}: ProfileRouteHeaderProps) {
  return (
    <HeaderSlotBar
      title={title}
      leftActions={<HeaderBackButton onPress={onBack} />}
      rightActions={
        <ConfirmDeleteButton
          variant="header"
          onConfirm={onLogout}
          confirmLabel={confirmLogoutLabel}
          deleteLabel={logoutLabel}
          icon={
            <Ionicons
              name="log-out-outline"
              size={HEADER_BAR_ICON_SIZE}
              color={colors.dangerLight}
            />
          }
        />
      }
    />
  );
}
