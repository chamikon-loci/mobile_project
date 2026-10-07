import { View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground, ScrollView, TextInput } from "react-native"
import { colors } from "../src/style/theme"
import { useState, useEffect } from "react"
import { DATABASE_NAME, getMenu, openDATABASE, getAllCategories } from "../database/db"
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
  const [menu, setMenu] = useState([]);
  const [numfood,setnumfood] = useState(1)
  const db = useSQLiteContext()


  function numbuyfood(check){
      if(check)
      {
        setnumfood(numfood+1)
      }else{
        if(numfood>1){
          setnumfood(numfood-1)
        }
      }
  }
  async function loadMenu(categoryid) {
    try {
      const data = await getMenu(db, categoryid)
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
              onPress={() => { AllMenu() }}
            >
              <Text>อาหารทั้งหมด</Text>
            </TouchableOpacity>
          </View>

          {categories.map(category => (
            <View key={category.category_id} style={styles.categoryItem}>
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => { loadMenu(category.category_id) }}
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

        <TouchableOpacity style={styles.butsearch}>
          <Text style={{color:colors.text}}>ค้นหา</Text>
        </TouchableOpacity>
      </View>



      <View style={styles.listfood}>
        {menu.length > 0 ? (menu.map(item => (
          <View style={styles.card} key={item.menu_id}>
            <Image source={require('../photo/OIP.webp')} style={styles.picfood}></Image>
            <View style={styles.data}>

              <View style={styles.namedata}><Text>Name : </Text>
                <TextInput style={styles.namefood} editable={false}>{item.menu_name}</TextInput>
              </View>


              <View style={styles.namedata}><Text>Price : </Text>
                <TextInput style={styles.datafood} editable={false}>{item.unit_price}</TextInput>
              </View>

              <View style={styles.namedata}><Text>Promotion : </Text>
                <TextInput style={styles.datafood} editable={false}>none</TextInput>
              </View>

              <View style={styles.option}>

                <View style={styles.namedata}><Text>จำนวน : </Text>
                  <View style={styles.num}>
                     <TouchableOpacity style={styles.minusnum} 
                     onPress={()=>{{numbuyfood(false)}}}><Text style={{ color: colors.text }}>-</Text></TouchableOpacity>
                    <TextInput style={styles.numfood} editable={false}>{numfood}</TextInput>
                    <TouchableOpacity style={styles.addnum} onPress={()=>{{numbuyfood(true)}}}> 
                      <Text style={{ color: colors.text }}>+</Text>
                      </TouchableOpacity>
                   
                  </View>
                </View>
                <TouchableOpacity style={styles.addcart} >
                  <Text style={{ color: colors.text }}>เพิ่มอาหารเข้าตะกร้า</Text>
                </TouchableOpacity>

              </View>

            </View>
          </View>
        ))) : (
          <View style={styles.noData}>
            <Text style={styles.noDataText}>ไม่มีเมนู</Text>
          </View>
        )}
      </View>





      <View style={styles.bottombar}>

        <TouchableOpacity style={styles.page} onPress={() => { changepage('MenuClient') }}><Text style={styles.titlepage}>เมนูอาหาร</Text></TouchableOpacity>
        <TouchableOpacity style={styles.page} onPress={() => { changepage('MenuClient') }}><Text style={styles.titlepage}>ตะกร้าอาหาร</Text></TouchableOpacity>
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
    padding: 12
  },
  search: {
    padding: 5,
    flexDirection:'row'
  },
  listfood: {

    flexDirection: 'column'
  },
  card: {
    backgroundColor: colors.text,
    padding: 5,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: 'rgba(232, 227, 227, 1)',
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
    borderRadius: 15,
  },
  noData: {


    justifyContent: 'center',
    height: '70%',
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
  card: {
    backgroundColor: colors.text,
    padding: 5,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: 'rgba(232, 227, 227, 1)',
  },
  picfood: {
    width: 180,
    height: 200
  },
  data: {
    padding: 10,

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
    paddingLeft: 5,
    paddingRight:5
  },
  bottombar: {

    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0
  },
  page: {
    borderColor: colors.text,
    borderTopWidth: 2,
    borderWidth: 1,
    flex: 4,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.red,


  },
  titlepage: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',

  },
  option: {
    marginTop: 15,

  },
  addcart: {
    padding: 5,
    backgroundColor: colors.red,
    marginRight: 10,
    borderRadius: 5,
  },
  num:{
    flexDirection:'row'
  },
 numfood: {
    borderColor: 'rgba(172, 169, 169, 0.9)',
    fontSize: 15,
    borderWidth: 1,
    height: 25,
    padding: 0,
    marginBottom: 5,
    borderRadius: 15,
    paddingLeft: 5,
    paddingRight:5
  },
  addnum:{
    backgroundColor:colors.red,
    paddingTop:1,
    paddingBottom:1,
    marginLeft:10,
    paddingLeft:8,
    paddingRight:8,
    borderRadius:20,
    justifyContent:'center',
    marginBottom:5
  },
  minusnum:{
    backgroundColor:colors.red,
    paddingTop:1,
    paddingBottom:1,
    marginRight:10,
    paddingLeft:11,
    paddingRight:11,
    borderRadius:20,
    justifyContent:'center',
    marginBottom:5
  }

})
export default MenuClient