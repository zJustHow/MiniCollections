import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, neuBoxShadow, spacing } from "@minicollections/theme";
import DrawerHeaderTitle from "./DrawerHeaderTitle";

/** Matches web `NEU_FORM_DRAWER_WIDTH`. */
export const NEU_FORM_DRAWER_WIDTH = 480;

type NeuFormDrawerProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function NeuFormDrawer({
  visible,
  title,
  onClose,
  children,
}: NeuFormDrawerProps) {
  const { width: screenWidth } = useWindowDimensions();
  const drawerWidth = Math.min(NEU_FORM_DRAWER_WIDTH, screenWidth);
  const translateX = useRef(new Animated.Value(drawerWidth)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : drawerWidth,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [drawerWidth, translateX, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close drawer"
          style={styles.dismiss}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.panel,
            {
              width: drawerWidth,
              transform: [{ translateX }],
            },
          ]}
        >
          <SafeAreaView style={styles.safe} edges={["top", "right", "bottom"]}>
            <DrawerHeaderTitle title={title} onClose={onClose} />
            <View style={styles.body}>{children}</View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  dismiss: {
    flex: 1,
  },
  panel: {
    height: "100%",
    backgroundColor: colors.bg,
    boxShadow: neuBoxShadow.raisedLg,
  },
  safe: {
    flex: 1,
  },
  body: {
    flex: 1,
    minHeight: 0,
    padding: spacing.lg,
  },
});
