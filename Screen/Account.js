import {
  View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground,
  ScrollView, TextInput
} from "react-native"
import { colors } from "../src/style/theme"
import { useState } from "react"
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite"
import {
  DATABASE_NAME, openDATABASE, getDailySales, getBestSellingMenus,
  getAllClosedBills, getBillHistoryByDate, getAllCategories
} from "../database/db"

function Account({ changepage }) {
  return <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
    <AccountScreen changepage={changepage} />
  </SQLiteProvider>
}

function AccountScreen({ changepage }) {
  const db = useSQLiteContext()
  const [day, setDay] = useState(''), [month, setMonth] = useState(''), [year, setYear] = useState('')
  const [dailySales, setDailySales] = useState([]), [rankSales, setRankSales] = useState([])
  const [billHistory, setBillHistory] = useState([]), [tab, settab] = useState('daily')
  const [datadaily, setdatadaily] = useState('empty'), [categorySales, setCategorySales] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')

  function turnIntoDate() {
    if (!day || !month || !year) return null
    let y = Number(year), m = Number(month), d = Number(day)
    if (y > 2400) y -= 543
    if (d < 1 || d > 31 || m < 1 || m > 12) return null
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  async function searchDaily() {
    const date = turnIntoDate()
    if (!date) return console.log("กรุณากรอกวันที่ให้ถูกต้อง")
    try {
      const resultItems = await getDailySales(db, date)
      setDailySales(resultItems || [])
      const resultCategories = await getAllCategories(db)
      setCategorySales(resultCategories || [])
      setSelectedCategory('All')
      setdatadaily(resultItems?.length ? 'datadaily' : 'empty')
    } catch (error) {
      console.log("โหลดข้อมูลยอดขายไม่สำเร็จ", error)
      setdatadaily('empty')
    }
  }

  async function searchRank() {
    const date = turnIntoDate()
    if (!date) return console.log("กรุณากรอกวันที่ให้ถูกต้อง")
    try {
      setRankSales(await getBestSellingMenus(db, date) || [])
    } catch (error) {
      console.log("โหลดอันดับเมนูไม่สำเร็จ", error)
    }
  }

  async function searchBill(isAll = false) {
    try {
      let result
      if (isAll) result = await getAllClosedBills(db)
      else {
        const date = turnIntoDate()
        if (!date) return console.log('กรุณากรอกวันที่ให้ถูกต้อง')
        result = await getBillHistoryByDate(db, date)
      }
      setBillHistory(result || [])
    } catch (error) {
      console.log('ค้นหาข้อมูลประวัติบิลไม่ได้', error)
    }
  }

  const filteredDailySales = dailySales.filter(item =>
    selectedCategory === 'All' || (item.category_name || 'อื่นๆ') === selectedCategory
  )
  const totalQuantity = filteredDailySales.reduce((s, i) => s + Number(i.quantity || 0), 0)
  const totalPrice = filteredDailySales.reduce((s, i) => s + Number(i.total_price || 0), 0)

  const dates = <View style={styles.dateRowContainer}>
    {[
      ['วัน', day, setDay, '02'],
      ['เดือน', month, setMonth, '05'],
      ['ปี', year, setYear, '2569']
    ].map(([label, value, setter, placeholder]) =>
      <View style={styles.dateInputWrapper} key={label}>
        <Text style={styles.topicSmall}>{label}</Text>
        <TextInput
          style={styles.inputInline}
          placeholder={placeholder}
          keyboardType="numeric"
          value={value}
          onChangeText={setter}
        />
      </View>
    )}
  </View>

  const searchBox = (text, onPress, extra = null) => <TouchableOpacity
    style={extra || styles.fullWidthButt} onPress={onPress}>
    <Text style={styles.search}>{text}</Text>
  </TouchableOpacity>

  const dateForm = (text, onPress, buttons = false) => <View style={styles.top2daily}>
    <View style={styles.top3daily}>
      <Text style={styles.red17}>{text}</Text>
    </View>
    {dates}
    {buttons ?
      <View style={styles.actionButtonContainer}>
        {searchBox('ค้นหาตามวันที่', () => searchBill(false), styles.butt)}
        {searchBox('ดูบิลทั้งหมด', () => searchBill(true), styles.butt)}
      </View> :
      searchBox(text === 'กรอกข้อมูลวันที่ (วัน / เดือน / ปี)' ? 'ค้นหาข้อมูลยอดขาย' : 'ค้นหา 10 อันดับเมนูขายดี', onPress)}
  </View>

  return <ImageBackground source={require('../photo/res.avif')} style={styles.content}>
    <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => changepage('Login')}>
      <Image source={require('../photo/back.png')} style={styles.picback} />
    </TouchableOpacity>

    <View style={styles.top}>
      <View style={styles.titleContainer}><Text style={styles.title}>Account</Text></View>
    </View>

    <View style={styles.table}>
      <View style={styles.column}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            ['daily', 'สรุปยอดขายรายวัน'],
            ['rank', 'อันดับเมนูขายดี'],
            ['history', 'ประวัติบิล']
          ].map(([key, text]) =>
            <TouchableOpacity key={key} style={styles.category} onPress={() => settab(key)}>
              <Text style={styles.categoryname}>{text}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <View style={styles.contentfood}>
        {tab === 'daily' ? <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
          <View>
            <View style={styles.topdaily}><Text style={styles.titledaily}>สรุปยอดขายรายวัน</Text></View>
            <View style={styles.contentdaily}>
              {dateForm('กรอกข้อมูลวันที่ (วัน / เดือน / ปี)', searchDaily)}
              {datadaily === 'datadaily' ? <View style={styles.contentdata}>
                <View style={styles.framedata2}>
                  <View style={styles.topdata}><Text style={styles.titledata}>รายได้ทั้งหมด</Text></View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
                    {['All', ...categorySales.map(c => c.category_name || 'อื่นๆ')].map(cat =>
                      <TouchableOpacity
                        key={cat}
                        style={[styles.filterBtn, selectedCategory === cat && styles.filterBtnActive]}
                        onPress={() => setSelectedCategory(cat)}>
                        <Text style={[styles.filterBtnText, selectedCategory === cat && styles.filterBtnTextActive]}>
                          {cat === 'All' ? 'อาหารทั้งหมด' : cat}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>

                  <View>
                    <View style={styles.columndata}>
                      <Text style={styles.columnname1}>รายการอาหาร</Text>
                      <Text style={styles.columnname2}>ราคา</Text>
                      <Text style={styles.columnname3}>จำนวน</Text>
                      <Text style={styles.columnname4}>ราคารวม</Text>
                    </View>
                    <View style={styles.listfood}>
                      {filteredDailySales.length ?
                        filteredDailySales.map((item, index) =>
                          <View style={styles.list} key={index}>
                            <Text style={styles.columnname1}>{item.menu_name}</Text>
                            <Text style={styles.columnname2}>{Number(item.unit_price || 0).toFixed(2)}</Text>
                            <Text style={styles.columnname3}>{item.quantity}</Text>
                            <Text style={styles.columnname4}>{Number(item.total_price || 0).toFixed(2)}</Text>
                          </View>
                        ) :
                        <View style={{ padding: 20, alignItems: 'center' }}>
                          <Text style={{ color: colors.red, fontSize: 16 }}>ไม่มีข้อมูลในหมวดหมู่นี้</Text>
                        </View>
                      }
                      <View style={styles.summary}>
                        <Text style={styles.columnname1}>รวมทั้งหมด</Text>
                        <Text style={styles.columnname2}>-</Text>
                        <Text style={styles.columnname3}>{totalQuantity}</Text>
                        <Text style={styles.columnname4}>{totalPrice.toFixed(2)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View> : <View style={styles.contentdata}>
                <View style={styles.framedata}><Text style={styles.emptyText}>ยังไม่มีข้อมูล</Text></View>
              </View>}
            </View>
          </View>
        </ScrollView> : tab === 'rank' ? <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.topdaily}><Text style={styles.titledaily}>10 อันดับเมนูขายดี</Text></View>
          <View style={styles.contentdaily}>
            {dateForm('กรอกข้อมูลวันที่ (วัน / เดือน / ปี)', searchRank)}
          </View>

          <View style={styles.contentrank}>
            {rankSales.length ? (
              rankSales.map((item, index) => (
                <View key={item.menu_id || index} style={styles.framerank}>


                  <View style={styles.picrank}>
                    <Image
                      source={item.image ? { uri: item.image } : require('../photo/cate.jpg')}
                      style={styles.pic}
                    />
                  </View>


                  <View style={styles.datarank}>
                    <Text style={styles.rank}>อันดับ {index + 1}</Text>

                    <View style={styles.rowDetail}>
                      <Text style={styles.labelData}>Name :</Text>
                      <Text style={styles.datafood}>{item.menu_name}</Text>
                    </View>

                    <View style={styles.rowDetail}>
                      <Text style={styles.labelData}>Price :</Text>
                      <Text style={styles.datafood}>{item.unit_price}</Text>
                    </View>

                    <View style={styles.rowDetail}>
                      <Text style={styles.labelData}>ขาย :</Text>
                      <Text style={styles.datafood}>{item.quantity} รายการ</Text>
                    </View>

                    <View style={styles.rowDetail}>
                      <Text style={styles.labelData}>ยอดขาย :</Text>
                      <Text style={styles.datafood}>{item.total_price}</Text>
                    </View>
                  </View>

                </View>
              ))
            ) : (
              <View style={styles.framedata}>
                <Text style={styles.emptyText}>ไม่มีข้อมูลในช่วงเวลานี้</Text>
              </View>
            )}
          </View>
        </ScrollView> : <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
          <View style={styles.topdaily}><Text style={styles.titledaily}>ประวัติบิลย้อนหลัง</Text></View>
          <View style={styles.contentdaily}>
            {dateForm('กรอกข้อมูลวันที่ หรือกดดูบิลทั้งหมด', null, true)}
          </View>

          {billHistory.length ? <View style={styles.areabill}>
            {billHistory.map((item, index) => {
              const unitPrice = Number(item.unit_price || item.price || 0)
              const amount = Number(item.amount || item.quantity || 1)
              const total = Number(item.total_price || (unitPrice * amount))
              return <View style={styles.order} key={index}>
                <View style={styles.rowtitlebill}>
                  <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Bill</Text>
                  <Text style={styles.numbill}>รหัสบิล : {item.bill_id}</Text>
                  <Text style={styles.numbill}>โต๊ะ : {item.table_name || '-'}</Text>
                  <Text style={styles.numbill}>เวลาเปิด : {item.open_at}</Text>
                  <Text style={styles.numbill}>เวลาปิด : {item.close_at || '-'}</Text>
                </View>
                <View style={styles.bill}>
                  <View style={styles.columndata}>
                    <Text style={styles.columnname1}>รายการอาหาร</Text>
                    <Text style={styles.columnname2}>ราคา</Text>
                    <Text style={styles.columnname3}>จำนวน</Text>
                    <Text style={styles.columnname4}>ราคารวม</Text>
                  </View>
                  <View style={styles.listfood}><View style={styles.list}>
                    <Text style={styles.columnname1}>{item.menu_name}</Text>
                    <Text style={styles.columnname2}>{unitPrice.toFixed(2)}</Text>
                    <Text style={styles.columnname3}>{amount}</Text>
                    <Text style={styles.columnname4}>{total.toFixed(2)}</Text>
                  </View></View>
                </View>
                <View style={styles.summarybill}><Text style={styles.allbill}>รวม : {total.toFixed(2)}</Text></View>
              </View>
            })}
          </View> : <View style={styles.contentdata}>
            <View style={styles.framedata}><Text style={styles.emptyText}>ยังไม่มีข้อมูลบิล</Text></View>
          </View>}
        </ScrollView>}
      </View>
    </View>

    <View style={styles.bottombar}>
      {[
        ['Table', 'TableMap'], ['Order', 'Order'], ['Menu', 'Menu'], ['Account', 'Account'],['Promotion', 'Promotion']
      ].map(([text, page]) =>
        <TouchableOpacity key={page} style={styles.page} onPress={() => changepage(page)}>
          <Text style={styles.titlepage}>{text}</Text>
        </TouchableOpacity>
      )}
    </View>
  </ImageBackground>
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingTop: 20 },
  picback: { width: 50, height: 50, borderRadius: 25, position: 'absolute', left: 0 },
  top: { alignItems: 'center' },
  titleContainer: { paddingLeft: 20, paddingRight: 20, borderRadius: 50, boxShadow: '0 0 10px rgba(0,0,0,0.5)' },
  title: { fontSize: 50, fontWeight: 'bold', color: colors.red },
  bottombar: { flexDirection: 'row', justifyContent: 'space-around', position: 'absolute', bottom: 0, width: '100%' },
  page: { borderColor: colors.text, borderTopWidth: 2, borderWidth: 1, flex: 4, height: 70, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.red },
  titlepage: { color: colors.text, fontSize: 15, fontWeight: 'bold' },
  column: { flexDirection: 'row', backgroundColor: colors.text, marginTop: 15, justifyContent: 'space-between' },
  category: { borderColor: colors.red, borderWidth: 2, backgroundColor: colors.text, flex: 1, padding: 10 },
  categoryname: { textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  contentfood: { backgroundColor: 'rgba(253, 47, 129, 0.26)', flex: 1 },
  table: { flex: 1 },
  topdaily: { alignItems: 'center', backgroundColor: colors.text, padding: 10, marginTop: 1, borderRadius: 6 },
  titledaily: { fontSize: 20, color: colors.red, fontWeight: 'bold' },
  dateRowContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  dateInputWrapper: { flex: 1, marginHorizontal: 4 },
  topicSmall: { color: '#000', fontWeight: 'bold', fontSize: 13, marginBottom: 2, textAlign: 'center' },
  inputInline: { backgroundColor: colors.text, borderRadius: 15, paddingHorizontal: 10, height: 40, textAlign: 'center', fontSize: 14 },
  top2daily: { padding: 10, marginTop: 5, borderRadius: 6 },
  top3daily: { alignItems: 'center', backgroundColor: colors.text, padding: 8, marginTop: 5, borderRadius: 25, marginBottom: 8 },
  red17: { color: colors.red, fontSize: 17, fontWeight: 'bold' },
  fullWidthButt: { padding: 12, backgroundColor: colors.text, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  butt: { padding: 12, backgroundColor: colors.text, borderRadius: 8, justifyContent: 'center', alignItems: 'center', flex: 1, marginHorizontal: 4 },
  actionButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, width: '100%' },
  search: { color: colors.red, fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  framedata: { backgroundColor: colors.text, padding: 5, alignItems: 'center', justifyContent: 'center', borderRadius: 10, height: 60 },
  contentdata: { padding: 15 },
  titledata: { fontSize: 20, color: colors.red, fontWeight: 'bold' },
  columndata: { flexDirection: 'row', borderColor: '#ccc', borderBottomWidth: 1, justifyContent: 'space-between', borderTopWidth: 1, paddingVertical: 5 },
  topdata: { alignItems: 'center', paddingBottom: 5 },
  framedata2: { backgroundColor: colors.text, padding: 10, borderRadius: 10 },
  list: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 5 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', borderColor: '#ccc', borderTopWidth: 1, marginTop: 5, paddingTop: 5 },
  columnname1: { width: 100, color: colors.red, textAlign: 'center' },
  columnname2: { width: 70, color: colors.red, textAlign: 'center' },
  columnname3: { width: 60, color: colors.red, textAlign: 'center' },
  columnname4: { flex: 1, color: colors.red, textAlign: 'center' },
  contentrank: { marginTop: 20, paddingHorizontal: 15 },
  framerank: {
    backgroundColor: colors.text,
    flexDirection: 'row',
    borderRadius: 2,
    padding: 10,
    alignItems: 'flex-start'
  },

  pic: { width: 100, height: 140, borderRadius: 10, resizeMode: 'cover' },
  picrank: { justifyContent: 'center', marginRight: 10 },
  datarank: { flex: 1, justifyContent: 'center' },
  rank: { fontSize: 18, fontWeight: 'bold', color: colors.red, marginBottom: 5 },
  order: { justifyContent: 'center', marginTop: 20, backgroundColor: 'white', borderRadius: 15, padding: 15 },
  areabill: { paddingLeft: 10, paddingRight: 10 },
  rowtitlebill: { alignItems: 'center', marginBottom: 10 },
  numbill: { fontSize: 14, color: '#333' },
  bill: { marginBottom: 10 },
  summarybill: { alignItems: 'flex-end', paddingRight: 5, borderTopWidth: 1, borderColor: '#eee', paddingTop: 5 },
  allbill: { fontSize: 18, fontWeight: 'bold', color: colors.red },
  noData: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  noDataText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  emptyText: { color: colors.red, fontSize: 18, textAlign: 'center' },
  filterBtn: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#f2f2f2', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: colors.red },
  filterBtnActive: { backgroundColor: colors.red },
  filterBtnText: { color: colors.red, fontWeight: 'bold', fontSize: 14 },
  filterBtnTextActive: { color: colors.text },
  rankItemContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 10,
  },
  rowDetail: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  labelData: {
    width: 70,
    color: '#666',
    fontWeight: '600',
  },
  datafood: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  datarank: { flex: 1 },
})

export default Account
