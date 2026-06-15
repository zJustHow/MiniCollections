import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BrandsStackNavigator from "./BrandsStackNavigator";
import GroupsStackNavigator from "./GroupsStackNavigator";
import StatsStackNavigator from "./StatsStackNavigator";
import FeedbackStackNavigator from "./FeedbackStackNavigator";
import ProfileStackNavigator from "./ProfileStackNavigator";
import type { MainTabParamList, RootStackParamList } from "./types";
import { colors } from "@minicollections/theme";
import { HeaderProvider } from "../providers/HeaderProvider";
import AppTopBar from "../components/AppTopBar";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const Tab = createBottomTabNavigator<MainTabParamList>();

export type MainTabNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function MainTabNavigator() {
  return (
    <HeaderProvider>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          header: () => <AppTopBar />,
          headerStatusBarHeight: 0,
          headerShadowVisible: false,
          tabBarStyle: { display: "none" },
          sceneStyle: { backgroundColor: colors.bg },
        }}
      >
        <Tab.Screen name="BrandsTab" component={BrandsStackNavigator} />
        <Tab.Screen name="GroupsTab" component={GroupsStackNavigator} />
        <Tab.Screen name="StatsTab" component={StatsStackNavigator} />
        <Tab.Screen name="FeedbackTab" component={FeedbackStackNavigator} />
        <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} />
      </Tab.Navigator>
    </HeaderProvider>
  );
}
