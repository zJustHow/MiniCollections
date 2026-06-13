import type { NavigatorScreenParams } from "@react-navigation/native";

export type BrandsStackParamList = {
  BrandsList: undefined;
  BrandObjects: {
    brandId: string;
    brandName: string;
  };
  BrandObjectDetail: {
    brandId: string;
    objectId: string;
    objectName?: string;
  };
};

export type GroupsStackParamList = {
  GroupsList: undefined;
  GroupObjects: {
    groupId: string;
    groupName: string;
  };
  GroupObjectDetail: {
    groupId: string;
    objectId: string;
    objectName?: string;
  };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
};

export type StatsStackParamList = {
  StatsHome: undefined;
};

export type MainTabParamList = {
  BrandsTab: NavigatorScreenParams<BrandsStackParamList>;
  GroupsTab: NavigatorScreenParams<GroupsStackParamList>;
  StatsTab: NavigatorScreenParams<StatsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};
