import { Platform, Share } from "react-native";

export async function shareModelLink(title: string, link: string) {
  const message = `${title}\n${link}`;
  await Share.share(
    Platform.OS === "ios" ? { message, url: link, title } : { message, title },
  );
}
