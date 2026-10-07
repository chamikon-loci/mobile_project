import React,{useEffect,useState} from 'react'
import {View,Text,ScrollView,TouchableOpacity,ActivityIndicator} from 'react-native'
import {SQLiteProvider,useSQLiteContext} from 'expo-sqlite'
import {styles} from '../src/style/billhistorystyle'
import {colors} from '../src/style/theme'
import {DATABASE_NAME,openDATABASE,getBillDetail} from '../database/db'

function BillHistory({changepage,billId,tableName}) {
  return (
    <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
      <BillHistoryScreen
        changepage={changepage}
        billId={billId}
        tableName={tableName}
      />
    </SQLiteProvider>
  )
}

function BillHistoryScreen({changepage,billId,tableName}) {
  const db = useSQLiteContext()
  const [items,setItems] = useState([])
  const [loading,setLoading] = useState(true)

  async function loadBillDetail() {
    if (!billId) {
      setItems([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const result = await getBillDetail(db,billId)
      setItems(result)
      console.log('รายละเอียดบิล',result)
    } catch(error) {
      console.log('โหลดรายละเอียดบิลไม่สำเร็จ',error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBillDetail() },[billId])

  const getItemTotal = item =>
    Number(item.unit_price || 0) * Number(item.amount || 0)

  const totalPrice = items.reduce(
    (sum,item) => sum + getItemTotal(item),0
  )

  const rounds = items.reduce((result,item) => {
    const round = item.round
    ;(result[round] ||= []).push(item)
    return result
  },{})

  const roundNumbers = Object.keys(rounds).sort(
    (a,b) => Number(a) - Number(b)
  )

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{paddingBottom:100}}>
        <Text style={styles.header}>
          ประวัติการสั่งอาหาร{tableName ? ` : ${tableName}` : ''}
        </Text>

        <View style={{alignItems:'center',marginBottom:15}}>
          <Text style={{
            fontSize:18,
            fontWeight:'bold',
            color:colors.red
          }}>
            รหัสบิล : {billId}
          </Text>
        </View>

        {loading ? (
          <View style={{alignItems:'center',marginTop:30}}>
            <ActivityIndicator size="large" color={colors.red}/>
            <Text style={{marginTop:10,color:colors.red}}>
              กำลังโหลดข้อมูล...
            </Text>
          </View>
        ) : items.length === 0 ? (
          <View style={{alignItems:'center',marginTop:30}}>
            <Text style={{
              color:colors.red,
              fontSize:20,
              fontWeight:'bold'
            }}>
              ยังไม่มีรายการอาหาร
            </Text>
          </View>
        ) : (
          <View>
            {roundNumbers.map(roundNumber => {
              const roundItems = rounds[roundNumber]
              const roundTotal = roundItems.reduce(
                (sum,item) => sum + getItemTotal(item),0
              )

              return (
                <View key={roundNumber} style={{marginBottom:20}}>
                  <View style={{
                    backgroundColor:colors.red,
                    padding:10,
                    borderRadius:10,
                    marginBottom:5
                  }}>
                    <Text style={{
                      color:colors.text,
                      fontSize:20,
                      fontWeight:'bold'
                    }}>
                      รอบที่ {roundNumber}
                    </Text>
                  </View>

                  <View style={[
                    styles.itemRow,
                    {backgroundColor:colors.text}
                  ]}>
                    <Text style={[
                      styles.menuName,
                      {flex:2,fontWeight:'bold'}
                    ]}>
                      รายการอาหาร
                    </Text>

                    <Text style={{
                      flex:1,
                      textAlign:'center',
                      fontWeight:'bold',
                      color:colors.red
                    }}>
                      จำนวน
                    </Text>

                    <Text style={{
                      flex:1,
                      textAlign:'center',
                      fontWeight:'bold',
                      color:colors.red
                    }}>
                      ราคา/หน่วย
                    </Text>

                    <Text style={{
                      flex:1,
                      textAlign:'center',
                      fontWeight:'bold',
                      color:colors.red
                    }}>
                      รวม
                    </Text>
                  </View>

                  {roundItems.map(item => (
                    <View key={item.order_item_id} style={styles.itemRow}>
                      <View style={{flex:2}}>
                        <Text style={styles.menuName}>
                          {item.menu_name}
                        </Text>

                        {item.note ? (
                          <Text style={{
                            fontSize:13,
                            color:colors.dim
                          }}>
                            หมายเหตุ : {item.note}
                          </Text>
                        ) : null}
                      </View>

                      <Text style={{
                        flex:1,
                        textAlign:'center',
                        color:colors.red
                      }}>
                        {item.amount}
                      </Text>

                      <Text style={{
                        flex:1,
                        textAlign:'center',
                        color:colors.red
                      }}>
                        {Number(item.unit_price).toFixed(2)}
                      </Text>

                      <Text style={{
                        flex:1,
                        textAlign:'center',
                        color:colors.red,
                        fontWeight:'bold'
                      }}>
                        {getItemTotal(item).toFixed(2)}
                      </Text>
                    </View>
                  ))}

                  <View style={{
                    alignItems:'flex-end',
                    paddingTop:8,
                    paddingRight:10
                  }}>
                    <Text style={{
                      fontWeight:'bold',
                      fontSize:16,
                      color:colors.red
                    }}>
                      รวมรอบที่ {roundNumber} : {roundTotal.toFixed(2)} บาท
                    </Text>
                  </View>
                </View>
              )
            })}

            <View style={{
              backgroundColor:colors.text,
              borderRadius:15,
              padding:15,
              marginTop:5
            }}>
              <Text style={{
                fontSize:22,
                fontWeight:'bold',
                color:colors.red,
                textAlign:'right'
              }}>
                ยอดรวมทั้งบิล
              </Text>

              <Text style={{
                fontSize:28,
                fontWeight:'bold',
                color:colors.red,
                textAlign:'right',
                marginTop:5
              }}>
                {totalPrice.toFixed(2)} บาท
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => changepage('MenuClient',billId)}
      >
        <Text style={styles.backButtonText}>ย้อนกลับ</Text>
      </TouchableOpacity>
    </View>
  )
}

export default BillHistory