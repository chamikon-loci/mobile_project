import { View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground, ScrollView, TextInput } from "react-native"
import { colors } from "../src/style/theme"
import { useState, useEffect } from "react"
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite"
import * as ImagePicker from 'expo-image-picker' 
import { DATABASE_NAME, getAllMenu, saveMenu, addMenu, openDATABASE, getAllCategories, addCategory, deleteCategory, deleteMenu } from "../database/db"

function Menu({ changepage }) {
  return (
    <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
      <MenuScreen changepage={changepage} />
    </SQLiteProvider>
  )
}

function MenuScreen({ changepage }) {
  const [open, setopen] = useState('เปิดการขาย')
  const [tabfood, settabfood] = useState('listfood')
  const db = useSQLiteContext()
  const [menu, setMenu] = useState([])
  const [categories, setCategories] = useState([])

  async function loadMenu() {
    try {
      const data = await getAllMenu(db)
      setMenu(data)
    } catch (error) {
      console.log('ไม่สามารถโหลดข้อมูลเมนูได้')
    }
  }

  async function loadCategories() {
    try {
      const data = await getAllCategories(db)
      setCategories(data)
    } catch (error) {
      console.log('โหลดหมวดหมู่ไม่สำเร็จ')
    }
  }

  useEffect(() => {
    loadMenu()
    loadCategories()
  }, [])

  const [editMenu, setEditMenu] = useState(null)
  const [menuName, setMenuName] = useState('')
  const [menuPrice, setMenuPrice] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [editImage, setEditImage] = useState(null) // <-- เพิ่ม State รูปภาพตอนแก้ไข

  // ฟังก์ชันเลือกรูปภาพ
  async function pickImage(setImageCallback) {
    let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'], 
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
});

    if (!result.canceled) {
      setImageCallback(result.assets[0].uri)
    }
  }

  async function AddCategory() {
    if (!categoryName.trim()) {
      return
    }
    try {
      await addCategory(db, categoryName.trim())
      await loadCategories()
      setCategoryName('')
      settabfood('listfood')
    } catch (error) {
      console.log('เพิ่มหมวดหมู่ไม่สำเร็จ')
    }
  }

  async function saveEdit() {
    if (!editMenu) return
    if (!menuName.trim() || !menuPrice.trim()) {
      return
    }
    try {
      await saveMenu(db, editMenu.menu_id, menuName.trim(), Number(menuPrice), editMenu.category_id, editImage)
      await loadMenu()
      setEditMenu(null)
      setMenuName('')
      setMenuPrice('')
      setEditImage(null)
      settabfood('listfood')
    } catch (error) {
      console.log('แก้ไขเมนูไม่สำเร็จ')
    }
  }

  const [addName, setAddName] = useState('')
  const [addPrice, setAddPrice] = useState('')
  const [addCategoryId, setAddCategoryId] = useState(null)
  const [addImage, setAddImage] = useState(null) // <-- เพิ่ม State รูปภาพตอนเพิ่มเมนูใหม่

  async function saveAddMenu() {
    if (!addName.trim() || !addPrice.trim() || !addCategoryId) {
      console.log('เติมข้อมูลไม่ครบ')
      return
    }
    try {
      await addMenu(db, addName.trim(), Number(addPrice), addCategoryId, addImage)
      await loadMenu()
      setAddName('')
      setAddPrice('')
      setAddCategoryId(null)
      setAddImage(null)
      setShowCategoryDropdown(false)
      settabfood('listfood')
    } catch (error) {
      console.log('เพิ่มเมนูไม่สำเร็จ')
    }
  }

  async function DeleteMenu(menuId) {
    try {
      await deleteMenu(db, menuId)
      await loadMenu()
    } catch (error) {
      console.log('ลบเมนูไม่สำเร็จ')
    }
  }

  async function DeleteCategory(categoryId) {
    try {
      await deleteCategory(db, categoryId)
      await loadCategories()
    } catch (error) {
      console.log('ลบหมวดหมู่ไม่สำเร็จ')
    }
  }

  return (
    <ImageBackground source={require('../photo/order.jpg')} style={styles.content}>
      <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => { changepage('Login') }}>
        <Image source={require('../photo/back.png')} style={styles.picback} />
      </TouchableOpacity>

      <View style={styles.top}>
        <View style={{ paddingLeft: 20, paddingRight: 20, borderRadius: 50 }}>
          <Text style={styles.title}>Menu</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.column}>
          <ScrollView horizontal>
            <TouchableOpacity style={styles.category} onPress={() => settabfood('addcategory')}>
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

        {tabfood === 'listfood' ? (
          <ScrollView contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }}>
            <View style={styles.contentfood}>
              <View style={styles.addfood}>
                <TouchableOpacity
                  style={styles.butaddfood}
                  onPress={() => {
                    setAddName('')
                    setAddPrice('')
                    setAddCategoryId(null)
                    setAddImage(null)
                    settabfood('addfood')
                  }}
                >
                  <Text style={{ fontSize: 20 }}>เพิ่มเมนูอาหาร</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.listfood}>
                {menu.length > 0 ? (
                  menu.map(item => (
                    <View style={styles.card} key={item.menu_id}>
                      {/* แสดงรูปภาพจาก Database ถ้ามี หรือใช้รูปเริ่มต้น */}
                      <Image 
                        source={item.image ? { uri: item.image } : require('../photo/OIP.webp')} 
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
                          <Text style={styles.datafood}>{item.category_name || '-'}</Text>
                        </View>

                        <Text>สถานะ : {open}</Text>

                        <View style={styles.option}>
                          <TouchableOpacity
                            style={styles.fix}
                            onPress={() => {
                              setopen(open === 'เปิดการขาย' ? 'ปิดการขาย' : 'เปิดการขาย')
                            }}
                          >
                            <Text style={{ color: colors.text }}>
                              {open === 'เปิดการขาย' ? 'ปิดการขาย' : 'เปิดการขาย'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.fix}
                            onPress={() => DeleteMenu(item.menu_id)}
                          >
                            <Text style={{ color: colors.text }}>Delete</Text>
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          style={styles.edit}
                          onPress={() => {
                            setEditMenu(item)
                            setMenuName(item.menu_name)
                            setMenuPrice(String(item.unit_price))
                            setCategoryId(item.category_id)
                            setEditImage(item.image || null)
                            settabfood('editfood')
                          }}
                        >
                          <Text style={{ color: colors.text }}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.noData}>
                    <Text style={styles.noDataText}>ไม่มีเมนู</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        ) : tabfood === 'editfood' ? (
          <View style={styles.contentaddfood}>
            {/* กดที่รูปเพื่อเปลี่ยนภาพตอนแก้ไข */}
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
                  <Text style={styles.datafood}>{editMenu?.category_name || '-'}</Text>
                </View>

                <View style={styles.option}>
                  <TouchableOpacity
                    style={styles.fix}
                    onPress={() => {
                      setEditMenu(null)
                      settabfood('listfood')
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
        ) : tabfood === 'addfood' ? (
          <View style={styles.contentaddfood}>
            {/* กดที่รูปเพื่อเลือกภาพตอนเพิ่มเมนู */}
            <TouchableOpacity onPress={() => pickImage(setAddImage)}>
              <View style={styles.cardaddfood}>
                <Image 
                  source={addImage ? { uri: addImage } : require('../photo/plus.webp')} 
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

                <View style={styles.namedata}>
                  <Text>Category : </Text>

                  <View style={{ flexDirection: "row", justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      style={{
                        backgroundColor: colors.red,
                        borderRadius: 15,
                        padding: 5,
                        width: 95
                      }}
                    >
                      <Text style={{ color: colors.text, textAlign: 'center' }}>
                        {addCategoryId
                          ? categories.find(category => category.category_id === addCategoryId)?.category_name
                          : 'เลือกหมวดหมู่'}
                      </Text>
                    </TouchableOpacity>

                    {showCategoryDropdown && (
                      <View style={styles.dropdownList}>
                        {categories.length > 0 ? (
                          categories.map(category => (
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
                          ))
                        ) : (
                          <Text style={{ padding: 10 }}>
                            ยังไม่มีหมวดหมู่
                          </Text>
                        )}
                      </View>
                    )}

                    <View style={styles.option}>
                      <TouchableOpacity
                        style={styles.fix}
                        onPress={() => settabfood('listfood')}
                      >
                        <Text style={{ color: colors.text }}>ยกเลิก</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.fix1}
                        onPress={() => saveAddMenu()}
                      >
                        <Text style={{ color: colors.text }}>เสร็จสิ้น</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ backgroundColor: 'rgba(255, 255, 255,0.25)' }}>
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
              <TouchableOpacity
                style={styles.fix}
                onPress={() => { settabfood('listfood') }}
              >
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
        <TouchableOpacity style={styles.page} onPress={() => { changepage('TableMap') }}>
          <Text style={styles.titlepage}>Table</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.page} onPress={() => { changepage('Order') }}>
          <Text style={styles.titlepage}>Order</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.page} onPress={() => { changepage('Menu') }}>
          <Text style={styles.titlepage}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.page} onPress={() => { changepage('Account') }}>
          <Text style={styles.titlepage}>Account</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 20
  },
  picback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    left: 0
  },
  top: {
    alignItems: 'center'
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: colors.red
  },
  bottombar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  page: {
    borderColor: colors.text,
    borderTopWidth: 2,
    borderWidth: 1,
    flex: 1,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.red
  },
  titlepage: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold'
  },
  column: {
    flexDirection: 'row',
    backgroundColor: colors.text,
    marginTop: 15,
    justifyContent: 'space-between'
  },
  category: {
    borderColor: colors.red,
    borderWidth: 2,
    backgroundColor: colors.text,
    flex: 1,
    padding: 10
  },
  categoryname: {
    textAlign: 'center',
    fontSize: 18
  },
  contentfood: {
    flex: 1
  },
  listfood: {
    flexDirection: 'column'
  },
  card: {
    backgroundColor: colors.text,
    padding: 5,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: 'rgba(232, 227, 227, 1)'
  },
  picfood: {
    width: 180,
    height: 200
  },
  data: {
    padding: 10
  },
  fix: {
    padding: 5,
    backgroundColor: colors.red,
    marginRight: 10,
    borderRadius: 5
  },
  option: {
    marginTop: 15,
    flexDirection: 'row'
  },
  fix1: {
    padding: 5,
    backgroundColor: 'rgb(14, 84, 236)',
    marginRight: 10,
    borderRadius: 5,
    alignItems: 'center'
  },
  edit: {
    padding: 5,
    backgroundColor: 'rgb(14, 84, 236)',
    marginRight: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    width: 50
  },
  table: {
    flex: 1
  },
  namefood: {
    borderColor: 'rgba(172, 169, 169, 0.9)',
    fontWeight: 'bold',
    fontSize: 19,
    borderWidth: 1,
    height: 25,
    padding: 0,
    width: 150,
    marginBottom: 5,
    paddingLeft: 5,
    borderRadius: 15
  },
  datafood: {
    borderColor: 'rgba(172, 169, 169, 0.9)',
    fontSize: 15,
    borderWidth: 1,
    height: 25,
    padding: 0,
    width: 150,
    marginBottom: 5,
    borderRadius: 15,
    paddingLeft: 5
  },
  butaddfood: {
    backgroundColor: colors.text,
    padding: 5,
    borderRadius: 20,
    marginBottom: 5,
    marginTop: 5,
    alignItems: 'center',
    boxShadow: '0 0 6px rgba(0, 0, 0, 0.5)'
  },
  cardaddfood: {
    borderBottomWidth: 1,
    borderColor: 'rgba(232, 227, 227, 1)',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    marginTop: 10
  },
  contentaddfood: {
    backgroundColor: 'rgba(232, 227, 227, 0.5)',
    flex: 1,
    alignItems: 'center'
  },
  picaddfood: {
    width: 200,
    height: 200,
    borderColor: colors.text,
    borderWidth: 2
  },
  dataaddfood: {
    backgroundColor: colors.text,
    flex: 1,
    marginTop: 10,
    width: '100%'
  },
  bottomaddfood: {
    padding: 20,
    boxShadow: '0 0 7px rgba(0,0,0,0.5)'
  },
  butt: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  addpic: {
    width: 200,
    height: 200,
    borderColor: colors.red,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text
  },
  topcate: {
    alignItems: 'center',
    marginTop: 10
  },
  titlecate: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.red
  },
  frametitle: {
    backgroundColor: colors.text,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 25,
    boxShadow: '0 0 5px rgba(0,0,0,0.5)',
    padding: 5
  },
  framenamecate: {
    backgroundColor: colors.text,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 25,
    boxShadow: '0 0 5px rgba(0,0,0,0.5)',
    padding: 5,
    fontSize: 18
  },
  viewcate: {
    padding: 20
  },
  optioncate: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    alignItems: 'center'
  },
  bottomcate: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(253, 47, 129, 0.26)'
  },
  noData: {
    justifyContent: 'center',
    height: '90%',
    alignItems: 'center'
  },
  noDataText: {
    color: colors.red,
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: 'rgba(253, 253, 253, 0.7)',
    borderRadius: 15,
    paddingLeft: 80,
    paddingRight: 80,
    paddingTop: 20,
    paddingBottom: 20
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5
  },
  categoryButton: {
    padding: 8,
    borderWidth: 1,
    height: '100%'
  },
  deleteCategory: {
    padding: 5,
    marginLeft: 0,
    backgroundColor: colors.red,
    borderRadius: 0,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50
  },
  deleteCategoryText: {
    color: colors.dim,
    fontSize: 16,
    fontWeight: 'bold'
  }
})



export default Menu