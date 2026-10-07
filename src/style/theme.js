import { Platform, StatusBar } from "react-native";

export const colors = {
  bg: "#ffffff",
  card: "#f26725",
  border: "#86112e",
  title: "#0e1a1d",
  text: "#ffffff",
  dim: "#8B949E",
  cyan: "#61DAFB",
  green: "#3FB950",
  red: "#F85149",
  orange: "#eb3e1b",
};


export const topInset = Platform.select({
  ios: 56,
  android: (StatusBar.currentHeight ?? 24) + 10,
  default: 24,
});
