import { View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground, ScrollView } from "react-native"
import { colors } from "../src/style/theme"
import { useEffect, useState } from "react"
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite"
import {
  DATABASE_NAME,
  getCart,
  createOrderRound,
  openDATABASE
} from "../database/db"

function Cart({ changepage, billId }) {
  return (
    <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
      <CartScreen
        changepage={changepage}
        billId={billId}
      />
    </SQLiteProvider>
  )
}

function CartScreen({ changepage, billId }) {

  const db = useSQLiteContext()
  const [cart, setCart] = useState([])

  async function loadCart() {
    try {
      const data = await getCart(db, billId)
      setCart(data)
    } catch (error) {
      console.log('โหลดตะกร้าไม่สำเร็จ')
    }
  }

  async function sendOrder() {
    try {

      if (cart.length === 0) {
        return
      }

      await createOrderRound(
        db,
        billId,
        cart
      )

      setCart([])

      console.log('ส่งอาหารสำเร็จ')

    } catch (error) {
      console.log('ส่งอาหารไม่สำเร็จ', error)
    }
  }

  useEffect(() => {
    loadCart()
  }, [billId])

  return (

    <ImageBackground source={require('../photo/cart.jpg')} style={styles.content}>

      <ScrollView contentContainerStyle={styles.fixarea}>

        <View style={styles.top}>
          <View style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)', paddingLeft: 20, paddingRight: 20, borderRadius: 50 }}>
            <Text style={styles.title}>รายการอาหาร</Text>
          </View>
        </View>


        <View style={styles.middle}>

          {cart.length > 0 ? (

            cart.map(item => (

              <View style={styles.order} key={item.cart_id}>

                <View style={styles.rownotable}>
                  <Text style={styles.notable}>
                    {item.menu_name}
                  </Text>

                  <Text style={styles.numround}>
                    จำนวน {item.amount}
                  </Text>
                </View>


                <View style={styles.menu}>

                  <View style={styles.rowmenu}>

                    <Text style={styles.column}>
                      ราคา
                    </Text>

                    <Text style={styles.column}>
                      {item.unit_price}
                    </Text>

                  </View>


                  <View style={styles.rowmenu}>

                    <Text style={styles.column}>
                      จำนวน
                    </Text>

                    <Text style={styles.column}>
                      {item.amount}
                    </Text>

                  </View>


                  <View style={styles.rowmenu}>

                    <Text style={styles.column}>
                      หมายเหตุ
                    </Text>

                    <Text style={styles.column}>
                      {item.note || '-'}
                    </Text>

                  </View>

                </View>

              </View>

            ))

          ) : (

            <View style={styles.noData}>

              <View style={styles.framedata}>

                <Text style={styles.noDataText}>
                  ยังไม่มีอาหารในตะกร้า
                </Text>

              </View>

            </View>

          )}

        </View>


        {cart.length > 0 && (

          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendOrder}
          >
            <Text style={styles.sendButtonText}>
              ส่งอาหาร
            </Text>
          </TouchableOpacity>

        )}

      </ScrollView>


      <View style={styles.bottombar}>

        <TouchableOpacity
          style={styles.page}
          onPress={() => { changepage('MenuClient') }}
        >
          <Text style={styles.titlepage}>
            เมนูอาหาร
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.page}
          onPress={() => { changepage('Cart') }}
        >
          <Text style={styles.titlepage}>
            ตะกร้าอาหาร
          </Text>
        </TouchableOpacity>

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
    marginTop: 10
  },

  title: {
    fontSize: 45,
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
    width: 100
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
    color: colors.red,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 200,
    backgroundColor: 'rgba(253, 253, 253, 0.7)',
    borderRadius: 15,
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20
  },

  sendButton: {
    backgroundColor: colors.red,
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center'
  },

  sendButtonText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold'
  }

})

export default Cart