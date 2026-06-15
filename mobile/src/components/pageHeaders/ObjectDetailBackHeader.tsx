import React from "react";
import HeaderSlotBar from "./HeaderSlotBar";
import HeaderBackButton from "./HeaderBackButton";

type ObjectDetailBackHeaderProps = {
  title: string;
  onBack: () => void;
  rightActions?: React.ReactNode;
};

export default function ObjectDetailBackHeader({
  title,
  onBack,
  rightActions,
}: ObjectDetailBackHeaderProps) {
  return (
    <HeaderSlotBar
      title={title}
      leftActions={<HeaderBackButton onPress={onBack} />}
      rightActions={rightActions}
    />
  );
}
