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
  const [open, setOpen] = useState("เปิดการขาย")
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
           
              <TouchableOpacity style={styles.category} onPress={AllMenu}>
                <Text style={{ fontWeight: 'bold' }}>อาหารทั้งหมด</Text>
              </TouchableOpacity>
            
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
          <ScrollView contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }} style={{ backgroundColor: "rgba(232, 227, 227, 0.5)" }}>
            <View style={styles.contentaddfood}>
              <TouchableOpacity onPress={() => pickImage(setEditImage)}>
                <View style={styles.cardaddfood}>
                  <Image
                    source={editImage ? { uri: editImage } : require("../photo/plus.webp")}
                    style={styles.picaddfood}
                  />
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

                  <View style={[styles.namedata, { position: "relative", zIndex: 10 }]}>
                    <Text>Category : </Text>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                      <TouchableOpacity
                        onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        style={{ backgroundColor: colors.red, borderRadius: 15, padding: 5, width: 110 }}
                      >
                        <Text style={{ color: colors.text, textAlign: "center" }}>
                          {categoryId
                            ? categories.find(c => c.category_id === categoryId)?.category_name
                            : "เลือกหมวดหมู่"}
                        </Text>
                      </TouchableOpacity>

                      {showCategoryDropdown && (
                        <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                          {categories.length ? categories.map(category => (
                            <TouchableOpacity
                              key={category.category_id}
                              style={styles.dropdownItem}
                              onPress={() => {
                                setCategoryId(category.category_id)
                                setShowCategoryDropdown(false)
                              }}
                            >
                              <Text>{category.category_name}</Text>
                            </TouchableOpacity>
                          )) : (
                            <Text style={{ padding: 10 }}>ยังไม่มีหมวดหมู่</Text>
                          )}
                        </ScrollView>
                      )}
                    </View>
                  </View>

                  <View style={styles.option}>
                    <TouchableOpacity
                      style={styles.fix}
                      onPress={() => {
                        setEditMenu(null)
                        setShowCategoryDropdown(false)
                        setTabfood("listfood")
                      }}
                    >
                      <Text style={{ color: colors.text }}>ยกเลิก</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.fix1} onPress={saveEdit}>
                      <Text style={{ color: colors.text }}>เสร็จสิ้น</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        ) : tabfood === "addfood" ? (
          <ScrollView contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }} style={{ backgroundColor: "rgba(232, 227, 227, 0.5)" }}>
            <View style={styles.contentaddfood}>
              <TouchableOpacity onPress={() => pickImage(setAddImage)}>
                <View style={styles.cardaddfood}>
                  <Image
                    source={addImage ? { uri: addImage } : require("../photo/plus.webp")}
                    style={styles.picaddfood}
                  />
                  <Text style={{ color: colors.red, marginTop: 5 }}>[ กดเพื่อเลือกรูปภาพ ]</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.dataaddfood}>
                <View style={styles.bottomaddfood}>
                  <View style={styles.namedata}>
                    <Text>Name : </Text>
                    <TextInput style={styles.namefood} value={addName} onChangeText={setAddName} />
                  </View>

                  <View style={styles.namedata}>
                    <Text>Price : </Text>
                    <TextInput style={styles.datafood} value={addPrice} onChangeText={setAddPrice} keyboardType="numeric" />
                  </View>

                  <View style={[styles.namedata, { position: "relative", zIndex: 10 }]}>
                    <Text>Category : </Text>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                      <TouchableOpacity
                        onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        style={{ backgroundColor: colors.red, borderRadius: 15, padding: 5, width: 110 }}
                      >
                        <Text style={{ color: colors.text, textAlign: "center" }}>
                          {addCategoryId
                            ? categories.find(c => c.category_id === addCategoryId)?.category_name
                            : "เลือกหมวดหมู่"}
                        </Text>
                      </TouchableOpacity>

                      {showCategoryDropdown && (
                        <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                          {categories.length ? categories.map(category => (
                            <TouchableOpacity
                              key={category.category_id}
                              style={styles.dropdownItem}
                              onPress={() => {
                                setAddCategoryId(category.category_id)
                                setShowCategoryDropdown(false)
                              }}
                            >
                              <Text>{category.category_name}</Text>
                            </TouchableOpacity>
                          )) : (
                            <Text style={{ padding: 10 }}>ยังไม่มีหมวดหมู่</Text>
                          )}
                        </ScrollView>
                      )}
                    </View>
                  </View>

                  <View style={styles.option}>
                    <TouchableOpacity style={styles.fix} onPress={() => setTabfood("listfood")}>
                      <Text style={{ color: colors.text }}>ยกเลิก</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.fix1} onPress={saveAddMenu}>
                      <Text style={{ color: colors.text }}>เสร็จสิ้น</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={{ backgroundColor: "rgba(255, 255, 255,0.25)" }}>
            <View style={styles.topcate}>
              <View style={styles.frametitle}>
                <Text style={styles.titlecate}>ชื่อหมวดหมู่อาหาร</Text>
              </View>
            </View>

            <View style={styles.viewcate}>
              <TextInput
                placeholder="ชื่อหมวดหมู่อาหาร"
                style={styles.framenamecate}
                value={categoryName}
                onChangeText={setCategoryName}
              />
            </View>

            <View style={styles.optioncate}>
              <TouchableOpacity style={styles.fix} onPress={() => setTabfood("listfood")}>
                <Text style={{ color: colors.text }}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.fix1} onPress={AddCategory}>
                <Text style={{ color: colors.text }}>เสร็จสิ้น</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomcate} />
          </View>
        )}
      </View>

      <View style={styles.bottombar}>
        {["TableMap", "Order", "Menu", "Account"].map(page => (
          <TouchableOpacity key={page} style={styles.page} onPress={() => changepage(page)}>
            <Text style={styles.titlepage}>{page === "TableMap" ? "Table" : page}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingTop: 20 },
  picback: { width: 50, height: 50, borderRadius: 25, position: "absolute", left: 0 },
  top: { alignItems: "center" },
  title: { fontSize: 50, fontWeight: "bold", color: colors.red },
  bottombar: { flexDirection: "row", justifyContent: "space-around", position: "absolute", bottom: 0, left: 0, right: 0 },
  page: { borderColor: colors.text, borderTopWidth: 2, borderWidth: 1, flex: 1, height: 70, alignItems: "center", justifyContent: "center", backgroundColor: colors.red },
  titlepage: { color: colors.text, fontSize: 20, fontWeight: "bold" },
  column: { flexDirection: "row", backgroundColor: colors.text, marginTop: 15, justifyContent: "space-between" },
  category: { borderColor: colors.red, borderWidth: 2, backgroundColor: colors.text, flex: 1, padding: 10 },
  categoryname: { textAlign: "center", fontSize: 18 },
  contentfood: { flex: 1 },
  listfood: { flexDirection: "column" },
  card: { backgroundColor: colors.text, padding: 5, flexDirection: "row", borderBottomWidth: 1, borderColor: "rgba(232, 227, 227, 1)" },
  picfood: { width: 180, height: 200 },
  data: { padding: 10 },
  fix: { padding: 5, backgroundColor: colors.red, marginRight: 10, borderRadius: 5 },
  option: { marginTop: 15, flexDirection: "row" },
  fix1: { padding: 5, backgroundColor: "rgb(14, 84, 236)", marginRight: 10, borderRadius: 5, alignItems: "center" },
  edit: { padding: 5, backgroundColor: "rgb(14, 84, 236)", marginRight: 10, borderRadius: 5, alignItems: "center", marginTop: 10, width: 50 },
  table: { flex: 1 },
  namefood: { borderColor: "rgba(172, 169, 169, 0.9)", fontWeight: "bold", fontSize: 19, borderWidth: 1, height: 25, padding: 0, width: 150, marginBottom: 5, paddingLeft: 5, borderRadius: 15 },
  datafood: { borderColor: "rgba(172, 169, 169, 0.9)", fontSize: 15, borderWidth: 1, height: 25, padding: 0, width: 150, marginBottom: 5, borderRadius: 15, paddingLeft: 5 },
  butaddfood: { backgroundColor: colors.text, padding: 5, borderRadius: 20, marginBottom: 5, marginTop: 5, alignItems: "center", boxShadow: "0 0 6px rgba(0, 0, 0, 0.5)" },
  cardaddfood: { borderBottomWidth: 1, borderColor: "rgba(232, 227, 227, 1)", flexDirection: "column", width: "100%", alignItems: "center", marginTop: 10 },
  contentaddfood: { backgroundColor: "rgba(232, 227, 227, 0.5)", flex: 1, alignItems: "center" },
  picaddfood: { width: 200, height: 200, borderColor: colors.text, borderWidth: 2 },
  dataaddfood: { backgroundColor: colors.text, flex: 1, marginTop: 10, width: "100%" },
  bottomaddfood: { padding: 20, boxShadow: "0 0 7px rgba(0,0,0,0.5)" },
  butt: { flexDirection: "row", justifyContent: "space-between" },
  addpic: { width: 200, height: 200, borderColor: colors.red, borderWidth: 4, alignItems: "center", justifyContent: "center", backgroundColor: colors.text },
  topcate: { alignItems: "center", marginTop: 10 },
  titlecate: { fontSize: 25, fontWeight: "bold", color: colors.red },
  frametitle: { backgroundColor: colors.text, paddingLeft: 10, paddingRight: 10, borderRadius: 25, boxShadow: "0 0 5px rgba(0,0,0,0.5)", padding: 5 },
  framenamecate: { backgroundColor: colors.text, paddingLeft: 10, paddingRight: 10, borderRadius: 25, boxShadow: "0 0 5px rgba(0,0,0,0.5)", padding: 5, fontSize: 18 },
  viewcate: { padding: 20 },
  optioncate: { flexDirection: "row", justifyContent: "flex-end", padding: 10, alignItems: "center" },
  bottomcate: { width: "100%", height: "100%", backgroundColor: "rgba(253, 47, 129, 0.26)" },
  noData: { justifyContent: "center", height: "90%", alignItems: "center" },
  noDataText: { color: colors.red, fontSize: 20, fontWeight: "bold", backgroundColor: "rgba(253, 253, 253, 0.7)", borderRadius: 15, paddingLeft: 80, paddingRight: 80, paddingTop: 20, paddingBottom: 20 },
  categoryItem: { flexDirection: "row", alignItems: "center", marginRight: 5 },
  categoryButton: { padding: 8, borderWidth: 1, height: "100%" },
  deleteCategory: { padding: 5, marginLeft: 0, backgroundColor: colors.red, borderRadius: 0, borderWidth: 1, alignItems: "center", justifyContent: "center", height: 50 },
  deleteCategoryText: { color: colors.dim, fontSize: 16, fontWeight: "bold" },
  dropdownList: { position: "absolute", bottom: 35, left: 0, backgroundColor: colors.text, borderWidth: 1, borderColor: "rgba(172, 169, 169, 0.9)", borderRadius: 10, width: 110, maxHeight: 120, zIndex: 100 },
  dropdownItem: { padding: 8, borderBottomWidth: 1, borderBottomColor: "rgba(232, 227, 227, 1)" }
})

export default Menu