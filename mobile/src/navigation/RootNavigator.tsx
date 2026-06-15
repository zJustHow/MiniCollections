import React from "react";
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../providers/AuthProvider";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import MainTabNavigator from "./MainTabNavigator";
import type { RootStackParamList } from "./types";
import { linking } from "./linking";
import { colors } from "@minicollections/theme";
import { SplashLoaderSkeleton } from "../components/skeleton";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.boot}>
        <SplashLoaderSkeleton />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ presentation: "modal" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
});
