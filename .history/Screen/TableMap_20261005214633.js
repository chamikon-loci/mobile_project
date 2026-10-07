import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  TextInput,
  ScrollView
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


  useEffect(() => {
    ;(async () => {
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


  const selectTable = async item => {
    try {
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

          <ScrollView
            contentContainerStyle={{ paddingBottom: 190 }}
          >

            <BackButton onPress={backToTableMap} />

            <Header
              title="ประวัติการสั่งอาหาร"
              history
            />

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
                  style={style.order}
                >

                  <View style={style.bill}>

                    <View style={style.rownotable}>
                      <Text style={style.notable}>
                        {selectedTable.table_name}
                      </Text>

                      <Text style={style.numround}>
                        รอบที่ {round.round} เวลา {round.order_at}
                      </Text>
                    </View>


                    <View style={style.columndata}>
                     <View style={style.columndata}>
  <Text style={style.columnname1}>รายการอาหาร</Text>
  <Text style={style.columnname2}>จำนวน</Text>
  <Text style={style.columnname3}>หมายเหตุ</Text>
  <Text style={style.columnname4}>สถานะ</Text> 
</View>
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
        <Text style={[style.columnname1, isCancelled && { textDecorationLine: 'line-through', color: 'gray' }]}>
          {item.menu_name}
        </Text>
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
                  style={style.butpay}
                  onPress={payBill}
                >
                  <Text style={style.pay}>
                    ชำระเงิน
                  </Text>
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

              <Text style={style.billPageTitle}>
                ข้อมูลโต๊ะ
              </Text>

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
     TABLE MAP
  ===================================================== */

  return (
    <ImageBackground
      source={require('../photo/TableMap.jpg')}
      style={style.content}
    >

      <BackButton onPress={() => changepage('Login')} />

      <Header title="Table" />


      <View style={{ alignItems: 'center' }}>
        <View style={style.statustable}>
          <Text style={{ fontSize: 15 }}>
            จำนวนโต๊ะที่ว่าง : {available}
          </Text>

          <Text style={{ fontSize: 15 }}>
            จำนวนโต๊ะที่ไม่ว่าง : {notavailable}
          </Text>
        </View>
      </View>


      <View>
        <View style={style.middle}>
          {table.map(item => (
            <TableButton
              key={item.table_id}
              item={item}
              onPress={selectTable}
            />
          ))}
        </View>
      </View>


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
    paddingTop: 20
  },

  top: {
    alignItems: 'center',
    marginBottom: 10
  },

  titleContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 50
  },

  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: colors.red
  },

  backButton: {
    marginLeft: 10
  },

  back: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    left: 0
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
    marginBottom: 20
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
    marginBottom: 20
  },

  numtable: {
    fontSize: 30,
    color: colors.text
  },

  middle: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 30,
    flexWrap: 'wrap'
  },

  statustable: {
    width: 250,
    marginBottom: 20,
    backgroundColor: colors.text,
    borderRadius: 10,
    padding: 10
  },

  bottombar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },

  page: {
    borderColor: colors.text,
    borderTopWidth: 2,
    borderWidth: 1,
    flex: 1,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.red
  },

  titlepage: {
    color: colors.text,
    fontSize: 20,
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

  historyTitleBox: {
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 50
  },

  titlehistory: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.red,
    textAlign: 'center',
    lineHeight: 45,
    padding: 5
  },

  middlehistory: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },

  order: {
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15
  },

  bill: {
    marginBottom: 10
  },

  rownotable: {
    borderBottomColor: colors.bg,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8
  },

  notable: {
    fontSize: 18,
    fontWeight: 'bold'
  },

  numround: {
    fontSize: 12,
    color: colors.dim,
    flex: 1,
    textAlign: 'right',
    marginLeft: 10
  },

  columndata: {
    flexDirection: 'row',
    borderColor: colors.dim,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingVertical: 6
  },

  listfood: {
    paddingTop: 5
  },

  list: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 5,
    paddingBottom: 5
  },

  columnname1: {
    width: 100,
    color: colors.red,
    textAlign: 'center'
  },

  columnname2: {
    width: 55,
    color: colors.red,
    textAlign: 'center'
  },

  columnname3: {
    width: 70,
    color: colors.red,
    textAlign: 'center'
  },

  columnname4: {
    flex: 1,
    color: colors.red,
    textAlign: 'center'
  },

  roundTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.dim,
    marginTop: 8,
    paddingTop: 8,
    alignItems: 'flex-end'
  },

  roundTotalText: {
    fontWeight: 'bold',
    fontSize: 15
  },

  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 50
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
    backgroundColor: colors.text,
    padding: 10
  },

  allbill: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },

  paytext: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10
  },

  butpay: {
    backgroundColor: 'rgb(135, 84, 180)',
    borderRadius: 10,
    padding: 10
  },

  pay: {
    fontSize: 20,
    color: colors.text
  },

  bottomopendata1: {
    flexDirection: 'row',
    borderColor: colors.text,
    borderWidth: 2
  },

  butswitch: {
    backgroundColor: colors.red,
    flex: 1,
    padding: 20,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 2
  },

  textswitch: {
    fontSize: 15,
    color: colors.text,
    fontWeight: 'bold'
  }

})


export default TableMap