import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen";
import AdminSubmissionsScreen from "../screens/AdminSubmissionsScreen";
import type { ProfileStackParamList } from "./types";
import { colors } from "@minicollections/theme";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="AdminSubmissions" component={AdminSubmissionsScreen} />
    </Stack.Navigator>
  );
}
