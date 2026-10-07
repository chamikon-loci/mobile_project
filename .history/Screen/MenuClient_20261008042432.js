import {View, StyleSheet, TouchableOpacity, Image,Text, ImageBackground, ScrollView,
TextInput} from "react-native";
import { colors } from "../src/style/theme";
import { useState, useEffect } from "react";
import { DATABASE_NAME,getMenu,openDATABASE,getAllCategories,getAllMenu,getCart,} from "../database/db";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";

function MenuClient({ changepage, billId }) {
  return (
    <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
      <MenuClientScreen changepage={changepage} billId={billId} />
    </SQLiteProvider>
  );
}

function MenuClientScreen({ changepage, billId }) {
  const db = useSQLiteContext();
  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredMenu = menu.filter((item) => {
    const isOpen = item.is_available !== "closed";
    const itemName = item.menu_name || item.name;
    const matchesSearch = itemName
      ?.toLowerCase()
      .includes(searchText.toLowerCase());
    return isOpen && matchesSearch;
  });

  const loadMenu = async (categoryid) => {
    try {
      const data = await getMenu(db, categoryid);
      setMenu(data);
      setSelectedCategory(categoryid);
    } catch (error) {
      console.log("ไม่สามารถโหลดข้อมูลเมนูได้", error);
    }
  };

  const AllMenu = async () => {
    try {
      const data = await getAllMenu(db);
      setMenu(data);
      setSelectedCategory(null);
    } catch (error) {
      console.log("ไม่สามารถโหลดข้อมูลเมนูได้", error);
    }
  };

  const loadCategories = async () => {
    try {
      setCategories(await getAllCategories(db));
    } catch (error) {
      console.log("โหลดหมวดหมู่ไม่สำเร็จ", error);
    }
  };

  const loadCurrentCart = async () => {
    if (!billId) {
      setCart([]);
      return;
    }

    try {
      setCart(await getCart(db, billId));
    } catch (error) {
      console.log("โหลดตะกร้าไม่สำเร็จ", error);
    }
  };

  useEffect(() => {
    loadCategories();
    AllMenu();
    loadCurrentCart();
  }, [billId]);

  const openCart = () => changepage("Cart", billId);
  const openHistory = () => changepage("BillHistory", billId);

  // ฟังก์ชันหาชื่อหมวดหมู่จาก category_id
  const getCategoryName = (categoryId) => {
    const found = categories.find((cat) => cat.category_id === categoryId);
    return found ? found.category_name : "-";
  };

  // ฟังก์ชันไปยังหน้าดูรายละเอียดเมนูและเลือก Option
  const handleSelectMenu = (item) => {
    changepage("MenuDetail", {
      billId: billId,
      selectedMenu: item,
    });
  };

  return (
    <ImageBackground
      source={require("../photo/MenuClient.jpg")}
      style={styles.content}
    >
      <TouchableOpacity
        style={{ marginLeft: 10 }}
        onPress={() => changepage("Login")}
      >
        <Image source={require("../photo/back.png")} style={styles.picback} />
      </TouchableOpacity>

      <View style={styles.top}>
        <View style={styles.titleBox}>
          <Text style={styles.title}>Menu</Text>
        </View>
      </View>

      <View style={styles.column}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedCategory === null && styles.categoryActive,
            ]}
            onPress={AllMenu}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === null && { color: colors.text },
              ]}
            >
              อาหารทั้งหมด
            </Text>
          </TouchableOpacity>

          {categories.map((category) => (
            <TouchableOpacity
              key={category.category_id}
              style={[
                styles.categoryItem,
                selectedCategory === category.category_id &&
                  styles.categoryActive,
              ]}
              onPress={() => loadMenu(category.category_id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.category_id && {
                    color: colors.text,
                  },
                ]}
              >
                {category.category_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.search}>
        <TextInput
          style={styles.searchfood}
          placeholder="ค้นหาชื่ออาหาร"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View style={styles.listfood}>
          {filteredMenu.length > 0 ? (
            filteredMenu.map((item) => {
              const displayName = item.menu_name || item.name;
              const categoryName = item.category_name || getCategoryName(item.category_id);

              return (
                <TouchableOpacity
                  style={styles.card}
                  key={item.menu_id}
                  activeOpacity={0.8}
                  onPress={() => handleSelectMenu(item)}
                >
                  <Image
                    source={
                      item.image
                        ? { uri: item.image }
                        : require("../photo/OIP.webp")
                    }
                    style={styles.picfood}
                  />

                  <View style={styles.data}>
                    <View style={styles.namedata}>
                      <Text>Name :</Text>
                      <TextInput
                        style={styles.namefood}
                        editable={false}
                        value={String(displayName || "")}
                      />
                    </View>

                    <View style={styles.namedata}>
                      <Text>Category :</Text>
                      <TextInput
                        style={styles.datafood}
                        editable={false}
                        value={String(categoryName || "")}
                      />
                    </View>

                    <View style={styles.namedata}>
                      <Text>Price :</Text>
                      <TextInput
                        style={styles.datafood}
                        editable={false}
                        value={
                          item.unit_price
                            ? Number(item.unit_price).toFixed(2)
                            : "0.00"
                        }
                      />
                    </View>

                    <View style={styles.option}>
                      <TouchableOpacity
                        style={styles.addcart}
                        onPress={() => handleSelectMenu(item)}
                      >
                        <Text
                          style={{
                            color: colors.text,
                            textAlign: "center",
                            fontWeight: "bold",
                          }}
                        >
                          เพิ่มลงตะกร้าอาหาร
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.noData}>
              <Text style={styles.noDataText}>ไม่มีเมนู</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottombar}>
        <TouchableOpacity
          style={styles.page}
          onPress={() => changepage("MenuClient", billId)}
        >
          <Text style={styles.titlepage}>เมนูอาหาร</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.page1} onPress={openCart}>
          {cart.length > 0 && (
            <View style={styles.cartCount}>
              <Text style={styles.cartCountText}>{cart.length}</Text>
            </View>
          )}
          <Text style={styles.titlepage}>ตะกร้าอาหาร</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.page} onPress={openHistory}>
          <Text style={styles.titlepage}>ประวัติการสั่ง</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingTop: 20 },
  picback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: "absolute",
    left: 0,
  },
  top: { alignItems: "center" },
  titleBox: { paddingLeft: 20, paddingRight: 20, borderRadius: 50 },
  title: { fontSize: 50, fontWeight: "bold", color: colors.red },
  column: {
    flexDirection: "row",
    backgroundColor: colors.text,
    marginTop: 15,
  },
  categoryItem: {
    borderColor: colors.red,
    borderWidth: 2,
    backgroundColor: colors.text,
    padding: 10,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryActive: { backgroundColor: colors.red },
  categoryText: { fontWeight: "bold" },
  searchfood: {
    backgroundColor: colors.text,
    padding: 12,
    borderRadius: 25,
    marginBottom: 5,
    marginTop: 5,
    alignItems: "center",
    boxShadow: "0 0 6px rgba(0, 0, 0, 0.5)",
    flex: 1,
  },
  search: { padding: 5, flexDirection: "row", alignItems: "center" },
  listfood: { flexDirection: "column" },
  card: {
    backgroundColor: colors.text,
    padding: 5,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "rgba(232, 227, 227, 1)",
  },
  picfood: { width: 180, height: 200 },
  data: { padding: 10, flex: 1 },
  namedata: { flexDirection: "column" },
  namefood: {
    borderColor: "rgba(172, 169, 169, 0.9)",
    fontWeight: "bold",
    fontSize: 15,
    borderWidth: 1,
    height: 25,
    padding: 0,
    width: 150,
    marginBottom: 5,
    paddingLeft: 5,
    borderRadius: 15,
  },
  datafood: {
    borderColor: "rgba(172, 169, 169, 0.9)",
    fontSize: 15,
    borderWidth: 1,
    height: 25,
    padding: 0,
    width: 150,
    marginBottom: 5,
    borderRadius: 15,
    paddingLeft: 5,
    paddingRight: 5,
  },
  option: { marginTop: 10 },
  addcart: {
    padding: 10,
    backgroundColor: colors.red,
    borderRadius: 8,
    marginTop: 5,
  },
  bottombar: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  page: {
    borderColor: colors.text,
    borderTopWidth: 2,
    borderWidth: 1,
    flex: 1,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.red,
  },
  page1: {
    borderColor: colors.text,
    borderTopWidth: 2,
    borderWidth: 1,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.red,
    flexDirection: "row",
    width: 140,
  },
  titlepage: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  cartCount: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 3,
  },
  cartCountText: { color: colors.red, fontWeight: "bold" },
  noData: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  noDataText: {
    color: colors.red,
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "rgba(253, 253, 253, 0.7)",
    borderRadius: 15,
    paddingLeft: 80,
    paddingRight: 80,
    paddingTop: 20,
    paddingBottom: 20,
  },
});

export default MenuClient;