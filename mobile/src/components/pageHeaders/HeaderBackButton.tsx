import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@minicollections/theme";
import { HEADER_BAR_ICON_SIZE } from "../../theme/headerBarStyle";
import HeaderActionButton from "../HeaderActionButton";

type HeaderBackButtonProps = {
  onPress: () => void;
};

export default function HeaderBackButton({ onPress }: HeaderBackButtonProps) {
  return (
    <HeaderActionButton
      accessibilityLabel="back"
      onPress={onPress}
      icon={
        <Ionicons
          name="arrow-back"
          size={HEADER_BAR_ICON_SIZE}
          color={colors.accent}
        />
      }
    />
  );
}
