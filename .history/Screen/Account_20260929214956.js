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
            <TouchableOpacity style={styles.category}><Text style={styles.categoryname} onPress={() => { settab('daily') }}>สรุปยอดขายรายวัน</Text></TouchableOpacity>
            <TouchableOpacity style={styles.category} onPress={() => { settab('rank') }}><Text style={styles.categoryname}>อันดับเมนูขายดี</Text></TouchableOpacity>
            <TouchableOpacity style={styles.category}><Text style={styles.categoryname} onPress={() => { settab('history') }}>ประวัติบิล</Text></TouchableOpacity>

          </ScrollView>
        </View>
        <View style={styles.contentfood}>
          {tab === 'daily' ?
            <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
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
                      <Text style={styles.topic}>วันที่</Text>
                      <TextInput style={styles.input} placeholder="วันที่ เช่น 02 , 23"></TextInput>
                      <Text style={styles.topic}>เดือน</Text>
                      <TextInput style={styles.input} placeholder="เดือน เช่น 12 , 05"></TextInput>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <View style={{ flexDirection: 'column' }}>
                          <Text style={styles.topic}>ปี</Text>
                          <TextInput style={styles.input} placeholder="ปี เช่น 2569 , 2568"></TextInput>
                        </View>
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
                              <Text style={styles.columnname1}>รวมทั้งหมด</Text>
                              <Text style={styles.columnname2}></Text>
                              <Text style={styles.columnname3}>10</Text>
                              <Text style={styles.columnname4}>1000</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}

                </View>



              </View>
            </ScrollView>

            : tab === 'rank' ?
              <View>
                <ScrollView contentContainerStyle={{ paddingBottom: 70 }}>
                  <View style={styles.topdaily}>
                    <Text style={styles.titledaily}>อันดับเมนูขายดี</Text>
                  </View>

                  <View style={styles.contentrank}>
                    <View style={styles.framerank}>

                      <View style={styles.picrank}>
                        <Image source={require('../photo/cate.jpg')} style={styles.pic}></Image>
                      </View>

                      <View style={styles.datarank}>
                        <View style={styles.rowrank}>
                          <Text style={styles.rank}>อันดับ 1</Text>
                        </View>

                        <View style={styles.namedata}><Text>Name : </Text>
                          <TextInput style={styles.namefood}>Cake</TextInput>
                        </View>


                        <View style={styles.namedata}><Text>Price : </Text>
                          <TextInput style={styles.datafood}>100</TextInput>
                        </View>


                        <View style={styles.namedata}><Text>Promotion : </Text>
                          <TextInput style={styles.datafood}>none</TextInput>
                        </View>
                      </View>
                    </View>




                    <View style={styles.framerank}>

                      <View style={styles.picrank}>
                        <Image source={require('../photo/cate.jpg')} style={styles.pic}></Image>
                      </View>

                      <View style={styles.datarank}>
                        <View style={styles.rowrank}>
                          <Text style={styles.rank}>อันดับ 2</Text>
                        </View>

                        <View style={styles.namedata}><Text>Name : </Text>
                          <TextInput style={styles.namefood}>Cake</TextInput>
                        </View>


                        <View style={styles.namedata}><Text>Price : </Text>
                          <TextInput style={styles.datafood}>100</TextInput>
                        </View>


                        <View style={styles.namedata}><Text>Promotion : </Text>
                          <TextInput style={styles.datafood}>none</TextInput>
                        </View>
                      </View>
                    </View>



                    <View style={styles.framerank}>

                      <View style={styles.picrank}>
                        <Image source={require('../photo/cate.jpg')} style={styles.pic}></Image>
                      </View>

                      <View style={styles.datarank}>
                        <View style={styles.rowrank}>
                          <Text style={styles.rank}>อันดับ 3</Text>
                        </View>

                        <View style={styles.namedata}><Text>Name : </Text>
                          <TextInput style={styles.namefood}>Cake</TextInput>
                        </View>


                        <View style={styles.namedata}><Text>Price : </Text>
                          <TextInput style={styles.datafood}>100</TextInput>
                        </View>


                        <View style={styles.namedata}><Text>Promotion : </Text>
                          <TextInput style={styles.datafood}>none</TextInput>
                        </View>
                      </View>
                    </View>
                  </View>
                </ScrollView>


              </View>


              :

              <View>
                <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
                  <View style={styles.topdaily}>
                    <Text style={styles.titledaily}>
                      ประวัติบิลย้อนหลัง
                    </Text>
                  </View>

                  <View style={styles.contentdaily}>

                    <View style={styles.top2daily}>
                      <View style={styles.top3daily}>
                        <Text style={{ color: colors.red, fontSize: 17, fontWeight: 'bold' }}>กรอกข้อมูลวันที่ในรูปแบบ dd/mm/yyyy</Text>
                      </View>
                      <View style={styles.day}>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 7 }}>

                          <View style={{ flexDirection: 'column' }}>
                            <Text style={styles.topic}>วันที่</Text>

                            <TextInput style={styles.input} placeholder="วันที่ เช่น 02 , 23"></TextInput>
                          </View>


                          <View style={{ flexDirection: 'column' }}>
                            <Text style={styles.topic}>เลขโต๊ะ(ไม่กรอกก็ได้)</Text>

                            <TextInput style={styles.inputtable} placeholder="เลขโต๊ะ เช่น 2"></TextInput>
                          </View>
                        </View>


                        <Text style={styles.topic}>เดือน</Text>
                        <TextInput style={styles.input} placeholder="เดือน เช่น 12 , 05"></TextInput>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <View style={{ flexDirection: 'column' }}>
                            <Text style={styles.topic}>ปี</Text>
                            <TextInput style={styles.input} placeholder="ปี เช่น 2569 , 2568"></TextInput>
                          </View>
                          <TouchableOpacity style={styles.butt} onPress={() => setdatadaily('bill')}>
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
                      <View style={styles.areabill}>

                        <View style={styles.order}>


                          <View style={styles.rowtitlebill}>
                            <Text style={{ fontSize: 25 }}>Bill</Text>
                            <Text style={styles.numbill}>รหัสบิล :  789124345</Text>
                          </View>
                          <View style={styles.bill}>
                            <View style={styles.rownotable}>
                              <Text style={styles.notable}>โต๊ะที่ 1</Text>
                              <Text style={styles.numround}>รอบที่ 1 เวลา : 15.00</Text>
                            </View>

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


                              <View style={styles.summary}>
                                <Text style={styles.columnname1}>รวมทั้งหมด</Text>
                                <Text style={styles.columnname2}></Text>
                                <Text style={styles.columnname3}>4</Text>
                                <Text style={styles.columnname4}>400</Text>
                              </View>
                            </View>

                          </View>


                          <View style={styles.bill}>
                            <View style={styles.rownotable}>
                              <Text style={styles.notable}>โต๊ะที่ 1</Text>
                              <Text style={styles.numround}>รอบที่ 2 เวลา : 15.40</Text>
                            </View>

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


                              <View style={styles.summary}>
                                <Text style={styles.columnname1}>รวมทั้งหมด</Text>
                                <Text style={styles.columnname2}></Text>
                                <Text style={styles.columnname3}>4</Text>
                                <Text style={styles.columnname4}>400</Text>
                              </View>
                            </View>

                          </View>


                          <View style={styles.summarybill}>
                                    <Text style={styles.allbill}>ยอดรวมทั้งหมด : 400</Text>
                            </View>
                        </View>
                      </View>
                    )}

                  </View>


                </ScrollView>
              </View>


          }

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
    fontSize: 18,
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
    marginTop: 1,
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
    width: 170,
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
    height: 60,


  },
  contentdata: {
    padding: 15,

  },
  titledata: {
    fontSize: 20,
    color: colors.red
  },
  columndata: {
    flexDirection: 'row',
    borderColor: colors.dim,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    borderTopWidth: 1,

  },
  topdata: {

    alignItems: 'center',
    paddingBottom: 5
  },
  framedata2: {
    backgroundColor: colors.text,
    padding: 10,
    borderRadius: 10,
    boxShadow: '0 0 8px rgba(0,0,0,0.5)',




  },
  contentframe: {

  },
  list: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 5

  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: colors.dim,
    borderTopWidth: 1,
    marginTop: 5,
    paddingTop: 5
  },
  columnname1: {
    width: 100,
    color: colors.red,
    textAlign: 'center'
  },
  columnname2: {
    width: 70,
    color: colors.red,
    textAlign: 'center'
  }
  ,
  columnname3: {
    width: 60,
    color: colors.red,
    textAlign: 'center'
  },
  columnname4: {
    flex:1,
    color: colors.red,
    textAlign: 'center',
    
  },
  contentrank: {
    marginTop: 20
  },
  framerank: {
    backgroundColor: colors.text,
    boxShadow: '0 0 2px rgba(0,0,0,0.5)',
    flexDirection: 'row'
  },
  pic: {
    width: 160,
    height: 200,
    borderRadius: 10
  },
  picrank: {
    padding: 10,

  },
  topic: {
    color: colors.bg,
    paddingLeft: 10,
    fontWeight: 'bold'


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
  datarank: {
    justifyContent: 'center',
    padding: 5,
    borderBottomWidth: 1,
    borderColor: 'rgba(232, 227, 227, 1)',
  },
  rowrank: {
    paddingBottom: 10,
    fontWeight: 'bold'
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  inputtable: {
    backgroundColor: colors.text,
    marginTop: 5,
    width: 150,
    borderRadius: 20,
    paddingLeft: 15,
    boxShadow: '0 0 8px rgba(0,0,0,0.5)',


  },
  order: {
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'white',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding:15
  },
  rownotable: {
    borderBottomColor: colors.bg,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  notable: {
    fontSize: 18
  },
  numround: {
    fontSize: 14,
    color: colors.dim
  },

  areabill: {
    paddingLeft: 20,
    paddingRight: 20
  },
  columnbill: {
    width: 50
  },
  rowtitlebill: {
    alignItems: 'center',
    marginBottom: '10'
  },
  bill:{
    marginBottom:10
  },
  summarybill:{
    alignItems:'flex-end',
    paddingRight:15
  },
  allbill:{
    fontSize:20,
    fontWeight:'bold',
    
  }

})
export default Account