import { View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground, ScrollView, TextInput } from "react-native"
import { colors } from "../src/style/theme"
import { useState, useEffect } from "react"


function MenuClient({ changepage }) {
  const [categories, setCategories] = useState([]);


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
            </View>
          ))}
        </ScrollView>
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
})
export default MenuClient