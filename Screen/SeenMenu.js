import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { colors } from "../src/style/theme";
import { styles } from "../src/style/seenMenuStyle";
import Cart from "./Cart";

export default function SeenMenuScreen({ billId = 1, tableName = "โต๊ะ 1" }) {
  const db = useSQLiteContext();

  const [currentScreen, setCurrentScreen] = useState("menu");

  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงหมวดหมู่ เมนูจาก db
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        const categoryData = await db.getAllAsync(`SELECT * FROM Categories`);
        console.log("categories:", categoryData);
        setCategories(categoryData);

        const menuData = await db.getAllAsync(`SELECT * FROM Menu`);
        console.log("menus:", menuData);
        setMenus(menuData);

        if (categoryData.length > 0) {
          setSelectedCategoryId(categoryData[0].category_id);
        }
      } catch (error) {
        console.error("Error loading menu data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [db]);

  // เพิ่มสินค้าลงตะกร้า
  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.menu_id === item.menu_id,
      );
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.menu_id === item.menu_id
            ? { ...cartItem, amount: cartItem.amount + 1 }
            : cartItem,
        );
      } else {
        return [
          ...prevCart,
          {
            menu_id: item.menu_id,
            name: item.name,
            unit_price: item.unit_price,
            amount: 1,
            status: "PENDING",
          },
        ];
      }
    });
  };

  // คำนวณจำนวนในตะกร้า
  const totalCartCount = cart.reduce((sum, item) => sum + item.amount, 0);

  // กรองรายการอาหารตามหมวดหมู่
  const filteredMenus = menus.filter(
    (menu) => menu.category_id === selectedCategoryId,
  );

  const renderMenuItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image_url || "https://via.placeholder.com/150" }}
        style={styles.image}
      />
      <View style={styles.footer}>
        <View style={styles.cardInfo}>
          <Text style={styles.foodName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.foodPrice}>฿{item.unit_price}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /** ไปหน้าตะกร้า */
  if (currentScreen === "cart") {
    return (
      <View style={{ flex: 1 }}>
        {/* ปุ่มกดย้อนกลับมาหน้าเมนู */}
        <TouchableOpacity
          style={{
            paddingHorizontal: 20,
            paddingTop: 50,
            paddingBottom: 10,
            backgroundColor: colors.bg,
          }}
          onPress={() => setCurrentScreen("menu")}
        >
          <Text
            style={{ color: colors.orange, fontSize: 16, fontWeight: "600" }}
          >
            ← กลับไปเลือกอาหาร
          </Text>
        </TouchableOpacity>

        <Cart
          item={{
            params: {
              bill_id: billId,
              table_name: tableName,
              cart: cart,
            },
          }}
        />
      </View>
    );
  }

  /**แสดงเมนู */
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>หมวดหมู่</Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => setCurrentScreen("cart")}
          >
            <Text style={{ fontSize: 20 }}>🛒</Text>
            {totalCartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {totalCartCount > 99 ? "99+" : totalCartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>กำลังโหลดข้อมูล...</Text>
        </View>
      ) : (
        <>
          {/* แถบหมวดหมู่ */}
          <View style={{ maxHeight: 50 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabs}
            >
              {categories.map((cat) => {
                const isSelected = cat.category_id === selectedCategoryId;
                return (
                  <TouchableOpacity
                    key={cat.category_id}
                    style={[styles.tab, isSelected && styles.tabActive]}
                    onPress={() => setSelectedCategoryId(cat.category_id)}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        isSelected && styles.tabTextActive,
                      ]}
                    >
                      {cat.category_name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* เมนูอาหาร 2 คอลัมน์ */}
          <FlatList
            data={filteredMenus}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.menu_id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  ไม่มีรายการอาหารในหมวดหมู่นี้
                </Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}
