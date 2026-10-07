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
  DATABASE_NAME,
  openDATABASE,
  addOptionGroupWithItems,
  getMenuFullDetails,
  deleteOptionGroup,
} from "../database/db";
import { styles } from "../src/style/menuOptionStyle";
import { colors } from "../src/style/theme";


function ManageOptions({ changepage, selectedMenu }) {
  return (
    <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
      <ManageOptionsContent
        changepage={changepage}
        selectedMenu={selectedMenu}
      />
    </SQLiteProvider>
  );
}

function ManageOptionsContent({ changepage, selectedMenu }) {
  const db = useSQLiteContext();
  const [existingGroups, setExistingGroups] = useState([]);
  const [groupTitle, setGroupTitle] = useState("");
  const [options, setOptions] = useState([{ name: "", price: "" }]);

  const loadExistingOptions = async () => {
    if (!selectedMenu?.menu_id) return;
    try {
      const data = await getMenuFullDetails(db, selectedMenu.menu_id);
      setExistingGroups(data);
    } catch (error) {
      console.log(" Error loading options:", error);
    }
  };

  useEffect(() => {
    loadExistingOptions();
  }, [selectedMenu]);

  // ฟังก์ชันลบรายการเพิ่มเติมที่มีอยู่
  const handleDeleteGroup = async (groupId) => {
    Alert.alert("ยืนยันการลบ", "คุณต้องการลบรายการเพิ่มเติมนี้ใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteOptionGroup(db, groupId);
            await loadExistingOptions();
          } catch (error) {
            console.log(" Error deleting group:", error);
          }
        },
      },
    ]);
  };

  // บังคับกรอกชื่อและราคาก่อนกดสร้างรายการใหม่
  const handleAddOptionRow = () => {
    const lastOption = options[options.length - 1];

    if (!lastOption.name.trim()) {
      Alert.alert(
        "แจ้งเตือน",
        "กรุณากรอกชื่อตัวเลือกปัจจุบันก่อนเพิ่มรายการใหม่",
      );
      return;
    }

    if (!lastOption.price.trim() || isNaN(Number(lastOption.price))) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกราคาก่อนเพิ่มรายการใหม่");
      return;
    }

    setOptions([...options, { name: "", price: "" }]);
  };

  const handleOptionChange = (text, index, field) => {
    const updated = [...options];

    if (field === "price") {
      const numericValue = text.replace(/[^0-9]/g, "");
      updated[index][field] = numericValue;
    } else {
      updated[index][field] = text;
    }
    setOptions(updated);
  };

  // บันทึกกลุ่มรายการเพิ่มเติมใหม่
  const handleSave = async () => {
    if (!groupTitle.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณาระบุชื่อสำหรับรายการเพิ่มเติม");
      return;
    }

    const validOptions = options.filter(
      (opt) =>
        opt.name.trim() !== "" &&
        !isNaN(Number(opt.price)) &&
        opt.price.trim() !== "",
    );

    if (validOptions.length === 0) {
      Alert.alert(
        "ข้อผิดพลาด",
        "กรุณากรอกตัวเลือกย่อยอย่างน้อย 1 รายการ พร้อมระบุราคาให้ถูกต้อง",
      );
      return;
    }

    try {
      await addOptionGroupWithItems(
        db,
        selectedMenu.menu_id,
        groupTitle.trim(),
        false,
        validOptions,
      );

      Alert.alert("สำเร็จ", "บันทึกรายการเพิ่มเติมเรียบร้อยแล้ว", [
        {
          text: "ตกลง",
          onPress: () => changepage("Menu"),
        },
      ]);
    } catch (error) {
      console.log("การบันทึกรายการเพิ่มเติมผิดพลาด:", error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถบันทึกรายการเพิ่มเติมได้");
    }
  };

  return (
    <ImageBackground
      source={require("../photo/order.jpg")}
      style={styles.bgImage}
    >
      <View style={styles.cardContainer}>
        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ชื่อเมนู */}
          <Text style={styles.menuTitle}>
            {selectedMenu?.menu_name || "Menu Name"}
          </Text>

          <View style={styles.divider} />

          {/*  ส่วนแสดงผลกลุ่มรายการเพิ่มเติมที่มีอยู */}
          {existingGroups.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: colors.orange,
                  marginBottom: 10,
                }}
              >
                รายการเพิ่มเติมที่มีอยู่แล้ว
              </Text>

              {existingGroups.map((group) => (
                <View
                  key={group.group_id}
                  style={{
                    backgroundColor: colors.bg,
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#E9ECEF",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: colors.title,
                      }}
                    >
                      {group.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteGroup(group.group_id)}
                      style={{
                        backgroundColor: colors.red,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: 12,
                          fontWeight: "bold",
                        }}
                      >
                        ลบกลุ่ม
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {group.options?.map((opt) => (
                    <View
                      key={opt.option_id}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingVertical: 4,
                      }}
                    >
                      <Text style={{ color: "#4A4A4A", fontSize: 15 }}>
                        • {opt.name}
                      </Text>
                      <Text
                        style={{
                          color: "#4A4A4A",
                          fontSize: 15,
                          fontWeight: "500",
                        }}
                      >
                        +{opt.price} ฿
                      </Text>
                    </View>
                  ))}
                </View>
              ))}

              <View style={styles.divider} />
            </View>
          )}

          {/*  ส่วนกรอกสร้างรายการเพิ่มเติมใหม่ */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#4A4A4A",
              marginBottom: 8,
            }}
          >
            เพิ่มรายการเพิ่มเติมใหม่
          </Text>

          {/* หัวข้อรายการเพิ่มเติม */}
          <TextInput
            style={styles.groupTitleInput}
            placeholder="รายการเพิ่มเติม (เช่น ท็อปปิ้ง)"
            placeholderTextColor={colors.dim}
            value={groupTitle}
            onChangeText={setGroupTitle}
          />

          {/* รายการตัวเลือกย่อย */}
          {options.map((opt, i) => (
            <View key={i}>
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <TouchableOpacity
                    style={styles.addCircleBtn}
                    onPress={handleAddOptionRow}
                  >
                    <Text style={styles.addCircleText}>+</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.optionInput}
                    placeholder={`เพิ่มตัวเลือกย่อย ${i + 1}`}
                    placeholderTextColor={colors.dim}
                    value={opt.name}
                    onChangeText={(t) => handleOptionChange(t, i, "name")}
                  />
                </View>

                <View style={styles.priceContainer}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="ราคา"
                    placeholderTextColor={colors.dim}
                    keyboardType="numeric"
                    value={opt.price}
                    onChangeText={(t) => handleOptionChange(t, i, "price")}
                  />
                  <Text style={styles.priceUnit}>฿</Text>
                </View>
              </View>
              <View style={styles.divider} />
            </View>
          ))}
        </ScrollView>

        {/* ปุ่มยกเลิก และ บันทึก */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => changepage("Menu")}
          >
            <Text style={styles.cancelBtnText}>ยกเลิก</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>บันทึก</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

export default ManageOptions;