import { useState } from "react";
import { View, StyleSheet } from "react-native";

import Login from "./Screen/Login.js";
import TableMap from "./Screen/TableMap.js";
import Order from "./Screen/Order.js";
import Menu from "./Screen/Menu.js";
import Account from "./Screen/Account.js";
import MenuClient from "./Screen/MenuClient.js";
import Cart from "./Screen/Cart.js";
import BillHistory from "./Screen/BillHistory.js";
import Orderhistory from "./Screen/Orderhistory.js";
import Promotion from "./Screen/Promotion.js";
import MenuDetail from "./Screen/MenuDetail.js";
import ManageOptions from "./Screen/MenuOption.js";


export default function App() {
  const [currentpage, setpage] = useState("Login");
  const [billId, setBillId] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);

  // ฟังก์ชันเปลี่ยนหน้าและส่งต่อข้อมูล
  const changepage = (page, params = {}) => {
    setpage(page);

    if (typeof params === "object" && params !== null) {
      if (params.billId !== undefined) {
        setBillId(params.billId);
      }
      if (params.selectedMenu !== undefined) {
        setSelectedMenu(params.selectedMenu);
      }
    } else {
      if (params !== null) {
        setBillId(params);
      }
    }
  };

  const renderScreen = () => {
    switch (currentpage) {
      case "Login":
        return <Login changepage={changepage} />;

      case "TableMap":
        return <TableMap changepage={changepage} />;

      case "Order":
        return <Order changepage={changepage} />;

      case "Menu":
        return <Menu changepage={changepage} />;

      case "Account":
        return <Account changepage={changepage} />;

      case "Promotion":
        return <Promotion changepage={changepage} />;

      case "MenuClient":
        return <MenuClient changepage={changepage} billId={billId} />;

      case "Cart":
        return <Cart changepage={changepage} billId={billId} />;

      case "BillHistory":
        return <BillHistory changepage={changepage} billId={billId} />;

      case "Orderhistory":
        return <Orderhistory changepage={changepage} billId={billId} />;

      case "MenuDetail":
        return (
          <MenuDetail
            changepage={changepage}
            billId={billId}
            selectedMenu={selectedMenu}
          />
        );

      case "ManageOptions":
        return (
          <ManageOptions changepage={changepage} selectedMenu={selectedMenu} />
        );

      default:
        return <Login changepage={changepage} />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
