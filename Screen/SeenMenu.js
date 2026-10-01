/** หน้า Menu สำหรับลูกค้า */
import { useState, useEffect } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator, // สัญลักษณ์ loader
} from "react-native";
import { colors } from "../src/style/theme";

export default function CategoryMenuScreen() {
  const [categoriesFromDB, setCategoriesFromDB] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);

  // ดึงข้อมูลหมวดหมู่จาก Database
  useEffect(() => {
    const fetchCategoriesFromDB = async () => {
      try {
        setIsLoadingCategory(true);
        // จำลอง delay ต่อ Network 1 วินาที
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // ข้อมูลตัวอย่างจากตาราง Categories ใน Database
        const dbResult = [
          { category_id: 1, category_name: "จานหลัก" },
          { category_id: 2, category_name: "หวาน" },
          { category_id: 3, category_name: "ทานเล่น" },
          { category_id: 4, category_name: "เครื่องดื่ม" },
        ];

        setCategoriesFromDB(dbResult);

        if (dbResult.length > 0) {
          setSelectedCategoryId(dbResult[0].category_id);
        }
      } catch (error) {
        console.error("Fetch categories error:", error);
      } finally {
        setIsLoadingCategory(false);
      }
    };

    fetchCategoriesFromDB();
  }, []);

  // Render ปุ่มหมวดหมู่แนวนอน
  const renderCategoryItem = ({ item }) => {
    const isSelected = item.category_id === selectedCategoryId;
    return (
      <TouchableOpacity
        style={[styles.categoryTab, isSelected && styles.categoryTabSelected]}
        onPress={() => setSelectedCategoryId(item.category_id)}
      >
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.categoryTextSelected,
          ]}
        >
          {item.category_name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>หมวดหมู่</Text>
      </View>

      {/* แถบหมวดหมู่ (ดึงข้อมูลมาจาก DB) */}
      <View style={styles.categoryContainer}>
        {isLoadingCategory ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <FlatList
            data={categoriesFromDB}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.category_id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        )}
      </View>

      {/* พื้นที่แสดงรายการอาหาร (Empty State เปล่าๆ) */}
      <View style={styles.emptyFoodContainer}>
        <Text style={styles.emptyFoodText}>ยังไม่มีรายการอาหาร</Text>
      </View>
    </SafeAreaView>
  );
}
