import React from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import SkeletonShimmer from "./SkeletonShimmer";

type SkeletonLineProps = {
  style?: StyleProp<ViewStyle>;
};

export default function SkeletonLine({ style }: SkeletonLineProps) {
  return <SkeletonShimmer style={[styles.line, style]} />;
}

const styles = StyleSheet.create({
  line: {
    borderRadius: 0,
  },
});
