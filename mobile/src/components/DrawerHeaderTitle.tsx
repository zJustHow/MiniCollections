import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { colors } from "@minicollections/theme";
import HeaderActionButton from "./HeaderActionButton";
import HeaderSlotBar from "./pageHeaders/HeaderSlotBar";
import { HEADER_BAR_ICON_SIZE } from "../theme/headerBarStyle";

type DrawerHeaderTitleProps = {
  title: string;
  onClose: () => void;
};

export default function DrawerHeaderTitle({ title, onClose }: DrawerHeaderTitleProps) {
  return (
    <View style={styles.toolbar}>
      <HeaderSlotBar
        title={title}
        leftActions={
          <HeaderActionButton
            accessibilityLabel="Close"
            onPress={onClose}
            icon={
              <Ionicons
                name="close"
                size={HEADER_BAR_ICON_SIZE}
                color={colors.accent}
              />
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingLeft: 6,
  },
});
