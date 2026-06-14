import type { LinkingOptions } from "@react-navigation/native";
import type { RootStackParamList } from "./types";
import { linkPrefixes } from "../utils/appLinks";

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: linkPrefixes(),
  config: {
    screens: {
      MainTabs: {
        screens: {
          BrandsTab: {
            screens: {
              BrandObjectDetail: "brands/:brandId/objects/:objectId",
              BrandObjects: "brands/:brandId",
            },
          },
          GroupsTab: {
            screens: {
              GroupObjects: "groups/:groupId",
              GroupObjectDetail: "groups/:groupId/objects/:objectId",
            },
          },
        },
      },
      Login: "login",
      Register: "register",
      ForgotPassword: "forgot-password",
    },
  },
};
