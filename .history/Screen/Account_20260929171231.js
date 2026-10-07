import { View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground, ScrollView, TextInput } from "react-native"
import { colors } from "../src/style/theme"
import { useState } from "react"


function Account({ changepage }) {

  const [tab, settab] = useState('daily');
  const [datadaily, setdatadaily] = useState('empty');
  return (

    <ImageBackground source={require('../photo/res.avif')} style={styles.content}>
      <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => { changepage('Login') }}>
        <Image source={require('../photo/back.png')} style={styles.picback} ></Image>
      </TouchableOpacity>
      <View style={styles.top}>
        <View style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)', paddingLeft: 20, paddingRight: 20, borderRadius: 50 }}>
          <Text style={styles.title}>Account</Text>
        </View>
      </View>
      <View style={styles.table}>

        <View style={styles.column}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.category}><Text style={styles.categoryname} onPress={() => { settabfood('addcategory') }}>สรุปยอดขายรายวัน</Text></TouchableOpacity>
            <TouchableOpacity style={styles.category} onPress={() => { settabfood('listfood') }}><Text style={styles.categoryname}>อันดับเมนูขายดี</Text></TouchableOpacity>
            <TouchableOpacity style={styles.category}><Text style={styles.categoryname} onPress={() => { settabfood('listfood') }}>ประวัติบิล</Text></TouchableOpacity>

          </ScrollView>
        </View>
        <View style={styles.contentfood}>
          {tab === 'daily' ?
            <ScrollView contentContainerStyle={{paddingBottom:90}}>
              <View>
                <View style={styles.topdaily}>
                  <Text style={styles.titledaily}>สรุปยอดขายรายวัน</Text>
                </View>

                <View style={styles.contentdaily}>

                  <View style={styles.top2daily}>
                    <View style={styles.top3daily}>
                      <Text style={{ color: colors.red, fontSize: 17, fontWeight: 'bold' }}>กรอกข้อมูลวันที่ในรูปแบบ dd/mm/yyyy</Text>
                    </View>
                    <View style={styles.day}>
                      <TextInput style={styles.input} placeholder="วันที่ เช่น 02 , 23"></TextInput>
                      <TextInput style={styles.input} placeholder="เดือน เช่น 12 , 05"></TextInput>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TextInput style={styles.input} placeholder="ปี เช่น 2569 , 2568"></TextInput>
                        <TouchableOpacity style={styles.butt} onPress={() => setdatadaily('datadaily')}>
                          <Text style={styles.search}>ค้นหา</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {datadaily === 'empty' ? <View style={styles.contentdata}>

                    <View style={styles.framedata}>
                      <Text style={{ color: colors.red, fontSize: 20 }}>ยังไม่มีข้อมูล</Text>
                    </View>

                  </View> : (
                    <View style={styles.contentdata}>
                      <View style={styles.framedata2}>
                        <View style={styles.topdata}>
                          <Text style={styles.titledata}>รายได้ทั้งหมด</Text>
                        </View>
                      
                        <View style={styles.contentframe}>
                          <View style={styles.columndata}>
                            <Text style={styles.columnname1}>รายการอาหาร</Text>
                            <Text style={styles.columnname2}>ราคา</Text>
                            <Text style={styles.columnname3}>จำนวน</Text>
                            <Text style={styles.columnname4}>ราคารวม</Text>
                          </View>


                          <View style={styles.listfood}>
                            <View style={styles.list}>
                              <Text style={styles.columnname1}>Cake</Text>
                              <Text style={styles.columnname2}>100</Text>
                              <Text style={styles.columnname3}>2</Text>
                              <Text style={styles.columnname4}>200</Text>
                            </View>

                            <View style={styles.list}>
                              <Text style={styles.columnname1}>Cake</Text>
                              <Text style={styles.columnname2}>100</Text>
                              <Text style={styles.columnname3}>2</Text>
                              <Text style={styles.columnname4}>200</Text>
                            </View>

                            <View style={styles.list}>
                              <Text style={styles.columnname1}>Cake</Text>
                              <Text style={styles.columnname2}>100</Text>
                              <Text style={styles.columnname3}>2</Text>
                              <Text style={styles.columnname4}>200</Text>
                            </View>

                            <View style={styles.list}>
                              <Text style={styles.columnname1}>Cake</Text>
                              <Text style={styles.columnname2}>100</Text>
                              <Text style={styles.columnname3}>2</Text>
                              <Text style={styles.columnname4}>200</Text>
                            </View>


                           <View style={styles.list}>
                              <Text style={styles.columnname1}>Cake</Text>
                              <Text style={styles.columnname2}>100</Text>
                              <Text style={styles.columnname3}>2</Text>
                              <Text style={styles.columnname4}>200</Text>
                            </View>


                            <View style={styles.summary}>
                              <Text style={styles.columnname}>รวมทั้งหมด</Text>
                              <Text style={styles.columnname}></Text>
                              <Text style={styles.columnname}>10</Text>
                              <Text style={styles.columnname}>1000</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}

                </View>



              </View>
            </ScrollView>

            : <View></View>}

        </View>





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
    alignItems: 'center',

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
    backgroundColor: 'rgba(253, 47, 129, 0.26)',
    flex: 1

  },

  table: {
    flex: 1
  },
  topdaily: {
    alignItems: "center",
    backgroundColor: colors.text,
    padding: 10,
    boxShadow: '0 0 8px rgba(0,0,0,0.5)',
    marginTop: 5,
    borderRadius: 6,


  },
  titledaily: {
    fontSize: 20,
    color: colors.red,
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: colors.text,
    marginTop: 5,
    width: 200,
    borderRadius: 20,
    paddingLeft: 15,
    boxShadow: '0 0 8px rgba(0,0,0,0.5)',

  },
  top2daily: {

    padding: 10,
    marginTop: 5,
    borderRadius: 6,


  },
  top3daily: {
    alignItems: "center",
    backgroundColor: colors.text,
    padding: 8,
    boxShadow: '0 0 8px rgba(0,0,0,0.5)',
    marginTop: 5,
    borderRadius: 25,
    marginBottom: 8


  },
  butt: {
    padding: 5,
    paddingLeft: 13,
    paddingRight: 13,
    backgroundColor: colors.text,
    marginRight: 10,
    borderRadius: 5
  },
  search: {
    color: colors.red,
    fontWeight: 'bold',
    fontSize: 15
  },
  framedata: {
    backgroundColor: colors.text,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    boxShadow: '0 0 8px rgba(0,0,0,0.5)',
    height: 120,


  },
  contentdata: {
    padding: 15,

  },
  titledata: {
    fontSize: 20
  },
  columndata: {
    flexDirection: 'row',
    borderColor: colors.dim,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    borderTopWidth: 1,

  },
  topdata: {

    alignItems: 'center'
  },
  framedata2: {
    backgroundColor: colors.text,
    padding: 10,
    borderRadius: 10,
    boxShadow: '0 0 8px rgba(0,0,0,0.5)',



  },
  contentframe: {

  },
  list:{
     flexDirection: 'row',
    justifyContent:'space-between',
    padding:3
    
  },
  summary:{
     flexDirection: 'row',
    justifyContent: 'space-between',
     borderColor: colors.dim,
    borderTopWidth: 1,
    marginTop:5
  },
  columnname1:{
    width:100,
    backgroundColor:colors.red,
    
  },
  columnname2:{
    width:50,
    backgroundColor:colors.red,
  }










})
export default Account