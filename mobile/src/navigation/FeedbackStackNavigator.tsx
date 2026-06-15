import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FeedbackScreen from "../screens/FeedbackScreen";
import type { FeedbackStackParamList } from "./types";
import { useTabStackScreenOptions } from "./useTabStackScreenOptions";

const Stack = createNativeStackNavigator<FeedbackStackParamList>();

export default function FeedbackStackNavigator() {
  const screenOptions = useTabStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="FeedbackHome" component={FeedbackScreen} />
    </Stack.Navigator>
  );
}
