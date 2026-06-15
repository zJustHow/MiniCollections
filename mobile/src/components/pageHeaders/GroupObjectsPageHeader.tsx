import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@minicollections/theme";
import { HEADER_BAR_ICON_SIZE } from "../../theme/headerBarStyle";
import ConfirmDeleteButton from "../ConfirmDeleteButton";
import HeaderActionButton from "../HeaderActionButton";
import HeaderSlotBar from "./HeaderSlotBar";
import HeaderBackButton from "./HeaderBackButton";

type GroupObjectsPageHeaderProps = {
  title: string;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void | Promise<void>;
};

export default function GroupObjectsPageHeader({
  title,
  onBack,
  onEdit,
  onDelete,
}: GroupObjectsPageHeaderProps) {
  return (
    <HeaderSlotBar
      title={title}
      leftActions={<HeaderBackButton onPress={onBack} />}
      rightActions={
        onEdit && onDelete ? (
          <>
            <HeaderActionButton
              accessibilityLabel="edit group"
              onPress={onEdit}
              icon={
                <Ionicons
                  name="create-outline"
                  size={HEADER_BAR_ICON_SIZE}
                  color={colors.accent}
                />
              }
            />
            <ConfirmDeleteButton variant="header" onConfirm={onDelete} />
          </>
        ) : null
      }
    />
  );
}
