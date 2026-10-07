import React, { useState, useEffect } from "react"
import { View, StyleSheet, TouchableOpacity, Text, ImageBackground, Image, ScrollView, TextInput, Alert } from "react-native"
import { colors } from "../src/style/theme"
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite"
import { DATABASE_NAME, openDATABASE, getPromotion, savePromotion, deletePromotion, updatePromotionStatus } from "../database/db"

export default function Promotion({ changepage }) {
  return (
    <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
      <PromotionScreen changepage={changepage} />
    </SQLiteProvider>
  )
}

function PromotionScreen({ changepage }) {
  const db = useSQLiteContext()
  const [tab, setTab] = useState("list") 
  const [promotions, setPromotions] = useState([])
  const [editId, setEditId] = useState(null)
  const [promoName, setPromoName] = useState("")
  const [discountType, setDiscountType] = useState("percent") 
  const [discountValue, setDiscountValue] = useState("")
  const [minPrice, setMinPrice] = useState("")

  const loadPromotions = async () => {
    try {
      const data = await getPromotion(db)
      setPromotions(data)
    } catch (error) {
      console.log("โหลดโปรโมชั่นไม่สำเร็จ", error)
    }
  }

  useEffect(() => {
    loadPromotions()
  }, [])

  const resetForm = () => {
    setEditId(null)
    setPromoName("")
    setDiscountType("percent")
    setDiscountValue("")
    setMinPrice("")
  }

  const handleSave = async () => {
    if (!promoName.trim() || !discountValue.trim()) {
      Alert.alert("เตือน", "กรุณากรอกชื่อและส่วนลดให้ครบถ้วน")
      return
    }

    try {
      await savePromotion(db, {
        promotionId: editId, 
        promotionName: promoName.trim(),
        discountType: discountType,
        discountValue: Number(discountValue),
        minPrice: minPrice ? Number(minPrice) : 0
      })
      await loadPromotions()
      resetForm()
      setTab("list")
    } catch (error) {
      console.log("บันทึกโปรโมชั่นไม่สำเร็จ", error)
    }
  }

  const handleEdit = item => {
    setEditId(item.promotion_id)
    setPromoName(item.promotion_name)
    setDiscountType(item.discount_type)
    setDiscountValue(String(item.discount_value))
    setMinPrice(String(item.min_price || ""))
    setTab("edit")
  }

  const handleToggleStatus = async item => {
    const newStatus = item.is_active === "closed" ? "open" : "closed"
    try {
      await updatePromotionStatus(db, item.promotion_id, newStatus)
      await loadPromotions()
    } catch (error) {
      console.log("เปลี่ยนสถานะไม่สำเร็จ", error)
    }
  }

  const handleDelete = async id => {
    Alert.alert("ยืนยัน", "ต้องการลบโปรโมชั่นนี้ใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePromotion(db, id)
            await loadPromotions()
          } catch (error) {
            console.log("ลบโปรโมชั่นไม่สำเร็จ", error)
          }
        }
      }
    ])
  }

  return (
    <ImageBackground source={require("../photo/order.jpg")} style={styles.content}>
      <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => changepage("Login")}>
        <Image source={require("../photo/back.png")} style={styles.picback} />
      </TouchableOpacity>


      <View style={styles.top}>
        <View style={{ paddingLeft: 20, paddingRight: 20, borderRadius: 50 }}>
          <Text style={styles.title}>Promotion</Text>
        </View>
      </View>

      <View style={styles.table}>
        {tab === "list" ? (
          <ScrollView contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }}>
            <View style={styles.contentfood}>
              
              <View style={styles.addfood}>
                <TouchableOpacity
                  style={styles.butaddfood}
                  onPress={() => {
                    resetForm()
                    setTab("add")
                  }}>
                  <Text style={{ fontSize: 20, color: "#fff" }}>+ เพิ่มโปรโมชั่น</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.listfood}>
                {promotions.length ? (
                  promotions.map(item => (
                    <View style={styles.card} key={item.promotion_id}>
                      <View style={styles.data}>
                        <Text style={styles.promoTitle}>{item.promotion_name}</Text>
                        <Text style={styles.promoDetail}>
                          ส่วนลด: {item.discount_value}{" "}
                          {item.discount_type === "percent" ? "%" : "บาท"}
                        </Text>
                        <Text style={styles.promoDetail}>
                          ขั้นต่ำ: {item.min_price ? `${item.min_price} บาท` : "ไม่มีขั้นต่ำ"}
                        </Text>
                        <Text style={{ marginTop: 4 }}>
                          สถานะ : {item.is_active === "closed" ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                        </Text>
                        <View style={styles.option}>
                          <TouchableOpacity style={styles.fix}
                            onPress={() => handleToggleStatus(item)}>
                            <Text style={{ color: colors.text }}>
                              {item.is_active === "closed" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.fix}
                            onPress={() => handleDelete(item.promotion_id)}>

                            <Text style={{ color: colors.text }}>Delete</Text>
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.edit} onPress={() => handleEdit(item)}>
                          <Text style={{ color: colors.text }}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.noData}>
                    <Text style={styles.noDataText}>ยังไม่มีโปรโมชั่น</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }}>
            <View style={styles.formContainer}>
              <Text style={styles.formHeader}>
                {tab === "add" ? "เพิ่มโปรโมชั่นใหม่" : "แก้ไขโปรโมชั่น"}
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>ชื่อโปรโมชั่น :</Text>
                <TextInput
                  style={styles.input}
                  value={promoName}
                  onChangeText={setPromoName}
                  placeholder=""
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>ประเภทส่วนลด :</Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 5 }}>
                  <TouchableOpacity style={[styles.typeBtn,
                    discountType === "percent" && styles.typeBtnActive]}
                    onPress={() => setDiscountType("percent")}>
                    <Text style={{ color: discountType === "percent" ? "#fff" : "#000" }}>
                      เปอร์เซ็นต์ (%)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.typeBtn,
                    discountType === "amount" && styles.typeBtnActive]}
                    onPress={() => setDiscountType("amount")}>
                    <Text style={{ color: discountType === "amount" ? "#fff" : "#000" }}>จำนวนเงิน (บาท)</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  มูลค่าส่วนลด ({discountType === "percent" ? "%" : "บาท"}) :
                </Text>
                <TextInput
                  style={styles.input}
                  value={discountValue}
                  onChangeText={setDiscountValue}
                  keyboardType="numeric"
                  placeholder=""
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ยอดซื้อขั้นต่ำ (บาท) :</Text>
                <TextInput
                  style={styles.input}
                  value={minPrice}
                  onChangeText={setMinPrice}
                  keyboardType="numeric"
                  placeholder=""
                />
              </View>

              <View style={styles.option}>
                <TouchableOpacity
                  style={styles.fix}
                  onPress={() => {
                    resetForm()
                    setTab("list")
                  }}
                >
                  <Text style={{ color: colors.text }}>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.fix1}
                  onPress={handleSave}
                >
                  <Text style={{ color: colors.text }}>เสร็จสิ้น</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      <View style={styles.bottombar}>
        {["TableMap", "Order", "Menu", "Account", "Promotion"].map(page => (
          <TouchableOpacity key={page} style={styles.page} onPress={() => changepage(page)}>
            <Text style={styles.titlepage}>{page === "TableMap" ? "Table" : page}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  content: { flex: 1, resizeMode: "cover" },
  picback: { width: 30, height: 30, marginTop: 40, marginBottom: 10 },
  top: { alignItems: "center", marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", backgroundColor: "rgba(255, 255, 255, 0.8)", paddingHorizontal: 20, borderRadius: 15 },
  table: { flex: 1, backgroundColor: "rgba(255, 255, 255, 0.4)" },
  contentfood: { padding: 10 },
  addfood: { alignItems: "center", marginBottom: 15 },
  butaddfood: { backgroundColor: colors.red || "#d9534f", padding: 10, borderRadius: 10, width: "80%", alignItems: "center" },
  listfood: { gap: 10 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, elevation: 2 },
  promoTitle: { fontSize: 18, fontWeight: "bold" },
  promoDetail: { fontSize: 14, color: "#555", marginTop: 2 },
  option: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  fix: { backgroundColor: "#ccc", padding: 8, borderRadius: 5, flex: 1, alignItems: "center", marginHorizontal: 2 },
  fix1: { backgroundColor: colors.red || "#d9534f", padding: 8, borderRadius: 5, flex: 1, alignItems: "center", marginHorizontal: 2 },
  edit: { backgroundColor: "#f0ad4e", padding: 8, borderRadius: 5, alignItems: "center", marginTop: 5 },
  noData: { alignItems: "center", marginTop: 50 },
  noDataText: { fontSize: 18, color: "#666" },
  formContainer: { backgroundColor: "#fff", margin: 15, padding: 15, borderRadius: 10 },
  formHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 8, fontSize: 16 },
  typeBtn: { padding: 8, borderRadius: 5, borderWidth: 1, borderColor: "#ccc", flex: 1, alignItems: "center" },
  typeBtnActive: { backgroundColor: colors.red || "#d9534f", borderColor: colors.red || "#d9534f" },
  bottombar: { flexDirection: "row", justifyContent: "space-around", position: "absolute", bottom: 0, left: 0, right: 0 },
  page: {
    borderColor: colors.text, borderTopWidth: 2, borderWidth: 1, flex: 1,
    height: 60, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.red
  },
  titlepage: { color: colors.text, fontSize: 15, fontWeight: 'bold' },
})