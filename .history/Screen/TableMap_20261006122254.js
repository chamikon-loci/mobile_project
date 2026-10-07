import {
  View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image,
  TextInput, ScrollView, Alert
} from 'react-native'
import { useState, useEffect } from 'react'
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite'
import { colors } from '../src/style/theme'
import {
  DATABASE_NAME, getAllTable, insertTable, openDATABASE, openBill,
  getOpenBillByTable, getBillOrders, getBillTotal,formatThaiDateTime
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
  <TouchableOpacity style={style.backButton} onPress={onPress}>
    <Image source={require('../photo/back.png')} style={style.back} />
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

  useEffect(() => {
    ; (async () => {
      try {
        await insertTable(db, initTables)
        setTable(await getAllTable(db))
      } catch (error) {
        console.log('โหลดข้อมูลโต๊ะไม่สำเร็จ', error)
      }
    })()
  }, [db])

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
   (bill_id, status, total_price, payment_time)
   VALUES (?, ?, ?, datetime('now', '+7 hours'))`,
          [selectedBill.bill_id, 'paid', total]
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
                                      {formatThaiDateTime(item.cancelled_at)}
                                    </Text>
                                  )}

                                  {isWaiting && (
                                    <Text style={{
                                      fontSize: 10,
                                      color: colors.dim,
                                      marginTop: 4
                                    }}>
                                      รอลูกค้ายกเลิก
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
              <View style={style.allbill}>
                <Text style={style.paytext}>
                  ยอดรวมทั้งหมด {Number(billTotal).toFixed(2)} บาท
                </Text>

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

    if (selectedTable.table_status === 'occupied') {
      return (
        <ImageBackground source={require('../photo/addtable.webp')} style={style.content}>
          <BackButton onPress={backToTableMap} />
          <Header title={selectedTable.table_name} />

          <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
            <View style={style.contentopen}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20
              }}>
                <Text style={style.billPageTitle}>ข้อมูลโต๊ะ</Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.red,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8
                  }}
                  onPress={() => setIsMovingTable(true)}
                >
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>ย้ายโต๊ะ</Text>
                </TouchableOpacity>
              </View>

              {selectedBill ? (
                <>
                  <InfoRow title="รหัสบิล" value={selectedBill.bill_id} />
                  <InfoRow title="ชื่อลูกค้า"