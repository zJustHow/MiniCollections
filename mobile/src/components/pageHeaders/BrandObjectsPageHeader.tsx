import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@minicollections/theme";
import { HEADER_BAR_ICON_SIZE } from "../../theme/headerBarStyle";
import ConfirmDeleteButton from "../ConfirmDeleteButton";
import HeaderActionButton from "../HeaderActionButton";
import HeaderSlotBar from "./HeaderSlotBar";
import HeaderBackButton from "./HeaderBackButton";

type BrandObjectsPageHeaderProps = {
  title: string;
  onBack: () => void;
  isAdmin?: boolean;
  onEditBrand?: () => void;
  onDeleteBrand?: () => void | Promise<void>;
};

export default function BrandObjectsPageHeader({
  title,
  onBack,
  isAdmin = false,
  onEditBrand,
  onDeleteBrand,
}: BrandObjectsPageHeaderProps) {
  return (
    <HeaderSlotBar
      title={title}
      leftActions={<HeaderBackButton onPress={onBack} />}
      rightActions={
        isAdmin && onEditBrand && onDeleteBrand ? (
          <>
            <HeaderActionButton
              accessibilityLabel="edit brand"
              onPress={onEditBrand}
              icon={
                <Ionicons
                  name="create-outline"
                  size={HEADER_BAR_ICON_SIZE}
                  color={colors.accent}
                />
              }
            />
            <ConfirmDeleteButton variant="header" onConfirm={onDeleteBrand} />
          </>
        ) : null
      }
    />
  );
}
