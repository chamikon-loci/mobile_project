import {
  View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image,
  TextInput, ScrollView, Alert
} from 'react-native'
import { useState, useEffect } from 'react'
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite'
import { colors } from '../src/style/theme'
import {
  DATABASE_NAME, getAllTable, insertTable, openDATABASE, openBill,
  getOpenBillByTable, getBillOrders, getBillTotal, formatThaiDateTime
} from '../database/db'

const initTables = Array.from({ length: 15 }, (_, i) => ({
  Table_Name: `T${i + 1}`, Status: 'available'
}))

function TableMap({ changepage }) {
  return (
    <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
      <TableMapScreen changepage={changepage} />
    </SQLiteProvider>
  )
}

const BackButton = ({ onPress }) => (
  <TouchableOpacity style={[{width: 50, height: 50, borderRadius: 25}]} onPress={onPress}>
    <Image source={require('../photo/back.png')} style={style.picback} />
  </TouchableOpacity>
)

const Header = ({ title, history = false }) => (
  <View style={history ? style.tophistory : style.top}>
    <View style={history ? style.historyTitleBox : style.titleContainer}>
      <Text style={history ? style.titlehistory : style.title}>{title}</Text>
    </View>
  </View>
)

const BottomTabs = ({ setOpen }) => (
  <View style={style.bottomopendata1}>
    <TouchableOpacity style={style.butswitch} onPress={() => setOpen('info')}>
      <Text style={style.textswitch}>ข้อมูลโต๊ะ</Text>
    </TouchableOpacity>
    <TouchableOpacity style={style.butswitch} onPress={() => setOpen('history')}>
      <Text style={style.textswitch}>ประวัติการสั่งอาหาร</Text>
    </TouchableOpacity>
  </View>
)

const InfoRow = ({ title, value }) => (
  <View style={style.boxdata}>
    <Text style={style.textopen}>{title}</Text>
    <Text style={style.infoText}>{value || '-'}</Text>
  </View>
)

const InputRow = ({ title, value, onChangeText, keyboardType }) => (
  <View style={style.boxdata}>
    <Text style={style.textopen}>{title}</Text>
    <TextInput
      style={style.box}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  </View>
)

const TableButton = ({ item, onPress }) => (
  <TouchableOpacity
    style={item.table_status === 'available' ? style.tablenull : style.table}
    onPress={() => onPress(item)}
  >
    <Text style={style.numtable}>{item.table_name}</Text>
  </TouchableOpacity>
)

function TableMapScreen({ changepage }) {
  const db = useSQLiteContext()
  const [table, setTable] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [customerCount, setCustomerCount] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedTable, setSelectedTable] = useState(null)
  const [billId, setBillId] = useState(null)
  const [selectedBill, setSelectedBill] = useState(null)
  const [open, setOpen] = useState('info')
  const [billOrders, setBillOrders] = useState([])
  const [billTotal, setBillTotal] = useState(0)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [isMovingTable, setIsMovingTable] = useState(false)

  const [promotion, setPromotion] = useState([])
  const [selectPromotion, setSelectPromotion] = useState(null)

  useEffect(() => {
    let isMounted = true
    ; (async () => {
      try {
        await insertTable(db, initTables)
        setTable(await getAllTable(db))

        const promotion = await db.getAllAsync(`SELECT * FROM promotion WHERE is_active='open'`)
        if (isMounted) {setPromotion(promotion||[])}
      } catch (error) {
        console.log('โหลดข้อมูลโต๊ะไม่สำเร็จ', error)
      }
    })()
  }, [db])

  const discount = selectPromotion ? (selectPromotion.discount_type === 'percent' 
    ? (Number(billTotal)*Number(selectPromotion.discount_value))/100
    : Number(selectPromotion.discount_value)) : 0

  const resetForm = () => {
    setCustomerName('')
    setCustomerCount('')
    setPhone('')
  }

  const backToTableMap = () => {
    setSelectedTable(null)
    setSelectedBill(null)
    resetForm()
    setBillOrders([])
    setBillTotal(0)
    setOpen('info')
    setIsMovingTable(false)
    setSelectPromotion(null)
  }

  const openTable = async () => {
    if (!selectedTable) return
    if (!customerName.trim()) {
      console.log('กรุณากรอกชื่อลูกค้า')
      return
    }
    if (Number(customerCount) <= 0) {
      console.log('กรุณากรอกจำนวนลูกค้า')
      return
    }

    try {
      const bill = await openBill(
        db,
        selectedTable.table_id,
        customerName.trim(),
        Number(customerCount),
        phone.trim()
      )

      setBillId(bill.bill_id)
      setTable(prev => prev.map(item =>
        item.table_id === selectedTable.table_id
          ? { ...item, table_status: 'occupied' }
          : item
      ))
      resetForm()
    } catch (error) {
      console.log('เปิดโต๊ะไม่สำเร็จ', error)
    }
  }

  const loadBillHistory = async id => {
    if (!id) return
    try {
      setLoadingHistory(true)
      const [orders, total] = await Promise.all([
        getBillOrders(db, id),
        getBillTotal(db, id)
      ])
      setBillOrders(orders)
      setBillTotal(total)
    } catch (error) {
      console.log('โหลดประวัติการสั่งอาหารไม่สำเร็จ', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const openHistory = async () => {
    setOpen('history')
    if (selectedBill) await loadBillHistory(selectedBill.bill_id)
  }

  const payBill = async () => {
    if (!selectedBill) return
    try {
      const total = await getBillTotal(db, selectedBill.bill_id)

      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT INTO Transactions
          (bill_id, status, total_price, discount, net_price, promotion_id, payment_time)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+7 hours'))`,
          [
            selectedBill.bill_id,
            'paid',                                                 // 1. status
            total,                                                  // 2. total_price
            discount,                                               // 3. discount
            total - discount,                                       // 4. net_price
            selectPromotion ? selectPromotion.promotion_id : null   // 5. promotion_id
          ]
        )
        await db.runAsync(
          `UPDATE Bills SET status='closed', close_at=datetime('now', '+7 hours')
          WHERE bill_id=?`,
          [selectedBill.bill_id]
        )
        await db.runAsync(
          `UPDATE Tables SET table_status='available' WHERE table_id=?`,
          [selectedBill.table_id]
        )
      })

      setTable(await getAllTable(db))
      setSelectedTable(null)
      setSelectedBill(null)
      setBillOrders([])
      setBillTotal(0)
      setSelectPromotion(null)
      setOpen('info')
      console.log('ชำระเงินสำเร็จ', selectedBill.bill_id, total)
    } catch (error) {
      console.log('ชำระเงินไม่สำเร็จ', error)
    }
  }

  const executeMoveTable = async targetTable => {
    if (!selectedBill || !selectedTable) return

    if (targetTable.table_status === 'occupied') {
      Alert.alert('ไม่สามารถย้ายได้', 'โต๊ะปลายทางไม่ว่าง กรุณาเลือกโต๊ะว่าง')
      return
    }

    Alert.alert(
      'ยืนยันการย้ายโต๊ะ',
      `คุณต้องการย้ายจากโต๊ะ ${selectedTable.table_name} ไปยัง ${targetTable.table_name} ใช่หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ยืนยัน',
          onPress: async () => {
            try {
              await db.withTransactionAsync(async () => {
                await db.runAsync(
                  `UPDATE Bills SET table_id = ? WHERE bill_id = ?`,
                  [targetTable.table_id, selectedBill.bill_id]
                )
                await db.runAsync(
                  `UPDATE Tables SET table_status = 'available' WHERE table_id = ?`,
                  [selectedTable.table_id]
                )
                await db.runAsync(
                  `UPDATE Tables SET table_status = 'occupied' WHERE table_id = ?`,
                  [targetTable.table_id]
                )
              })

              setTable(await getAllTable(db))
              Alert.alert('สำเร็จ', `ย้ายไปยังโต๊ะ ${targetTable.table_name} เรียบร้อยแล้ว`)
              backToTableMap()
            } catch (error) {
              console.log('ย้ายโต๊ะไม่สำเร็จ', error)
              Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถย้ายโต๊ะได้')
            }
          }
        }
      ]
    )
  }

  const selectTable = async item => {
    try {
      if (isMovingTable) {
        await executeMoveTable(item)
        return
      }

      const bill = item.table_status === 'occupied'
        ? await getOpenBillByTable(db, item.table_id)
        : null

      setSelectedBill(bill || null)
      setSelectedTable(item)
      setOpen('info')
    } catch (error) {
      console.log('โหลดข้อมูลบิลไม่สำเร็จ', error)
    }
  }

  const isAllServed = billOrders.length > 0 && billOrders.every(
    item => item.status === 'เสิร์ฟแล้ว' || item.status === 'ยกเลิก'
  )
  const available = table.filter(x => x.table_status === 'available').length
  const notavailable = table.length - available

  if (billId) {
    return (
      <ImageBackground source={require('../photo/addtable.webp')} style={style.content}>
        <View style={style.billcode}>
          <Text style={style.billcodetitle}>เปิดโต๊ะสำเร็จ</Text>
          <Text style={style.billcodename}>รหัสบิล</Text>
          <Text style={style.billid}>{billId}</Text>
          <Text style={style.billcodeinfo}>กรุณาแจ้งรหัสนี้ให้ลูกค้า</Text>
          <Text style={style.billcodeinfo}>เพื่อใช้เข้าสู่ระบบและสั่งอาหาร</Text>
          <TouchableOpacity
            style={style.butopen}
            onPress={() => {
              setBillId(null)
              setSelectedTable(null)
              setSelectedBill(null)
            }}
          >
            <Text style={style.textbut}>กลับหน้าหลัก</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    )
  }

  if (selectedTable) {
    if (isMovingTable) {
      return (
        <ImageBackground source={require('../photo/TableMap.jpg')} style={style.content}>
          <View style={style.mainHeaderContainer}>
            <BackButton onPress={() => setIsMovingTable(false)} />
            <View style={style.titleContainer}>
              <Text style={style.title}>เลือกโต๊ะ</Text>
            </View>
            <View style={{ width: 45 }} />
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 100, alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ padding: 10, alignItems: 'center' }}>
              <Text style={{
                fontSize: 16, fontWeight: 'bold', color: colors.red,
                backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 10
              }}>
                กำลังย้ายจากโต๊ะ {selectedTable.table_name} - กรุณาเลือกโต๊ะว่างปลายทาง
              </Text>
            </View>
            <View style={style.middle}>
              {table.map(item => (
                <TableButton key={item.table_id} item={item} onPress={selectTable} />
              ))}
            </View>
          </ScrollView>
        </ImageBackground>
      )
    }

    if (selectedTable.table_status === 'occupied' && open === 'history') {
      const roundsMap = billOrders.reduce((r, item) => {
        (r[item.round || 1] ||= []).push(item)
        return r
      }, {})
      const roundNumbers = Object.keys(roundsMap).sort((a, b) => Number(a) - Number(b))

      return (
        <ImageBackground source={require('../photo/historyorder.jpg')} style={style.content}>
          <View style={style.historyHeaderContainer}>
            <BackButton onPress={backToTableMap} />
            <View style={style.historyTitleBoxOnly}>
              <Text style={style.titlehistory}>ประวัติการสั่งอาหาร</Text>
            </View>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 220, paddingHorizontal: 15 }}>
            <View style={style.middlehistory}>
              {loadingHistory ? (
                <Text style={style.loadingText}>กำลังโหลดข้อมูล...</Text>
              ) : !billOrders.length ? (
                <View style={style.emptyBox}>
                  <Text style={style.emptyText}>ยังไม่มีรายการอาหาร</Text>
                </View>
              ) : (
                roundNumbers.map(roundNumber => {
                  const roundItems = roundsMap[roundNumber]
                  const roundTotal = roundItems.reduce(
                    (sum, item) => item.status === 'ยกเลิก'
                      ? sum
                      : sum + Number(item.unit_price || 0) * Number(item.amount || 0),
                    0
                  )

                  return (
                    <View key={roundNumber} style={style.orderCard}>
                      <View style={style.bill}>
                        <View style={style.rownotable}>
                          <Text style={style.notable}>{selectedTable.table_name}</Text>
                          <Text style={style.numround}>
                            รอบที่ {roundNumber} | เวลา : {formatThaiDateTime(roundItems[0]?.order_at)}
                          </Text>
                        </View>

                        <View style={style.columndata}>
                          <Text style={{ flex: 2, fontWeight: 'bold' }}>รายการอาหาร</Text>
                          <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>จำนวน</Text>
                          <Text style={{ flex: 1.2, textAlign: 'center', fontWeight: 'bold' }}>ราคาต่อหน่วย</Text>
                          <Text style={{ flex: 1.2, textAlign: 'center', fontWeight: 'bold' }}>ราคารวม</Text>
                          <Text style={{ flex: 1.2, textAlign: 'center', fontWeight: 'bold' }}>สถานะ/ยกเลิก</Text>
                        </View>

                        <View style={style.listfood}>
                          {roundItems.map(item => {
                            const currentStatus = item.status || 'รอทำ'
                            const isWaiting = currentStatus === 'รอทำ'
                            const isCancelled = currentStatus === 'ยกเลิก'
                            const unitPrice = Number(item.unit_price || 0)
                            const itemTotal = isCancelled ? 0 : unitPrice * Number(item.amount || 0)

                            return (
                              <View
                                key={item.order_item_id}
                                style={[
                                  style.list,
                                  {
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingVertical: 8,
                                    borderBottomWidth: 0.5,
                                    borderBottomColor: '#eee',
                                    opacity: isCancelled ? 0.5 : 1
                                  }
                                ]}
                              >
                                <View style={{ flex: 2 }}>
                                  <Text style={{
                                    fontWeight: 'bold',
                                    textDecorationLine: isCancelled ? 'line-through' : 'none'
                                  }}>
                                    {item.menu_name}
                                  </Text>

                                  {item.note && (
                                    <Text style={{ fontSize: 12, color: colors.dim }}>
                                      หมายเหตุ : {item.note}
                                    </Text>
                                  )}


                                  {isCancelled && item.cancelled_at && (
                                    <Text style={{ fontSize: 10, color: 'red' }}>
                                      ยกเลิกเมื่อ: {formatThaiDateTime(item.cancelled_at)}
                                    </Text>
                                  )}
                                </View>

                                <Text style={{
                                  flex: 1,
                                  textAlign: 'center',
                                  textDecorationLine: isCancelled ? 'line-through' : 'none'
                                }}>
                                  {item.amount}
                                </Text>

                                <Text style={{
                                  flex: 1.2,
                                  textAlign: 'center',
                                  textDecorationLine: isCancelled ? 'line-through' : 'none'
                                }}>
                                  {unitPrice.toFixed(2)} บาท
                                </Text>

                                <Text style={{
                                  flex: 1.2,
                                  textAlign: 'center',
                                  textDecorationLine: isCancelled ? 'line-through' : 'none'
                                }}>
                                  {itemTotal.toFixed(2)} บาท
                                </Text>

                                <View style={{ flex: 1.2, alignItems: 'center' }}>
                                  <Text style={{
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    color: currentStatus === 'เสิร์ฟแล้ว' ? 'green' :
                                      currentStatus === 'กำลังทำ' ? 'orange' :
                                        currentStatus === 'ยกเลิก' ? 'gray' : 'red'
                                  }}>
                                    {currentStatus}
                                  </Text>

                                  
                                  {isCancelled && item.cancelled_at && (
                                    <Text style={{ fontSize: 10, color: 'red', textAlign: 'center', marginTop: 2 }}>
                                      
                                    </Text>
                                  )}

                                  {isWaiting && (
                                    <Text style={{
                                      fontSize: 10,
                                      color: colors.dim,
                                      marginTop: 4
                                    }}>
                                      
                                    </Text>
                                  )}
                                </View>
                              </View>
                            )
                          })}
                        </View>

                        <View style={style.roundTotal}>
                          <Text style={style.roundTotalText}>
                            รวมรอบที่ {roundNumber} : {roundTotal.toFixed(2)} บาท
                          </Text>
                        </View>
                      </View>
                    </View>
                  )
                })
              )}
            </View>
          </ScrollView>

          <View style={style.bottomopendata}>
            <View style={style.bottompay}>
              <View style={{marginVertical:6,paddingHorizontal:10}} >
                <Text style={style.paytext}>เลือกส่วนลด</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator = {false}>
                  <TouchableOpacity style = {[style.butpay,{backgroundColor:colors.red}]} onPress={()=>setSelectPromotion(null)}>
                    <Text style={style.pay}>ไม่ใช้ส่วนลด</Text>
                  </TouchableOpacity>
                  {promotion.map(item=>(
                    <TouchableOpacity key={item.promotion_id} style = {[style.butpay,{backgroundColor:colors.card}]} 
                    onPress={()=>setSelectPromotion(item)}>
                      <Text style={style.pay}>
                        {item.promotion_name} (-{item.discount_value}{item.discount_type==='percent'?'%':'บาท'})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={style.dispay}>
                <View style={{flex:1,paddingRight:10}}>
                <Text style={style.paytext}>
                  ก่อนใช้ส่วนลด {Number(billTotal).toFixed(2)} บาท
                </Text>
                {discount> 0 && (
                  <Text style={style.distext}>ส่วนลด -{discount.toFixed(2)} บาท</Text>
                )}
                <Text style={style.totalpaytext}>ยอดรวมสุทธิ {Number(billTotal-discount).toFixed(2)} บาท</Text>
                </View>
                <TouchableOpacity
                  style={[style.butpay, {
                    backgroundColor: isAllServed ? 'rgb(135, 84, 180)' : colors.dim
                  }]}
                  onPress={() => {
                    if (!isAllServed) {
                      console.log('ไม่สามารถชำระเงินได้ เนื่องจากยังมีอาหารที่ยังไม่ได้เสิร์ฟ')
                      return
                    }
                    payBill()
                  }}
                >
                  <Text style={style.pay}>ชำระเงิน</Text>
                </TouchableOpacity>
              </View>
            </View>

            <BottomTabs setOpen={setOpen} />
          </View>
        </ImageBackground>
      )
    }

    return (
      <ImageBackground source={require('../photo/addtable.webp')} style={style.content}>
        <View style={style.historyHeaderContainer}>
          <BackButton onPress={backToTableMap} />
          <View style={style.historyTitleBoxOnly}>
            <View style={style.titleContainer}>
              <Text style={style.title}>{selectedTable.table_name}</Text>
            </View>
          </View>
          <View style={{ width: 50 }} />
        </View>

        <View style={style.contentopen}>
          <InputRow title="ชื่อ" value={customerName} onChangeText={setCustomerName} />
          <InputRow
            title="จำนวนคน"
            value={customerCount}
            onChangeText={setCustomerCount}
            keyboardType="numeric"
          />
          <InputRow
            title="เบอร์โทร"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={style.bottomopen}>
          <TouchableOpacity style={style.butopen} onPress={backToTableMap}>
            <Text style={style.textbut}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.butopen} onPress={openTable}>
            <Text style={style.textbut}>เปิดโต๊ะ</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    )

    return (
      <ImageBackground source={require('../photo/addtable.webp')} style={style.content}>
        <BackButton onPress={backToTableMap} />
        <Header title={selectedTable.table_name} />

        <View style={style.contentopen}>
          <InputRow title="ชื่อ" value={customerName} onChangeText={setCustomerName} />
          <InputRow
            title="จำนวนคน"
            value={customerCount}
            onChangeText={setCustomerCount}
            keyboardType="numeric"
          />
          <InputRow
            title="เบอร์โทร"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={style.bottomopen}>
          <TouchableOpacity style={style.butopen} onPress={backToTableMap}>
            <Text style={style.textbut}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.butopen} onPress={openTable}>
            <Text style={style.textbut}>เปิดโต๊ะ</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    )
  }

  return (
    <ImageBackground source={require('../photo/TableMap.jpg')} style={style.content}>
      <View style={style.historyHeaderContainer}>
        <BackButton onPress={() => changepage('Login')} />
        <View style={style.historyTitleBoxOnly}>
          <Text style={style.title}>Table</Text>
        </View>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <View style={style.statustable}>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>
            จำนวนโต๊ะที่ว่าง : {available}
          </Text>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>
            จำนวนโต๊ะที่ไม่ว่าง : {notavailable}
          </Text>
        </View>

        <View style={style.middle}>
          {table.map(item => (
            <TableButton key={item.table_id} item={item} onPress={selectTable} />
          ))}
        </View>
      </ScrollView>

      <View style={style.bottombar}>
        {['Table', 'Order', 'Menu', 'Account', 'Promote'].map(page => (
          <TouchableOpacity key={page} style={style.page} onPress={() => changepage(page)}>
            <Text style={style.titlepage}>{page}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ImageBackground>
  )
}

const style = StyleSheet.create({
  content: { flex: 1, paddingTop: 10 },
  top: { alignItems: 'center', marginBottom: 5 },
  titleContainer: {
    paddingLeft: 20, paddingRight: 20, borderRadius: 50,
    boxShadow: '0 0 10px rgba(0,0,0,0.5)'
  },
  title: {
    fontSize: 40, fontWeight: 'bold', color: colors.red, textAlign: 'center'
  },
  mainHeaderContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 15, marginTop: 5, marginBottom: 10
  },
  mainTitleBoxOnly: { flex: 1, alignItems: 'center' },
  backButton: {
   width: 45, 
    height: 45, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  back: { width: 30, 
    height: 30, 
    marginTop: 40, 
    marginBottom: 10,
    borderRadius: 15},
  table: {
    width: '30%', height: 60, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.dim, borderColor: colors.red, borderWidth: 2,
    borderRadius: 30, marginBottom: 15
  },
  tablenull: {
    width: '30%', height: 60, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.red, borderColor: colors.red, borderWidth: 2,
    borderRadius: 50, marginBottom: 15
  },
  numtable: { fontSize: 26, fontWeight: 'bold', color: colors.text },
  middle: {
    justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 20,
    width: '100%', flexWrap: 'wrap'
  },
  statustable: {
    width: 280, marginBottom: 15, backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10, padding: 10, alignItems: 'flex-start'
  },
  bottombar: {
    flexDirection: 'row', justifyContent: 'space-around', position: 'absolute',
    bottom: 0, left: 0, right: 0, elevation: 5
  },
  page: {
    borderColor: colors.text, borderTopWidth: 2, borderWidth: 1, flex: 1,
    height: 60, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.red
  },
  titlepage: { color: colors.text, fontSize: 15, fontWeight: 'bold' },
  boxdata: { flexDirection: 'column', marginBottom: 5 },
  box: {
    backgroundColor: colors.text, borderRadius: 20, paddingLeft: 20,
    paddingRight: 20, marginBottom: 10, minHeight: 45
  },
  contentopen: { padding: 20 },
  bottomopen: {
    flexDirection: 'row', justifyContent: 'flex-end', padding: 20
  },
  butopen: {
    backgroundColor: colors.red, padding: 10, borderRadius: 5, marginLeft: 15
  },
  textbut: { color: colors.text, fontSize: 15 },
  textopen: { fontSize: 15, fontWeight: 'bold', marginBottom: 5 },
  billPageTitle: {
    fontSize: 25, fontWeight: 'bold', color: colors.red, marginBottom: 20
  },
  infoText: {
    backgroundColor: colors.text, borderRadius: 20, padding: 15,
    marginBottom: 10, fontSize: 18
  },
  noBillText: { fontSize: 18, textAlign: 'center', marginTop: 30 },
  billcode: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)', margin: 20, borderRadius: 20, padding: 30
  },
  billcodetitle: {
    fontSize: 30, fontWeight: 'bold', color: colors.red, marginBottom: 30
  },
  billcodename: { fontSize: 20, fontWeight: 'bold' },
  billid: {
    fontSize: 50, fontWeight: 'bold', color: colors.red, marginVertical: 20
  },
  billcodeinfo: { fontSize: 16, marginBottom: 5 },
  tophistory: {
    alignItems: 'center', marginBottom: 5, flexDirection: 'row',
    justifyContent: 'center', paddingTop: 5
  },
  historyHeaderContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 10, marginBottom: 10, marginTop: 5
  },
  historyTitleBoxOnly: { flex: 1, alignItems: 'center' },
  titlehistory: {
    fontSize: 24, fontWeight: 'bold', color: colors.red, textAlign: 'center',boxShadow: '0 0 10px rgba(0,0,0,0.5)',padding:5,borderRadius:20
  },
  middlehistory: { paddingBottom: 20 },
  orderCard: {
    marginBottom: 15, backgroundColor: 'white', borderRadius: 15, padding: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  bill: { marginBottom: 0 },
  rownotable: {
    borderBottomColor: '#eee', borderBottomWidth: 1, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8,
    marginBottom: 8
  },
  notable: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  numround: { fontSize: 13, color: '#666', textAlign: 'right' },
  columndata: {
    flexDirection: 'row', borderColor: '#eee', borderBottomWidth: 1,
    borderTopWidth: 1, paddingVertical: 8, backgroundColor: '#fafafa'
  },
  listfood: { paddingTop: 5 },
  list: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0'
  },
  columnname1: {
    flex: 2, color: '#333', textAlign: 'left', paddingLeft: 5, fontSize: 14
  },
  columnname2: { flex: 0.8, color: '#333', textAlign: 'center', fontSize: 14 },
  columnname3: { flex: 1.2, color: '#666', textAlign: 'center', fontSize: 13 },
  columnname4: {
    flex: 1.2, textAlign: 'center', fontSize: 13, fontWeight: 'bold'
  },
  roundTotal: {
    borderTopWidth: 1, borderTopColor: '#eee', marginTop: 10,
    paddingTop: 8, alignItems: 'flex-end'
  },
  roundTotalText: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  loadingText: {
    textAlign: 'center', fontSize: 18, marginTop: 50, color: colors.text
  },
  emptyBox: {
    backgroundColor: colors.text, borderRadius: 15, padding: 30,
    marginTop: 30, alignItems: 'center'
  },
  emptyText: { fontSize: 18 },
  bottomopendata: {
    position: 'absolute', bottom: 0, left: 0, right: 0
  },
  bottompay: {
    backgroundColor: 'white', padding: 12, borderTopWidth: 1,
    borderTopColor: '#ddd'
  },
  allbill: {
    alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 10
  },
  paytext: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  butpay: {
    borderRadius: 30, paddingVertical: 10, paddingHorizontal: 20,marginRight:5,marginTop:10
  },
  pay: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  bottomopendata1: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#ddd'
  },
  butswitch: {
    backgroundColor: colors.red, flex: 1, padding: 15, alignItems: 'center',
    justifyContent: 'center', borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)'
  },
  textswitch: {
    fontSize: 14, color: colors.text, fontWeight: 'bold'
  },
  dispay:{
    flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'#fff',paddingHorizontal:15,paddingVertical:10,
    borderWidth:1, borderColor:'#eee',marginBottom:5,
  },
  totalpaytext:{
    fontSize:16,fontWeight:'bold',color:colors.green},
  distext:{
    fontSize:16,fontWeight:'bold',color:colors.card,},
  discard:{

  },
 picback: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    marginTop: 10, 
    marginBottom: 5 
  },

})

export default TableMap