import { View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground, ScrollView, TextInput } from "react-native"
import { colors } from "../src/style/theme"
import { useState, useEffect } from "react"
import { DATABASE_NAME, getAllMenu, openDATABASE, getAllCategories } from "../database/db"
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite"

function MenuClient({ changepage }) {
  return (
    <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
      <MenuClientScreen changepage={changepage} />
    </SQLiteProvider>
  )
}

function MenuClientScreen({ changepage }) {
  const [categories, setCategories] = useState([]);
  const db = useSQLiteContext()

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

    loadCategories()
  }, [])

  return (

    <ImageBackground source={require('../photo/MenuClient.jpg')} style={styles.content}>

      <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => { changepage('Login') }}>
        <Image source={require('../photo/back.png')} style={styles.picback} ></Image>
      </TouchableOpacity>
      <View style={styles.top}>
        <View style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)', paddingLeft: 20, paddingRight: 20, borderRadius: 50 }}>
          <Text style={styles.title}>Menu</Text>
        </View>
      </View>


      <View style={styles.column}>
        <ScrollView horizontal>


          <View style={styles.categoryItem}>
            <TouchableOpacity
              style={styles.categoryButton}

            >
              <Text>อาหารทั้งหมด</Text>
            </TouchableOpacity>
          </View>

          {categories.map(category => (
            <View key={category.category_id} style={styles.categoryItem}>
              <TouchableOpacity
                style={styles.categoryButton}

              >
                <Text>{category.category_name}</Text>
              </TouchableOpacity>
            </View>
          ))}

        </ScrollView>
      </View>
           <View style={styles.search}>
            <TextInput style={styles.searchfood} placeholder="ค้นหาชื่ออาหาร">
            </TextInput>
          </View>

    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 20,


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
  column: {
    flexDirection: 'row',
    backgroundColor: colors.text,

    marginTop: 15,
    justifyContent: 'space-between',

  },
  categoryItem: {
    borderColor: colors.red,
    borderWidth: 2,
    backgroundColor: colors.text,
    flex: 1,
    padding: 10,


  },
  categoryname: {
    textAlign: 'center',
    fontSize: 18
  },

  categoryButton: {

  },
   searchfood: {
    backgroundColor: colors.text,
    padding: 5,
    borderRadius: 25,
    marginBottom: 5,
    marginTop: 5,
    alignItems: 'center',
    boxShadow: '0 0 6px rgba(0, 0, 0, 0.5)',
    padding:12
  },
  search:{
    padding:5
  }

})
export default MenuClient