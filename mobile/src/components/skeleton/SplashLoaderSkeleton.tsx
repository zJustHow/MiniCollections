import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@minicollections/theme";
import { neuText } from "../../theme/neuText";

export default function SplashLoaderSkeleton() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 320],
  });

  return (
    <View style={styles.root} accessibilityElementsHidden>
      <View style={styles.brand}>
        <Text style={styles.logo}>MiniCollections</Text>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[styles.progressBar, { transform: [{ translateX }] }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors.bg,
  },
  brand: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    ...neuText.headerLogo,
    letterSpacing: 2,
  },
  progressTrack: {
    width: "72%",
    maxWidth: 240,
    height: 4,
    overflow: "hidden",
    backgroundColor: colors.bg,
    boxShadow: "inset 2px 2px 4px #b8b9be, inset -2px -2px 4px #ffffff",
  },
  progressBar: {
    width: "42%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },
});
