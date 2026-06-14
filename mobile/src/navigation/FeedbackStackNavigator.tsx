import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FeedbackScreen from "../screens/FeedbackScreen";
import type { FeedbackStackParamList } from "./types";
import { colors } from "@minicollections/theme";

const Stack = createNativeStackNavigator<FeedbackStackParamList>();

export default function FeedbackStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="FeedbackHome" component={FeedbackScreen} />
    </Stack.Navigator>
  );
}
