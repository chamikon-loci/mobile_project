import { StyleSheet } from "react-native";
import { colors, topInset } from "./theme";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: topInset, paddingHorizontal: 20, paddingBottom: 12 },
  title: { color: colors.text, fontSize: 24, fontWeight: "800" },
  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  tabActive: {
    borderColor: colors.border,
    backgroundColor: "rgba(235, 62, 27, 0.14)",
  },
  tabText: { color: colors.text, fontSize: 14 },
  tabTextActive: { color: "#ffffff", fontWeight: "700" },
  list: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  row: { justifyContent: "space-between", marginBottom: 16 },

  card: {
    width: "48%",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cardInfo: {
    marginTop: 10,
  },
  foodName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  foodPrice: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.orange,
    borderWidth: 1,
    borderColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: -2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    color: colors.dim,
    fontSize: 16,
    fontWeight: "500",
  },
});
