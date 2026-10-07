import { View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground, ScrollView } from "react-native"
import { colors } from "../src/style/theme"
import { useEffect, useState } from "react"
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite"
import { DATABASE_NAME, getAllOrder, openDATABASE } from "../database/db"

function Order({ changepage }) {
  return (
    <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
      <OrderScreen changepage={changepage} />
    </SQLiteProvider>
  )
}

function OrderScreen({ changepage }) {

  const db = useSQLiteContext()
  const [order, setOrder] = useState([])

  async function loadOrder() {
    try {
      const data = await getAllOrder(db)
      setOrder(data)
    } catch (error) {
      console.log('โหลด Order ไม่สำเร็จ')
    }
  }

  useEffect(() => {
    loadOrder()
  }, [])

  const [status, setstatus] = useState('รอทำ');
  let change = 'wait';

  function changestatus(change) {
    let update = '';
    if (change === 'wait') {
      update = 'รอทำ';

    } else if (change === 'doing') {
      update = 'กำลังทำ';

    } else {
      update = 'เสิร์ฟแล้ว';

    }
    setstatus(update);
  }
  return (

    <ImageBackground source={require('../photo/order.jpg')} style={styles.content}>
      <ScrollView contentContainerStyle={styles.fixarea}>
        <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => { changepage('Login') }}>
          <Image source={require('../photo/back.png')} style={styles.picback} ></Image>
        </TouchableOpacity>
        <View style={styles.top}>
          <View style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)', paddingLeft: 20, paddingRight: 20, borderRadius: 50 }}>
            <Text style={styles.title}>Order</Text>
          </View>
        </View>


        <View style={styles.middle}>
          {order.length > 0 ? order && order.map(item => (
            <View style={styles.order} key={item.order_item_id}>
              <View style={styles.rownotable}>
                <Text style={styles.notable}>โต๊ะที่ {item.table_name}</Text>
                <Text style={styles.numround}>รอบที่ {item.round} เวลา : {item.order_at}</Text>
              </View>

              <View style={styles.columnorder}>
                <Text style={styles.columntop}>ชื่อ</Text>
                <Text style={styles.columntop}>จำนวน</Text>
                <Text style={styles.columntop}>เพิ่มเติม</Text>
                <Text style={styles.columntop}>หมายเหตุ</Text>
              </View>

              <View style={styles.menu}>
                <View style={styles.rowmenu}>
                  <Text style={styles.column}>{item.order_menu_name}</Text>
                  <Text style={styles.column}>{item.amount}</Text>
                  <Text style={styles.column}>{item.extra}</Text>
                  <Text style={styles.column}>{item.note}</Text>
                </View>
              </View>

              <View style={styles.rowstatus}>
                <Text>สถานะ : {status}</Text>

                <View style={styles.butt}>
                  <TouchableOpacity style={styles.status} onPress={() => changestatus('wait')}><Text style={styles.namestatus}>รอทํา</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.status}><Text style={styles.namestatus} onPress={() => changestatus('doing')}>กำลังทํา</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.status}><Text style={styles.namestatus} onPress={() => changestatus('finish')}>เสิร์ฟแล้ว</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          )) : (<View style={styles.noData}>
            <View style={styles.framedata}>
              <Text style={styles.noDataText}>ไม่มี Order

              </Text>
            </View>
          </View>)}
        </View>
      </ScrollView>

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
  middle: {
    paddingLeft: 25,
    paddingRight: 25,
  },
  order: {
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'white',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 10
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
  columnorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: colors.bg,
    borderBottomWidth: 1,

  },
  rowmenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {

    width: 55
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
  rowstatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  butt: {
    flexDirection: 'row',

  },
  status: {
    padding: 5,
    backgroundColor: colors.red,
    borderRadius: 5,
    marginRight: 5
  },
  namestatus: {
    color: colors.text
  },
  fixarea: {
    paddingBottom: 90
  },
  noData: {
    flex: 1,
    alignItems: 'center',
   
  },
  noDataText: {
    color: '#faf8f8',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 200,
    backgroundColor:'rgba(0,0,0,0)'
  },


})
export default Order