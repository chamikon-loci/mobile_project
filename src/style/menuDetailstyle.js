import { StyleSheet } from "react-native";
import { colors } from "./theme";

export const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    padding: 15,
    paddingTop: 30,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: 25,
    padding: 20,
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  contentScroll: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.title,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  groupSection: {
    marginBottom: 15,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.title,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4A4A4A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioSelected: {
    borderColor: "#4A4A4A",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4A4A4A",
  },
  optionName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  noteSection: {
    marginTop: 15,
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.dim,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: "#F8F8F8",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 10,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.dim,
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 15,
    color: "#000000",
  },
  cartButton: {
    flex: 1,
    marginLeft: 15,
    backgroundColor: colors.orange, 
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cartBtnPrice: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 5,
  },
});