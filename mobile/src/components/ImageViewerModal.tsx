import React, { useCallback, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocale } from "../providers/LocaleProvider";
import { spacing } from "@minicollections/theme";

type ImageViewerModalProps = {
  visible: boolean;
  imageUri: string | null | undefined;
  onClose: () => void;
};

export default function ImageViewerModal({
  visible,
  imageUri,
  onClose,
}: ImageViewerModalProps) {
  const { t } = useLocale();
  const [zoomed, setZoomed] = useState(false);
  const lastTapAt = useRef(0);

  const resetZoom = useCallback(() => {
    setZoomed(false);
  }, []);

  const handleClose = useCallback(() => {
    resetZoom();
    onClose();
  }, [onClose, resetZoom]);

  const handleImagePress = useCallback(() => {
    const now = Date.now();
    if (now - lastTapAt.current < 280) {
      setZoomed((current) => !current);
    }
    lastTapAt.current = now;
  }, []);

  if (!imageUri) return null;

  const imageNode = (
    <Pressable accessibilityRole="button" onPress={handleImagePress}>
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, zoomed && styles.imageZoomed]}
        contentFit="contain"
        transition={200}
      />
    </Pressable>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <SafeAreaView style={styles.safe}>
        <Pressable accessibilityRole="button" style={styles.closeBtn} onPress={handleClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
        {Platform.OS === "ios" ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            maximumZoomScale={4}
            minimumZoomScale={1}
            centerContent
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.imageIos}
              contentFit="contain"
              transition={200}
            />
          </ScrollView>
        ) : (
          <View style={styles.androidWrap}>{imageNode}</View>
        )}
        <Text style={styles.hint}>
          {Platform.OS === "ios" ? t("imageViewerHelpIos") : t("imageViewerHelp")}
        </Text>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
  },
  closeBtn: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    zIndex: 2,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  imageIos: {
    width: "100%",
    height: "100%",
    minHeight: 320,
  },
  androidWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  image: {
    width: "100%",
    height: "100%",
    minHeight: 280,
  },
  imageZoomed: {
    transform: [{ scale: 2 }],
  },
  hint: {
    textAlign: "center",
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
