import { View, Text, StyleSheet } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import { DATABASE_NAME, openDATABASE } from "./database/db.js";
import TableMap from "./Screen/TableMap.js";
import Login from "./Screen/Login.js";
import { Suspense, useState } from "react";
import Account from "./Screen/Account.js";
import Menu from "./Screen/Menu.js";
import Order from "./Screen/Order.js";
import SeenMenuScreen from "./Screen/SeenMenu.js";

function AppContent() {
  const [currentpage, setpage] = useState("Login");
  const [selectedTable, setSelectedTable] = useState(1);

  const screen = () => {
    switch (currentpage) {
      case "Login":
        return (
          <Login changepage={setpage} setSelectedTable={setSelectedTable} />
        );
      case "SeenMenu":
        return (
          <SeenMenuScreen
            billId={selectedTable}
            tableName={`โต๊ะ ${selectedTable}`}
          />
        );
      case "TableMap":
        return <TableMap changepage={setpage} />;
      case "Order":
        return <Order changepage={setpage} />;
      case "Menu":
        return <Menu changepage={setpage} />;
      case "Account":
        return <Account changepage={setpage} />;
    }
  };

  return <View style={styles.container}>{screen()}</View>;
}

export default function App() {
  return (
    <SQLiteProvider
      databaseName={DATABASE_NAME}
      onInit={openDATABASE}
      onError={(e) => console.error("SQLite error:", e)}
    >
      <AppContent />
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
