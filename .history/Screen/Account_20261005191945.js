import {
    View, StyleSheet, TouchableOpacity, Image, Text,
    ImageBackground, ScrollView, TextInput, Alert
} from "react-native"
import { colors } from "../src/style/theme"
import { useState, useEffect } from "react"
import { useSQLiteContext } from "expo-sqlite"
import {
    getDailySalesByCategory, getDailyTotal,
    getBestSellingMenus, getClosedBillsByDate
} from "../database/db"
import { formatBaht, parseDate, todayStr, addDays, showDate } from "../database/money"

function Account({ changepage }) {
    const db = useSQLiteContext()

    const [tab, settab] = useState('daily')

    // ข1 สรุปยอดขายรายวัน
    const [dailyDate, setDailyDate] = useState(showDate(todayStr()))
    const [byCategory, setByCategory] = useState([])
    const [dailyTotal, setDailyTotal] = useState(null)

    // ข6 อันดับเมนูขายดี (ช่วงวันที่)
    const [fromText, setFromText] = useState(showDate(addDays(todayStr(), -30)))
    const [toText, setToText] = useState(showDate(todayStr()))
    const [rank, setRank] = useState([])

    // ประวัติบิล
    const [historyDate, setHistoryDate] = useState(showDate(todayStr()))
    const [bills, setBills] = useState([])

    async function searchDaily() {
        const date = parseDate(dailyDate)
        if (!date) { Alert.alert('กรุณากรอกวันที่ให้ถูกต้อง', 'เช่น 05/10/2026'); return }
        try {
            setByCategory(await getDailySalesByCategory(db, date))
            setDailyTotal(await getDailyTotal(db, date))
        } catch (e) { console.log('โหลดยอดขายไม่สำเร็จ', e) }
    }

    async function searchRank() {
        const from = parseDate(fromText)
        const to = parseDate(toText)
        if (!from || !to) { Alert.alert('กรุณากรอกวันที่ให้ถูกต้อง', 'เช่น 05/10/2026'); return }
        if (from > to) { Alert.alert('วันที่เริ่มต้องไม่เกินวันที่สิ้นสุด'); return }
        try { setRank(await getBestSellingMenus(db, from, to)) }
        catch (e) { console.log('โหลดอันดับไม่สำเร็จ', e) }
    }

    async function searchBills() {
        const date = parseDate(historyDate)
        if (!date) { Alert.alert('กรุณากรอกวันที่ให้ถูกต้อง', 'เช่น 05/10/2026'); return }
        try { setBills(await getClosedBillsByDate(db, date)) }
        catch (e) { console.log('โหลดประวัติบิลไม่สำเร็จ', e) }
    }

    useEffect(() => { searchDaily(); searchRank(); searchBills() }, [db])

    const tabs = [['daily', 'สรุปยอดขายรายวัน'], ['rank', 'อันดับเมนูขายดี'], ['history', 'ประวัติบิล']]

    return (
        <ImageBackground source={require('../photo/res.avif')} style={styles.content}>
            <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => changepage('Login')}>
                <Image source={require('../photo/back.png')} style={styles.picback} />
            </TouchableOpacity>
            <View style={styles.top}>
                <View style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)', paddingHorizontal: 20, borderRadius: 50 }}>
                    <Text style={styles.title}>Account</Text>
                </View>
            </View>

            <View style={styles.table}>
                <View style={styles.column}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {tabs.map(([key, label]) => (
                            <TouchableOpacity
                                key={key}
                                style={[styles.category, tab === key && styles.categoryActive]}
                                onPress={() => settab(key)}
                            >
                                <Text style={styles.categoryname}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView style={styles.contentfood} contentContainerStyle={{ paddingBottom: 90 }}>
                    {tab === 'daily' && (
                        <View style={styles.pad}>
                            <Text style={styles.heading}>สรุปยอดขายรายวัน (แยกตามหมวดหมู่)</Text>
                            <View style={styles.searchRow}>
                                <TextInput style={styles.input} value={dailyDate} onChangeText={setDailyDate} placeholder="dd/mm/yyyy" />
                                <TouchableOpacity style={styles.butt} onPress={searchDaily}><Text style={styles.search}>ค้นหา</Text></TouchableOpacity>
                            </View>

                            <View style={styles.box}>
                                <View style={styles.rowHead}>
                                    <Text style={[styles.c1, styles.head]}>หมวดหมู่</Text>
                                    <Text style={[styles.c2, styles.head]}>จำนวน</Text>
                                    <Text style={[styles.c3, styles.head]}>ยอดขาย</Text>
                                </View>
                                {byCategory.length === 0 ? (
                                    <Text style={styles.empty}>ไม่มียอดขายในวันนี้</Text>
                                ) : byCategory.map(row => (
                                    <View key={row.category_id} style={styles.row}>
                                        <Text style={styles.c1}>{row.category_name}</Text>
                                        <Text style={styles.c2}>{row.quantity}</Text>
                                        <Text style={styles.c3}>{formatBaht(row.total_price)}</Text>
                                    </View>
                                ))}
                                {dailyTotal && (
                                    <View style={styles.summary}>
                                        <Text style={[styles.c1, styles.bold]}>รวม ({dailyTotal.bills} บิล)</Text>
                                        <Text style={[styles.c2, styles.bold]}>{dailyTotal.quantity}</Text>
                                        <Text style={[styles.c3, styles.bold]}>{formatBaht(dailyTotal.total_price)}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {tab === 'rank' && (
                        <View style={styles.pad}>
                            <Text style={styles.heading}>เมนูขายดี 10 อันดับ</Text>
                            <View style={styles.searchRow}>
                                <TextInput style={styles.inputSm} value={fromText} onChangeText={setFromText} placeholder="จาก dd/mm/yyyy" />
                                <Text style={{ marginHorizontal: 4 }}>ถึง</Text>
                                <TextInput style={styles.inputSm} value={toText} onChangeText={setToText} placeholder="ถึง dd/mm/yyyy" />
                                <TouchableOpacity style={styles.butt} onPress={searchRank}><Text style={styles.search}>ค้นหา</Text></TouchableOpacity>
                            </View>

                            <View style={styles.box}>
                                {rank.length === 0 ? (
                                    <Text style={styles.empty}>ไม่มีข้อมูลในช่วงวันที่นี้</Text>
                                ) : rank.map((row, i) => (
                                    <View key={row.menu_id} style={styles.row}>
                                        <Text style={styles.rankNo}>{i + 1}</Text>
                                        <Text style={styles.c1}>{row.menu_name}</Text>
                                        <Text style={styles.c2}>{row.quantity}</Text>
                                        <Text style={styles.c3}>{formatBaht(row.total_price)}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {tab === 'history' && (
                        <View style={styles.pad}>
                            <Text style={styles.heading}>ประวัติบิลที่ปิดแล้ว</Text>
                            <View style={styles.searchRow}>
                                <TextInput style={styles.input} value={historyDate} onChangeText={setHistoryDate} placeholder="dd/mm/yyyy" />
                                <TouchableOpacity style={styles.butt} onPress={searchBills}><Text style={styles.search}>ค้นหา</Text></TouchableOpacity>
                            </View>

                            {bills.length === 0 ? (
                                <View style={styles.box}><Text style={styles.empty}>ไม่มีบิลในวันนี้</Text></View>
                            ) : bills.map(b => (
                                <TouchableOpacity
                                    key={b.bill_id}
                                    style={styles.billRow}
                                    onPress={() => changepage('BillHistory', b.bill_id)}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.bold}>บิล {b.bill_id} • โต๊ะ {b.table_name}</Text>
                                        <Text style={styles.sub}>ปิดเมื่อ {b.close_at}</Text>
                                    </View>
                                    <Text style={styles.bold}>{formatBaht(b.total_price)} บาท ›</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>

            <View style={styles.bottombar}>
                {[['Table', 'TableMap'], ['Order', 'Order'], ['Menu', 'Menu'], ['Account', 'Account']].map(([label, p]) => (
                    <TouchableOpacity key={p} style={styles.page} onPress={() => changepage(p)}>
                        <Text style={styles.titlepage}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    content: { flex: 1, paddingTop: 20 },
    picback: { width: 50, height: 50, borderRadius: 25, position: 'absolute', left: 0 },
    top: { alignItems: 'center' },
    title: { fontSize: 50, fontWeight: 'bold', color: colors.red },
    bottombar: { flexDirection: 'row', position: 'absolute', bottom: 0, left: 0, right: 0 },
    page: {
        borderColor: colors.text, borderTopWidth: 2, borderWidth: 1, flex: 1, height: 70,
        alignItems: 'center', justifyContent: 'center', backgroundColor: colors.red
    },
    titlepage: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
    column: { flexDirection: 'row', backgroundColor: colors.text, marginTop: 15 },
    category: { borderColor: colors.red, borderWidth: 2, backgroundColor: colors.text, padding: 10 },
    categoryActive: { backgroundColor: 'rgba(253, 47, 129, 0.3)' },
    categoryname: { textAlign: 'center', fontSize: 18 },
    table: { flex: 1 },
    contentfood: { backgroundColor: 'rgba(253, 47, 129, 0.26)', flex: 1 },
    pad: { padding: 12 },
    heading: {
        fontSize: 20, color: colors.red, fontWeight: 'bold', textAlign: 'center',
        backgroundColor: colors.text, padding: 10, borderRadius: 8, marginBottom: 10
    },
    searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    input: {
        backgroundColor: colors.text, flex: 1, borderRadius: 20, paddingHorizontal: 15,
        marginRight: 8, boxShadow: '0 0 8px rgba(0,0,0,0.5)'
    },
    inputSm: {
        backgroundColor: colors.text, flex: 1, borderRadius: 20, paddingHorizontal: 10,
        boxShadow: '0 0 8px rgba(0,0,0,0.5)'
    },
    butt: { padding: 8, paddingHorizontal: 14, backgroundColor: colors.text, marginLeft: 6, borderRadius: 5 },
    search: { color: colors.red, fontWeight: 'bold', fontSize: 15 },
    box: { backgroundColor: colors.text, padding: 10, borderRadius: 10, boxShadow: '0 0 8px rgba(0,0,0,0.5)' },
    rowHead: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.dim, paddingBottom: 6 },
    row: { flexDirection: 'row', paddingVertical: 6, alignItems: 'center' },
    summary: { flexDirection: 'row', borderTopWidth: 1, borderColor: colors.dim, marginTop: 6, paddingTop: 8 },
    head: { color: colors.red, fontWeight: 'bold' },
    bold: { fontWeight: 'bold' },
    c1: { flex: 3 },
    c2: { flex: 1, textAlign: 'center' },
    c3: { flex: 2, textAlign: 'right' },
    rankNo: { width: 28, fontWeight: 'bold', fontSize: 18, color: colors.red },
    empty: { textAlign: 'center', padding: 15, color: colors.dim },
    billRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.text,
        padding: 12, borderRadius: 10, marginBottom: 8
    },
    sub: { fontSize: 12, color: colors.dim }
})

export default Account