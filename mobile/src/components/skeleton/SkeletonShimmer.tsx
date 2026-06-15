import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors } from "@minicollections/theme";

type SkeletonShimmerProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export default function SkeletonShimmer({ style, children }: SkeletonShimmerProps) {
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
    outputRange: [-180, 180],
  });

  return (
    <View style={[styles.base, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View
        pointerEvents="none"
        style={[styles.highlight, { transform: [{ translateX }] }]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    backgroundColor: "rgba(209, 217, 230, 0.35)",
  },
  highlight: {
    ...StyleSheet.absoluteFill,
    width: "60%",
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    opacity: 0.85,
  },
});
