import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  TextInput,
  ScrollView,
  Alert
} from 'react-native'

import { useState, useEffect } from 'react'
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite'
import { colors } from '../src/style/theme'

import {
  DATABASE_NAME,
  getAllTable,
  insertTable,
  openDATABASE,
  openBill,
  getOpenBillByTable,
  getBillOrders,
  getBillTotal
} from '../database/db'


const initTables = Array.from({ length: 15 }, (_, i) => ({
  Table_Name: `T${i + 1}`,
  Status: 'available'
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
      <Text style={history ? style.titlehistory : style.title}>
        {title}
      </Text>
    </View>
  </View>
)


const BottomTabs = ({ setOpen }) => (
  <View style={style.bottomopendata1}>
    <TouchableOpacity
      style={style.butswitch}
      onPress={() => setOpen('info')}
    >
      <Text style={style.textswitch}>ข้อมูลโต๊ะ</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={style.butswitch}
      onPress={() => setOpen('history')}
    >
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


const InputRow = ({
  title,
  value,
  onChangeText,
  keyboardType
}) => (
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
    style={
      item.table_status === 'available'
        ? style.tablenull
        : style.table
    }
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
  const [isMovingTable, setIsMovingTable] = useState(false) // สถานะสำหรับโหมดเลือกโต๊ะปลายทางเพื่อย้าย


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

      setTable(prev =>
        prev.map(item =>
          item.table_id === selectedTable.table_id
            ? { ...item, table_status: 'occupied' }
            : item
        )
      )

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
           (bill_id,status,total_price,payment_time)
           VALUES (?, ?, ?, datetime('now'))`,
          [selectedBill.bill_id, 'paid', total]
        )

        await db.runAsync(
          `UPDATE Bills
           SET status='closed', close_at=datetime('now')
           WHERE bill_id=?`,
          [selectedBill.bill_id]
        )

        await db.runAsync(
          `UPDATE Tables
           SET table_status='available'
           WHERE table_id=?`,
          [selectedBill.table_id]
        )
      })

      setTable(await getAllTable(db))
      setSelectedTable(null)
      setSelectedBill(null)
      setBillOrders([])
      setBillTotal(0)
      setOpen('info')

      console.log(
        'ชำระเงินสำเร็จ',
        selectedBill.bill_id,
        total
      )
    } catch (error) {
      console.log('ชำระเงินไม่สำเร็จ', error)
    }
  }


  // ฟังก์ชันดำเนินการย้ายโต๊ะ
  const executeMoveTable = async (targetTable) => {
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
                // 1. อัปเดต bill ให้ย้ายไปผูกกับโต๊ะใหม่ (รายการอาหารและบิลเดิมไม่หาย)
                await db.runAsync(
                  `UPDATE Bills SET table_id = ? WHERE bill_id = ?`,
                  [targetTable.table_id, selectedBill.bill_id]
                )
                // 2. เปลี่ยนโต๊ะเก่าเป็น available
                await db.runAsync(
                  `UPDATE Tables SET table_status = 'available' WHERE table_id = ?`,
                  [selectedTable.table_id]
                )
                // 3. เปลี่ยนโต๊ะใหม่เป็น occupied
                await db.runAsync(
                  `UPDATE Tables SET table_status = 'occupied' WHERE table_id = ?`,
                  [targetTable.table_id]
                )
              })

              // รีเฟรชข้อมูลโต๊ะใหม่
              const updatedTables = await getAllTable(db)
              setTable(updatedTables)
              
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
      // ถ้าอยู่ในโหมดกำลังเลือกโต๊ะเพื่อย้าย
      if (isMovingTable) {
        await executeMoveTable(item)
        return
      }

      const bill =
        item.table_status === 'occupied'
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
  );
  const available = table.filter(
    x => x.table_status === 'available'
  ).length

  const notavailable = table.length - available


  /* =====================================================
     BILL CODE
  ===================================================== */

  if (billId) {
    return (
      <ImageBackground
        source={require('../photo/addtable.webp')}
        style={style.content}
      >
        <View style={style.billcode}>
          <Text style={style.billcodetitle}>เปิดโต๊ะสำเร็จ</Text>
          <Text style={style.billcodename}>รหัสบิล</Text>
          <Text style={style.billid}>{billId}</Text>

          <Text style={style.billcodeinfo}>
            กรุณาแจ้งรหัสนี้ให้ลูกค้า
          </Text>

          <Text style={style.billcodeinfo}>
            เพื่อใช้เข้าสู่ระบบและสั่งอาหาร
          </Text>

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


  /* =====================================================
     SELECTED TABLE
  ===================================================== */

  if (selectedTable) {

    /* ================= MOVE TABLE SELECTION VIEW ================= */
    if (isMovingTable) {
      return (
        <ImageBackground
          source={require('../photo/TableMap.jpg')}
          style={style.content}
        >
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
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.red, backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 10 }}>
                กำลังย้ายจากโต๊ะ {selectedTable.table_name} - กรุณาเลือกโต๊ะว่างปลายทาง
              </Text>
            </View>

            <View style={style.middle}>
              {table.map(item => (
                <TableButton
                  key={item.table_id}
                  item={item}
                  onPress={selectTable}
                />
              ))}
            </View>
          </ScrollView>
        </ImageBackground>
      )
    }


    /* ================= HISTORY ================= */

    if (
      selectedTable.table_status === 'occupied' &&
      open === 'history'
    ) {

      const rounds = billOrders.reduce((arr, item) => {
        let round = arr.find(
          x => x.order_round_id === item.order_round_id
        )

        if (!round) {
          round = {
            order_round_id: item.order_round_id,
            round: item.round,
            order_at: item.order_at,
            items: []
          }
          arr.push(round)
        }

        round.items.push(item)
        return arr
      }, [])


      return (
        <ImageBackground
          source={require('../photo/historyorder.jpg')}
          style={style.content}
        >
          <View style={style.historyHeaderContainer}>
            <BackButton onPress={backToTableMap} />
            <View style={style.historyTitleBoxOnly}>
              <Text style={style.titlehistory}>ประวัติการสั่งอาหาร</Text>
            </View>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 220, paddingHorizontal: 15 }}
          >
            <View style={style.middlehistory}>

              {loadingHistory ? (
                <Text style={style.loadingText}>
                  กำลังโหลดข้อมูล...
                </Text>

              ) : rounds.length === 0 ? (
                <View style={style.emptyBox}>
                  <Text style={style.emptyText}>
                    ยังไม่มีรายการอาหาร
                  </Text>
                </View>

              ) : rounds.map(round => (

                <View
                  key={round.order_round_id}
                  style={style.orderCard}
                >

                  <View style={style.bill}>

                    <View style={style.rownotable}>
                      <Text style={style.notable}>
                        {selectedTable.table_name}
                      </Text>

                      <Text style={style.numround}>
                        รอบที่ {round.round} • {round.order_at ? round.order_at.slice(11, 16) : ''} น.
                      </Text>
                    </View>


                    <View style={style.columndata}>
                      <Text style={style.columnname1}>รายการอาหาร</Text>
                      <Text style={style.columnname2}>จำนวน</Text>
                      <Text style={style.columnname3}>หมายเหตุ</Text>
                      <Text style={style.columnname4}>สถานะ</Text>
                    </View>


                    <View style={style.listfood}>
                      {round.items.map(item => {
                        const isCancelled = item.status === 'ยกเลิก';
                        return (
                          <View
                            key={item.order_item_id}
                            style={[
                              style.list,
                              isCancelled && { backgroundColor: '#f9f9f9', opacity: 0.6 }
                            ]}
                          >
                            <View style={style.columnname1}>
                              <Text style={[isCancelled && { textDecorationLine: 'line-through', color: 'gray' }]}>
                                {item.menu_name}
                              </Text>
                              {isCancelled && item.cancelled_at && (
                                <Text style={{ fontSize: 10, color: 'red' }}>
                                  ยกเลิกเมื่อ: {item.cancelled_at}
                                </Text>
                              )}
                            </View>
                            <Text style={[style.columnname2, isCancelled && { textDecorationLine: 'line-through', color: 'gray' }]}>
                              {item.amount}
                            </Text>
                            <Text style={[style.columnname3, isCancelled && { textDecorationLine: 'line-through', color: 'gray' }]}>
                              {item.note || '-'}
                            </Text>
                            <Text style={[style.columnname4, { color: isCancelled ? 'red' : colors.red, fontWeight: 'bold' }]}>
                              {item.status}
                            </Text>
                          </View>
                        );
                      })}
                    </View>


                    <View style={style.roundTotal}>
                      <Text style={style.roundTotalText}>
                        รวมรอบนี้{' '}
                        {round.items.reduce(
                          (sum, item) =>
                            item.status === 'ยกเลิก'
                              ? sum
                              : sum + item.amount * item.unit_price,
                          0
                        ).toLocaleString()}
                        {' '}บาท
                      </Text>
                    </View>

                  </View>

                </View>
              ))}

            </View>
          </ScrollView>


          <View style={style.bottomopendata}>

            <View style={style.bottompay}>
              <View style={style.allbill}>

                <Text style={style.paytext}>
                  ยอดรวมทั้งหมด{' '}
                  {Number(billTotal).toLocaleString()}
                  {' '}บาท
                </Text>

                <TouchableOpacity
                  style={[
                    style.butpay,
                    { backgroundColor: isAllServed ? 'rgb(135, 84, 180)' : colors.dim }
                  ]}
                  onPress={() => {
                    if (!isAllServed) {
                      console.log('ไม่สามารถชำระเงินได้ เนื่องจากยังมีอาหารที่ยังไม่ได้เสิร์ฟ');
                      return;
                    }
                    payBill();
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


    /* ================= OCCUPIED ================= */

    if (selectedTable.table_status === 'occupied') {
      return (
        <ImageBackground
          source={require('../photo/addtable.webp')}
          style={style.content}
        >

          <BackButton onPress={backToTableMap} />

          <Header title={selectedTable.table_name} />

          <ScrollView
            contentContainerStyle={{ paddingBottom: 140 }}
          >

            <View style={style.contentopen}>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={style.billPageTitle}>
                  ข้อมูลโต๊ะ
                </Text>

                {/* ปุ่มย้ายโต๊ะ */}
                <TouchableOpacity
                  style={{ backgroundColor: colors.red, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                  onPress={() => setIsMovingTable(true)}
                >
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>ย้ายโต๊ะ</Text>
                </TouchableOpacity>
              </View>

              {selectedBill ? (
                <>
                  <InfoRow
                    title="รหัสบิล"
                    value={selectedBill.bill_id}
                  />

                  <InfoRow
                    title="ชื่อลูกค้า"
                    value={selectedBill.customer_name}
                  />

                  <InfoRow
                    title="จำนวนคน"
                    value={`${selectedBill.customer_count} คน`}
                  />

                  <InfoRow
                    title="เบอร์โทร"
                    value={selectedBill.phone}
                  />

                  <InfoRow
                    title="เวลาเปิดโต๊ะ"
                    value={selectedBill.open_at}
                  />

                  <InfoRow
                    title="สถานะ"
                    value={selectedBill.status}
                  />
                </>
              ) : (
                <Text style={style.noBillText}>
                  ไม่พบข้อมูลบิลของโต๊ะนี้
                </Text>
              )}

            </View>
          </ScrollView>


          <View style={style.bottomopendata}>
            <BottomTabs setOpen={openHistory} />
          </View>

        </ImageBackground>
      )
    }


    /* ================= AVAILABLE TABLE ================= */

    return (
      <ImageBackground
        source={require('../photo/addtable.webp')}
        style={style.content}
      >

        <BackButton onPress={backToTableMap} />

        <Header title={selectedTable.table_name} />

        <View style={style.contentopen}>

          <InputRow
            title="ชื่อ"
            value={customerName}
            onChangeText={setCustomerName}
          />

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

          <TouchableOpacity
            style={style.butopen}
            onPress={backToTableMap}
          >
            <Text style={style.textbut}>ยกเลิก</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={style.butopen}
            onPress={openTable}
          >
            <Text style={style.textbut}>เปิดโต๊ะ</Text>
          </TouchableOpacity>

        </View>

      </ImageBackground>
    )
  }


  /* =====================================================
     TABLE MAP (แก้ไขจัดวาง Layout หน้าหลัก)
  ===================================================== */

  return (
    <ImageBackground
      source={require('../photo/TableMap.jpg')}
      style={style.content}
    >
      <View style={style.mainHeaderContainer}>
        <BackButton onPress={() => changepage('Login')} />
        <View style={style.titleContainer}>
          <Text style={style.title}>Table</Text>
        </View>
        <View style={{ width: 45 }} />
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
            <TableButton
              key={item.table_id}
              item={item}
              onPress={selectTable}
            />
          ))}
        </View>
      </ScrollView>

      <View style={style.bottombar}>
        {['Table', 'Order', 'Menu', 'Account'].map(page => (
          <TouchableOpacity
            key={page}
            style={style.page}
            onPress={() => changepage(page)}
          >
            <Text style={style.titlepage}>
              {page}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

    </ImageBackground>
  )
}


/* =========================================================
   STYLE
========================================================= */

const style = StyleSheet.create({

  content: {
    flex: 1,
    paddingTop: 10
  },

  top: {
    alignItems: 'center',
    marginBottom: 5
  },

  titleContainer: {
    paddingLeft: 20, paddingRight: 20, borderRadius: 50 ,boxShadow: '0 0 10px rgba(0,0,0,0.5)',
  },

  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.red,
    textAlign: 'center'
  },

  mainHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 5
  },

  mainTitleBoxOnly: {
    flex: 1,
    alignItems: 'center'
  },

  backButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center'
  },

  back: {
    width: 35,
    height: 35,
    borderRadius: 17.5
  },

  table: {
    width: '30%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dim,
    borderColor: colors.red,
    borderWidth: 2,
    borderRadius: 30,
    marginBottom: 15
  },

  tablenull: {
    width: '30%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.red,
    borderColor: colors.red,
    borderWidth: 2,
    borderRadius: 50,
    marginBottom: 15
  },

  numtable: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text
  },

  middle: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 20,
    width: '100%',
    flexWrap: 'wrap'
  },

  statustable: {
    width: 280,
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'flex-start',

  },

  bottombar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5
  },

  page: {
    borderColor: colors.text,
    borderTopWidth: 2,
    borderWidth: 1,
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.red
  },

  titlepage: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold'
  },

  boxdata: {
    flexDirection: 'column',
    marginBottom: 5
  },

  box: {
    backgroundColor: colors.text,
    borderRadius: 20,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 10,
    minHeight: 45
  },

  contentopen: {
    padding: 20
  },

  bottomopen: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20
  },

  butopen: {
    backgroundColor: colors.red,
    padding: 10,
    borderRadius: 5,
    marginLeft: 15
  },

  textbut: {
    color: colors.text,
    fontSize: 15
  },

  textopen: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5
  },

  billPageTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.red,
    marginBottom: 20
  },

  infoText: {
    backgroundColor: colors.text,
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    fontSize: 18
  },

  noBillText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 30
  },

  billcode: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    margin: 20,
    borderRadius: 20,
    padding: 30
  },

  billcodetitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.red,
    marginBottom: 30
  },

  billcodename: {
    fontSize: 20,
    fontWeight: 'bold'
  },

  billid: {
    fontSize: 50,
    fontWeight: 'bold',
    color: colors.red,
    marginVertical: 20
  },

  billcodeinfo: {
    fontSize: 16,
    marginBottom: 5
  },

  tophistory: {
    alignItems: 'center',
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 5
  },

  historyHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 5
  },

  historyTitleBoxOnly: {
    flex: 1,
    alignItems: 'center'
  },

  titlehistory: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.red,
    textAlign: 'center'
  },

  middlehistory: {
    paddingBottom: 20
  },

  orderCard: {
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },

  bill: {
    marginBottom: 0
  },

  rownotable: {
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 8
  },

  notable: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },

  numround: {
    fontSize: 13,
    color: '#666',
    textAlign: 'right'
  },

  columndata: {
    flexDirection: 'row',
    borderColor: '#eee',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    paddingVertical: 8,
    backgroundColor: '#fafafa'
  },

  listfood: {
    paddingTop: 5
  },

  list: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0'
  },

  columnname1: {
    flex: 2,
    color: '#333',
    textAlign: 'left',
    paddingLeft: 5,
    fontSize: 14
  },

  columnname2: {
    flex: 0.8,
    color: '#333',
    textAlign: 'center',
    fontSize: 14
  },

  columnname3: {
    flex: 1.2,
    color: '#666',
    textAlign: 'center',
    fontSize: 13
  },

  columnname4: {
    flex: 1.2,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 'bold'
  },

  roundTotal: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 10,
    paddingTop: 8,
    alignItems: 'flex-end'
  },

  roundTotalText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333'
  },

  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 50,
    color: colors.text
  },

  emptyBox: {
    backgroundColor: colors.text,
    borderRadius: 15,
    padding: 30,
    marginTop: 30,
    alignItems: 'center'
  },

  emptyText: {
    fontSize: 18
  },

  bottomopendata: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },

  bottompay: {
    backgroundColor: 'white',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd'
  },

  allbill: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10
  },

  paytext: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },

  butpay: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20
  },

  pay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text
  },

  bottomopendata1: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd'
  },

  butswitch: {
    backgroundColor: colors.red,
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)'
  },

  textswitch: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold'
  }

})

export default TableMap