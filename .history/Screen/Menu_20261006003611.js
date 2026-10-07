import { View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground, ScrollView, TextInput } from "react-native"
import { colors } from "../src/style/theme"
import { useState, useEffect } from "react"
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite"
import * as ImagePicker from "expo-image-picker"
import { DATABASE_NAME, getAllMenu, saveMenu, addMenu, openDATABASE, getAllCategories, addCategory, deleteCategory, deleteMenu, updateMenuStatus } from "../database/db"

function Menu({ changepage }) {
  return (
    <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
      <MenuScreen changepage={changepage} />
    </SQLiteProvider>
  )
}

function MenuScreen({ changepage }) {
  const db = useSQLiteContext()
  const [tabfood, setTabfood] = useState("listfood")
  const [menu, setMenu] = useState([])
  const [categories, setCategories] = useState([])
  const [editMenu, setEditMenu] = useState(null)
  const [menuName, setMenuName] = useState("")
  const [menuPrice, setMenuPrice] = useState("")
  const [categoryId, setCategoryId] = useState(null)
  const [categoryName, setCategoryName] = useState("")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [editImage, setEditImage] = useState(null)
  const [addName, setAddName] = useState("")
  const [addPrice, setAddPrice] = useState("")
  const [addCategoryId, setAddCategoryId] = useState(null)
  const [addImage, setAddImage] = useState(null)

  const loadMenu = async () => {
    try { setMenu(await getAllMenu(db)) }
    catch { console.log("ไม่สามารถโหลดข้อมูลเมนูได้") }
  }

  const loadCategories = async () => {
    try { setCategories(await getAllCategories(db)) }
    catch { console.log("โหลดหมวดหมู่ไม่สำเร็จ") }
  }

  useEffect(() => {
    loadMenu()
    loadCategories()
  }, [])

  const pickImage = async setImage => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    })
    if (!result.canceled) setImage(result.assets[0].uri)
  }

  const toggleMenuStatus = async (item) => {
    const newStatus = item.is_available === "closed" ? "open" : "closed"
    try {
      await updateMenuStatus(db, item.menu_id, newStatus)
      await loadMenu()
    } catch (error) {
      console.log("เปลี่ยนสถานะไม่สำเร็จ", error)
    }
  }

  const AddCategory = async () => {
    if (!categoryName.trim()) return
    try {
      await addCategory(db, categoryName.trim())
      await loadCategories()
      setCategoryName("")
      setTabfood("listfood")
    } catch { console.log("เพิ่มหมวดหมู่ไม่สำเร็จ") }
  }

  const saveEdit = async () => {
    if (!editMenu || !menuName.trim() || !menuPrice.trim()) return
    try {
      await saveMenu(db, editMenu.menu_id, menuName.trim(), Number(menuPrice), categoryId, editImage)
      await loadMenu()
      setEditMenu(null)
      setMenuName("")
      setMenuPrice("")
      setEditImage(null)
      setTabfood("listfood")
    } catch { console.log("แก้ไขเมนูไม่สำเร็จ") }
  }

  const saveAddMenu = async () => {
    if (!addName.trim() || !addPrice.trim() || !addCategoryId) {
      console.log("เติมข้อมูลไม่ครบ")
      return
    }
    try {
      await addMenu(db, addName.trim(), Number(addPrice), addCategoryId, addImage)
      await loadMenu()
      setAddName("")
      setAddPrice("")
      setAddCategoryId(null)
      setAddImage(null)
      setShowCategoryDropdown(false)
      setTabfood("listfood")
    } catch { console.log("เพิ่มเมนูไม่สำเร็จ") }
  }

  const DeleteMenu = async id => {
    try {
      await deleteMenu(db, id)
      await loadMenu()
    } catch { console.log("ลบเมนูไม่สำเร็จ") }
  }

  const DeleteCategory = async id => {
    try {
      await deleteCategory(db, id)
      await loadCategories()
    } catch { console.log("ลบหมวดหมู่ไม่สำเร็จ") }
  }

  const resetAdd = () => {
    setAddName("")
    setAddPrice("")
    setAddCategoryId(null)
    setAddImage(null)
  }

  const editItem = item => {
    setEditMenu(item)
    setMenuName(item.menu_name)
    setMenuPrice(String(item.unit_price))
    setCategoryId(item.category_id)
    setEditImage(item.image || null)
    setTabfood("editfood")
  }

  return (
    <ImageBackground source={require("../photo/order.jpg")} style={styles.content}>
      <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => changepage("Login")}>
        <Image source={require("../photo/back.png")} style={styles.picback} />
      </TouchableOpacity>

      <View style={styles.top}>
        <View style={{ paddingLeft: 20, paddingRight: 20, borderRadius: 50 }}>
          <Text style={styles.title}>Menu</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.column}>
          <ScrollView horizontal>
            <TouchableOpacity style={styles.category} onPress={() => setTabfood("addcategory")}>
              <Text style={styles.categoryname}>+ หมวดหมู่อาหาร</Text>
            </TouchableOpacity>

            {categories.map(category => (
              <View key={category.category_id} style={styles.categoryItem}>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    addCategoryId === category.category_id && styles.categoryButtonActive
                  ]}
                  onPress={() => setAddCategoryId(category.category_id)}
                >
                  <Text>{category.category_name}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteCategory}
                  onPress={() => DeleteCategory(category.category_id)}
                >
                  <Text style={styles.deleteCategoryText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {tabfood === "listfood" ? (
          <ScrollView contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }}>
            <View style={styles.contentfood}>
              <View style={styles.addfood}>
                <TouchableOpacity
                  style={styles.butaddfood}
                  onPress={() => {
                    resetAdd()
                    setTabfood("addfood")
                  }}
                >
                  <Text style={{ fontSize: 20 }}>เพิ่มเมนูอาหาร</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.listfood}>
                {menu.length ? menu.map(item => (
                  <View style={styles.card} key={item.menu_id}>
                    <Image
                      source={item.image ? { uri: item.image } : require("../photo/OIP.webp")}
                      style={styles.picfood}
                    />

                    <View style={styles.data}>
                      <View style={styles.namedata}>
                        <Text>Name : </Text>
                        <TextInput style={styles.namefood} value={String(item.menu_name)} editable={false} />
                      </View>

                      <View style={styles.namedata}>
                        <Text>Price : </Text>
                        <TextInput style={styles.datafood} value={String(item.unit_price)} editable={false} />
                      </View>

                      <View style={styles.namedata}>
                        <Text>Category : </Text>
                        <Text style={styles.datafood}>{item.category_name || "-"}</Text>
                      </View>

                      <Text>สถานะ : {item.is_available === "closed" ? "ปิดการขาย" : "เปิดการขาย"}</Text>

                      <View style={styles.option}>
                        <TouchableOpacity
                          style={styles.fix}
                          onPress={() => toggleMenuStatus(item)}
                        >
                          <Text style={{ color: colors.text }}>
                            {item.is_available === "closed" ? "เปิดการขาย" : "ปิดการขาย"}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.fix} onPress={() => DeleteMenu(item.menu_id)}>
                          <Text style={{ color: colors.text }}>Delete</Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity style={styles.edit} onPress={() => editItem(item)}>
                        <Text style={{ color: colors.text }}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )) : (
                  <View style={styles.noData}>
                    <Text style={styles.noDataText}>ไม่มีเมนู</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        ) : tabfood === "editfood" ? (
          <View style={styles.contentaddfood}>
            <TouchableOpacity onPress={() => pickImage(setEditImage)}>
              <View style={styles.cardaddfood}>
                <Text style={{ color: colors.red, marginTop: 5 }}>[ เปลี่ยนรูปภาพ ]</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dataaddfood}>
              <View style={styles.bottomaddfood}>
                <View style={styles.namedata}>
                  <Text>Name : </Text>
                  <TextInput style={styles.namefood} value={menuName} onChangeText={setMenuName} />
                </View>

                <View style={styles.namedata}>
                  <Text>Price : </Text>
                  <TextInput style={styles.datafood} value={menuPrice} onChangeText={setMenuPrice} keyboardType="numeric" />
                </View>

                <View style={styles.namedata}>
                  <Text>Category : </Text>
                  <Text style={styles.datafood}>{editMenu?.category_name || "-"}</Text>
                </View>

                <View style={styles.option}>
                  <TouchableOpacity
                    style={styles.fix}
                    onPress={() => {
                      setEditMenu(null)
                      setTabfood("listfood")
                    }}
                  >
                    <Text style={{ color: colors.text }}>ยกเลิก</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.fix1} onPress={saveEdit}>
                    <Text style={{ color: colors.text }}>เสร็จสิ้น</Text>
                  </TouchableOpacity>
                </View>