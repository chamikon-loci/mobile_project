import { View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground, ScrollView, TextInput } from "react-native"
import { colors } from "../src/style/theme"
import { useState } from "react"


function Menu({ changepage }) {

  const [tabfood, settabfood] = useState('listfood');
  return (

    <ImageBackground source={require('../photo/order.jpg')} style={styles.content}>
      <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => { changepage('Login') }}>
        <Image source={require('../photo/back.png')} style={styles.picback} ></Image>
      </TouchableOpacity>
      <View style={styles.top}>
        <View style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)', paddingLeft: 20, paddingRight: 20, borderRadius: 50 }}>
          <Text style={styles.title}>Menu</Text>
        </View>
      </View>
      <View style={styles.table}>

        <View style={styles.column}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.category}><Text style={styles.categoryname} onPress={()=>{settabfood('addcategory')}}>+ หมวดหมู่อาหาร</Text></TouchableOpacity>
            <TouchableOpacity style={styles.category} onPress={() => { settabfood('listfood') }}><Text style={styles.categoryname}>Appetizer</Text></TouchableOpacity>
            <TouchableOpacity style={styles.category}><Text style={styles.categoryname} onPress={() => { settabfood('listfood') }}>Maincourse</Text></TouchableOpacity>
            <TouchableOpacity style={styles.category}><Text style={styles.categoryname} onPress={() => { settabfood('listfood') }}>Dessert</Text></TouchableOpacity>
            <TouchableOpacity style={styles.category}><Text style={styles.categoryname} onPress={() => { settabfood('listfood') }}>Drinks</Text></TouchableOpacity>
          </ScrollView>
        </View>

        {tabfood === 'listfood' ? (
          <ScrollView>
            <View style={styles.contentfood}>

              <View style={styles.addfood}>
                <TouchableOpacity style={styles.butaddfood}>
                  <Text style={{ fontSize: 20 }} onPress={() => {
                    settabfood('addfood')
                  }}>เพิ่มเมนูอาหาร</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.listfood}>
                <View style={styles.card}>
                  <Image source={require('../photo/OIP.webp')} style={styles.picfood}></Image>
                  <View style={styles.data}>

                    <View style={styles.namedata}><Text>Name : </Text>
                      <TextInput style={styles.namefood}>Cake</TextInput>
                    </View>


                    <View style={styles.namedata}><Text>Price : </Text>
                      <TextInput style={styles.datafood}>100</TextInput>
                    </View>


                    <View style={styles.namedata}><Text>Promotion : </Text>
                      <TextInput style={styles.datafood}>none</TextInput>
                    </View>

                    <View style={styles.option}>
                      <TouchableOpacity style={styles.fix}>
                        <Text style={{ color: colors.text }}>Delete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.fix1}>
                        <Text style={{ color: colors.text }}onPress={()=>{settabfood('editfood')}}>Edit</Text>
                      </TouchableOpacity>

                    </View>

                  </View>
                </View>




                <View style={styles.card}>
                  <Image source={require('../photo/OIP.webp')} style={styles.picfood}></Image>
                  <View style={styles.data}>

                    <View style={styles.namedata}><Text>Name : </Text>
                      <TextInput style={styles.namefood}>Cake</TextInput>
                    </View>


                    <View style={styles.namedata}><Text>Price : </Text>
                      <TextInput style={styles.datafood}>100</TextInput>
                    </View>


                    <View style={styles.namedata}><Text>Promotion : </Text>
                      <TextInput style={styles.datafood}>none</TextInput>
                    </View>

                    <View style={styles.option}>
                      <TouchableOpacity style={styles.fix}>
                        <Text style={{ color: colors.text }}>Delete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.fix1}>
                        <Text style={{ color: colors.text }}onPress={()=>{settabfood('editfood')}}>Edit</Text>
                      </TouchableOpacity>

                    </View>

                  </View>
                </View>




                <View style={styles.card}>
                  <Image source={require('../photo/OIP.webp')} style={styles.picfood}></Image>
                  <View style={styles.data}>

                    <View style={styles.namedata}><Text>Name : </Text>
                      <TextInput style={styles.namefood}>Cake</TextInput>
                    </View>


                    <View style={styles.namedata}><Text>Price : </Text>
                      <TextInput style={styles.datafood}>100</TextInput>
                    </View>


                    <View style={styles.namedata}><Text>Promotion : </Text>
                      <TextInput style={styles.datafood}>none</TextInput>
                    </View>

                    <View style={styles.option}>
                      <TouchableOpacity style={styles.fix}>
                        <Text style={{ color: colors.text }}>Delete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.fix1}>
                        <Text style={{ color: colors.text }}onPress={()=>{settabfood('editfood')}}>Edit</Text>
                      </TouchableOpacity>

                    </View>

                  </View>
                </View>




              </View>


            </View>
          </ScrollView>) :tabfood==='editfood' ?
          (
          <View style={styles.contentaddfood}>
            <View style={styles.cardaddfood}>
              <Image source={require('../photo/OIP.webp')} style={styles.picaddfood}></Image>
            </View>
            <View style={styles.dataaddfood}>
            <View style={styles.bottomaddfood}>
              <View style={styles.namedata}><Text>Name : </Text>
                <TextInput style={styles.namefood}>Cake</TextInput>
              </View>


              <View style={styles.namedata}><Text>Price : </Text>
                <TextInput style={styles.datafood}>100</TextInput>
              </View>

            <View style={styles.butt}>
              <View style={styles.namedata}><Text>Promotion : </Text>
                <TextInput style={styles.datafood}>none</TextInput>
              </View>


              <View style={styles.option}>
                <TouchableOpacity style={styles.fix} onPress={()=>{settabfood('listfood')}}>
                  <Text style={{ color: colors.text }} >ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.fix1} onPress={()=>{settabfood('listfood')}}>
                  <Text style={{ color: colors.text }}>เสร็จสิ้น</Text>
                </TouchableOpacity>

              </View>
            </View>
            </View>
            </View>


          </View>): tabfood==='addfood'?
          (
            <View style={styles.contentaddfood}>
            <View style={styles.cardaddfood}>
              <TouchableOpacity style={styles.addpic}><Text style={{fontSize:70,color:colors.red}}>+</Text></TouchableOpacity>
            </View>
            
            <View style={styles.dataaddfood}>
            <View style={styles.bottomaddfood}>
              <View style={styles.namedata}><Text>Name : </Text>
                <TextInput style={styles.namefood}></TextInput>
              </View>


              <View style={styles.namedata}><Text>Price : </Text>
                <TextInput style={styles.datafood}></TextInput>
              </View>

            <View style={styles.butt}>
              <View style={styles.namedata}><Text>Promotion : </Text>
                <TextInput style={styles.datafood}></TextInput>
              </View>


              <View style={styles.option}>
                <TouchableOpacity style={styles.fix} onPress={()=>{settabfood('listfood')}}>
                  <Text style={{ color: colors.text }} >ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.fix1} onPress={()=>{settabfood('listfood')}}>
                  <Text style={{ color: colors.text }}>เสร็จสิ้น</Text>
                </TouchableOpacity>

              </View>
            </View>
            </View>
            </View>


          </View>
          ):(
            <View style={styles.contentfood}>
              <View style={styles.topcate}>
                <View style={styles.frametitle}>
                <Text style={styles.titlecate}>ชื่อหมวดหมู่อาหาร</Text>
                </View>
              </View>
              <View style={styles.viewcate}>
              <TextInput placeholder="ชื่อหมวดหมู่อาหาร" style={styles.framenamecate}></TextInput>
              </View>
            </View>
          )
        

      }

      </View>

      <View style={styles.bottombar}>
        <TouchableOpacity style={styles.page} onPress={() => { changepage('TableMap') }}><Text style={styles.titlepage}>Table</Text></TouchableOpacity>
        <TouchableOpacity style={styles.page}><Text style={styles.titlepage} onPress={() => { changepage('Order') }}>Order</Text></TouchableOpacity>
        <TouchableOpacity style={styles.page} onPress={() => { changepage('Menu') }}><Text style={styles.titlepage}>Menu</Text></TouchableOpacity>
        <TouchableOpacity style={styles.page} onPress={() => { changepage('Account') }}><Text style={styles.titlepage}>Account</Text></TouchableOpacity>
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
  column: {
    flexDirection: 'row',
    backgroundColor: colors.text,

    marginTop: 15,
    justifyContent: 'space-between',

  },
  category: {
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
  contentfood: {
    backgroundColor: 'rgba(232, 227, 227, 0.5)',
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
    borderColor: 'rgba(232, 227, 227, 1)',
  },
  picfood: {
    width: 180,
    height: 200
  },
  data: {
    padding: 10,

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
    borderRadius: 5
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
    borderRadius: 15,
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
    boxShadow: '0 0 6px rgba(0, 0, 0, 0.5)',
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
    alignItems: 'center',
    

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
    width: '100%',


  },
  bottomaddfood:{
    padding:20,
    boxShadow: '0 0 7px rgba(0,0,0,0.5)'
  },
  butt:{
    flexDirection:'row',
    justifyContent:'space-between'
  },
  addpic:{
    width: 200,
    height: 200,
    borderColor: colors.red,
    borderWidth: 4,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:colors.text
  },
  topcate:{
    alignItems:'center',
    marginTop:10
  },
  titlecate:{
    fontSize:25,
    fontWeight:'bold',
    color:colors.red
  },
  frametitle:{
    backgroundColor:colors.text,
    paddingLeft:10,
    paddingRight:10,
    borderRadius:25,
    boxShadow: '0 0 5px rgba(0,0,0,0.5)',
    padding:5
  },
  framenamecate:{
    backgroundColor:colors.text,
    paddingLeft:10,
    paddingRight:10,
    borderRadius:25,
    boxShadow: '0 0 5px rgba(0,0,0,0.5)',
    padding:5
  },
  visualViewport:{
    padding:10
  }




})
export default Menu