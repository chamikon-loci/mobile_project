import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ImageBackground,
} from "react-native";
import { useState, useEffect } from "react";
import { useSQLiteContext, SQLiteProvider } from "expo-sqlite";
import {
  getMenuFullDetails,
  DATABASE_NAME,
  openDATABASE,
} from "../database/db";
import { styles } from "../src/style/menuDetailstyle";

function MenuDetail({ changepage, selectedMenu, billId }) {
  return (
    <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
      <MenuDetailContent
        changepage={changepage}
        selectedMenu={selectedMenu}
        billId={billId}
      />
    </SQLiteProvider>
  );
}

function MenuDetailContent({ changepage, selectedMenu, billId }) {
  const db = useSQLiteContext();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [note, setNote] = useState("");
  const [optionGroups, setOptionGroups] = useState([]);

  useEffect(() => {
    loadDatabaseOptions();
  }, [selectedMenu]);

  const loadDatabaseOptions = async () => {
    if (!selectedMenu?.menu_id) return;
    try {
      const data = await getMenuFullDetails(db, selectedMenu.menu_id);
      setOptionGroups(data);
    } catch (error) {
      console.log("Error loading menu options:", error);
    }
  };

  const calculateTotalPrice = () => {
    let basePrice = selectedMenu?.unit_price || 0;
    let extraPrice = 0;

    Object.values(selectedOptions).forEach((opt) => {
      if (opt && opt.price) {
        extraPrice += opt.price;
      }
    });

    return (basePrice + extraPrice) * quantity;
  };

  const handleSelectOption = (groupId, option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: option,
    }));
  };

  const handleAddToCart = async () => {
    if (!billId) {
      Alert.alert("ข้อผิดพลาด", "ไม่พบข้อมูลโต๊ะหรือ Bill ID");
      return;
    }

    try {
      const optionDetails = Object.values(selectedOptions)
        .map((o) => o.name)
        .join(", ");
      const combinedNote = [optionDetails, note].filter(Boolean).join(" | ");

      // คำนวณราคาต่อหน่วย (ราคาอาหาร + ราคาตัวเลือก)
      const basePrice = selectedMenu?.unit_price || 0;
      let extraPrice = 0;
      Object.values(selectedOptions).forEach((opt) => {
        if (opt && opt.price) {
          extraPrice += opt.price;
        }
      });
      const unitPriceWithOption = basePrice + extraPrice;

      await db.runAsync(
        `INSERT INTO Cart (bill_id, menu_id, amount, unit_price, note) VALUES (?, ?, ?, ?, ?)`,
        [
          billId,
          selectedMenu.menu_id,
          quantity,
          unitPriceWithOption,
          combinedNote,
        ]
      );

      changepage("MenuClient", { billId });
    } catch (error) {
      console.log("Error adding to cart:", error);
    }
  };

  const handleQuantityChange = (change) => {
    const newQty = quantity + change;
    if (newQty < 1) {
      changepage("MenuClient", { billId }); // ลดต่ำกว่า 1 คือยกเลิกแล้วกลับไปหน้า MenuClient
    } else {
      setQuantity(newQty);
    }
  };

  return (
    <ImageBackground
      source={require("../photo/MenuClient.jpg")}
      style={styles.bgImage}
    >
      <View style={styles.cardContainer}>
        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
        >
          
          {/* ชื่อเมนู */}
          <Text style={styles.menuTitle}>{selectedMenu?.menu_name}</Text>
          <View style={styles.divider} />

          {/* รายการตัวเลือก */}
          {optionGroups.map((group) => (
            <View key={group.group_id} style={styles.groupSection}>
              <Text style={styles.groupTitle}>{group.title}</Text>

              {group.options.map((option) => {
                const isSelected =
                  selectedOptions[group.group_id]?.option_id ===
                  option.option_id;
                return (
                  <TouchableOpacity
                    key={option.option_id}
                    style={styles.optionRow}
                    activeOpacity={0.7}
                    onPress={() => handleSelectOption(group.group_id, option)}
                  >
                    <View style={styles.optionLeft}>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <Text style={styles.optionName}>{option.name}</Text>
                    </View>
                    <Text style={styles.optionPrice}>+{option.price} ฿</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* โน้ต */}
          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>รายละเอียดเพิ่มเติม</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="ไม่ผัก, ไม่เผ็ด"
              placeholderTextColor="#A0A0A0"
              value={note}
              onChangeText={setNote}
            />
          </View>
        </ScrollView>

        {/* จำนวน + ปุ่มเพิ่มลงตะกร้า */}
        <View style={styles.footerRow}>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => handleQuantityChange(-1)}
            >
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => handleQuantityChange(1)}
            >
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
            <Text style={styles.cartBtnText}>เพิ่มลงตะกร้า </Text>
            <Text style={styles.cartBtnPrice}>
              ({calculateTotalPrice().toFixed(0)} ฿)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

export default MenuDetail
