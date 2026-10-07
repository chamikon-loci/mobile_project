import {
    View, Text, StyleSheet, TouchableOpacity, ImageBackground,
    Image, TextInput, ScrollView, Alert
} from 'react-native'
import { colors } from '../src/style/theme'
import { useState, useEffect } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import {
    getAllTable, openBill, getOpenBillByTable, getBillOrders, getBillTotal,
    closeBill, moveTable, splitBill, resetSalesData, ITEM_STATUS
} from '../database/db'
import { formatBaht } from '../database/money'

function Frame({ bg, title, onBack, children }) {
    return (
        <ImageBackground source={bg} style={s.content}>
            <TouchableOpacity style={s.backButton} onPress={onBack}>
                <Image source={require('../photo/back.png')} style={s.back} />
            </TouchableOpacity>
            <View style={s.top}>
                <View style={s.titleContainer}>
                    <Text style={s.title}>{title}</Text>
                </View>
            </View>
            {children}
        </ImageBackground>
    )
}

function TableMap({ changepage }) {
    const db = useSQLiteContext()

    const [tables, setTables] = useState([])
    const [view, setView] = useState('map') // map | open | info | history | move | split | opened
    const [selectedTable, setSelectedTable] = useState(null)
    const [selectedBill, setSelectedBill] = useState(null)
    const [newBillId, setNewBillId] = useState(null)

    const [customerName, setCustomerName] = useState('')
    const [customerCount, setCustomerCount] = useState('')
    const [phone, setPhone] = useState('')

    const [billOrders, setBillOrders] = useState([])
    const [billTotal, setBillTotal] = useState(0)

    const [splitSel, setSplitSel] = useState([])
    const [targetTable, setTargetTable] = useState(null)

    async function refreshTables() {
        try { setTables(await getAllTable(db)) }
        catch (e) { console.log('โหลดข้อมูลโต๊ะไม่สำเร็จ', e) }
    }

    useEffect(() => { refreshTables() }, [db])

    function backToMap() {
        setView('map')
        setSelectedTable(null)
        setSelectedBill(null)
        setCustomerName(''); setCustomerCount(''); setPhone('')
        setBillOrders([]); setBillTotal(0)
        setSplitSel([]); setTargetTable(null)
        refreshTables()
    }

    async function selectTable(item) {
        try {
            if (item.table_status === 'occupied') {
                setSelectedBill((await getOpenBillByTable(db, item.table_id)) || null)
                setSelectedTable(item)
                setView('info')
            } else {
                setSelectedBill(null)
                setSelectedTable(item)
                setView('open')
            }
        } catch (e) {
            console.log('โหลดข้อมูลบิลไม่สำเร็จ', e)
        }
    }

    async function openTable() {
        if (!selectedTable) return
        if (!customerName.trim()) { Alert.alert('กรุณากรอกชื่อลูกค้า'); return }
        if (Number(customerCount) <= 0) { Alert.alert('กรุณากรอกจำนวนลูกค้า'); return }

        try {
            const bill = await openBill(
                db, selectedTable.table_id, customerName.trim(),
                Number(customerCount), phone.trim()
            )
            setNewBillId(bill.bill_id)
            setView('opened')
            setCustomerName(''); setCustomerCount(''); setPhone('')
            await refreshTables()
        } catch (e) {
            Alert.alert('เปิดโต๊ะไม่สำเร็จ', String(e.message || e))
        }
    }

    async function loadHistory() {
        if (!selectedBill) return
        try {
            setBillOrders(await getBillOrders(db, selectedBill.bill_id))
            setBillTotal(await getBillTotal(db, selectedBill.bill_id))
        } catch (e) {
            console.log('โหลดประวัติไม่สำเร็จ', e)
        }
    }

    async function openHistory() { setView('history'); await loadHistory() }
    async function openSplit() { setSplitSel([]); setTargetTable(null); setView('split'); await loadHistory() }

    function confirmPay() {
        if (!selectedBill) return
        Alert.alert('ชำระเงิน', `ปิดบิล ยอดรวม ${formatBaht(billTotal)} บาท ใช่หรือไม่?`, [
            { text: 'ยกเลิก', style: 'cancel' },
            {
                text: 'ชำระเงิน',
                onPress: async () => {
                    try {
                        await closeBill(db, selectedBill.bill_id)
                        backToMap()
                    } catch (e) {
                        Alert.alert('ชำระเงินไม่สำเร็จ', String(e.message || e))
                    }
                }
            }
        ])
    }

    async function doMove(target) {
        try {
            await moveTable(db, selectedBill.bill_id, target.table_id)
            Alert.alert('ย้ายโต๊ะสำเร็จ', `ย้ายไป ${target.table_name} แล้ว`)
            backToMap()
        } catch (e) {
            Alert.alert('ย้ายโต๊ะไม่สำเร็จ', String(e.message || e))
        }
    }

    function toggleSplit(id) {
        setSplitSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    async function doSplit() {
        try {
            const bill = await splitBill(db, selectedBill.bill_id, splitSel, targetTable.table_id)
            await refreshTables()
            setNewBillId(bill.bill_id)
            setView('opened')
        } catch (e) {
            Alert.alert('แยกบิลไม่สำเร็จ', String(e.message || e))
        }
    }

    function confirmReset() {
        Alert.alert(
            'ล้างข้อมูลการขาย',
            'ลบบิลและออร์เดอร์ทั้งหมด และคืนโต๊ะเป็นว่าง (เมนูยังอยู่) ต้องการดำเนินการต่อหรือไม่?',
            [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                    text: 'ล้างข้อมูล',
                    style: 'destructive',
                    onPress: async () => {
                        try { await resetSalesData(db); await refreshTables() }
                        catch (e) { console.log('ล้างข้อมูลไม่สำเร็จ', e) }
                    }
                }
            ]
        )
    }

    const available = tables.filter(t => t.table_status === 'available')
    const notAvailableCount = tables.length - available.length

    // จัดกลุ่มรายการตามรอบ (จัดหน้าจอเท่านั้น)
    const rounds = []
    billOrders.forEach(item => {
        let r = rounds.find(x => x.order_round_id === item.order_round_id)
        if (!r) {
            r = { order_round_id: item.order_round_id, round: item.round, order_at: item.order_at, round_total: item.round_total, items: [] }
            rounds.push(r)
        }
        r.items.push(item)
    })

    const bgAdd = require('../photo/addtable.webp')

    /* ---------- เปิดโต๊ะ/แยกบิลสำเร็จ ---------- */
    if (view === 'opened') {
        return (
            <ImageBackground source={bgAdd} style={s.content}>
                <View style={s.billcode}>
                    <Text style={s.billcodetitle}>สำเร็จ</Text>
                    <Text style={s.billcodename}>รหัสบิล</Text>
                    <Text style={s.billid}>{newBillId}</Text>
                    <Text style={s.billcodeinfo}>แจ้งรหัสนี้ให้ลูกค้าเพื่อเข้าสั่งอาหาร</Text>
                    <TouchableOpacity style={s.butopen} onPress={backToMap}>
                        <Text style={s.textbut}>กลับหน้าหลัก</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        )
    }

    /* ---------- ฟอร์มเปิดโต๊ะ ---------- */
    if (view === 'open' && selectedTable) {
        return (
            <Frame bg={bgAdd} title={selectedTable.table_name} onBack={backToMap}>
                <View style={s.contentopen}>
                    <Text style={s.textopen}>ชื่อ</Text>
                    <TextInput style={s.box} value={customerName} onChangeText={setCustomerName} />
                    <Text style={s.textopen}>จำนวนคน</Text>
                    <TextInput style={s.box} value={customerCount} onChangeText={setCustomerCount} keyboardType="numeric" />
                    <Text style={s.textopen}>เบอร์โทร</Text>
                    <TextInput style={s.box} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
                <View style={s.bottomopen}>
                    <TouchableOpacity style={s.butopen} onPress={backToMap}><Text style={s.textbut}>ยกเลิก</Text></TouchableOpacity>
                    <TouchableOpacity style={s.butopen} onPress={openTable}><Text style={s.textbut}>เปิดโต๊ะ</Text></TouchableOpacity>
                </View>
            </Frame>
        )
    }

    /* ---------- ข้อมูลโต๊ะที่มีบิล ---------- */
    if (view === 'info' && selectedTable) {
        const rows = selectedBill ? [
            ['รหัสบิล', selectedBill.bill_id],
            ['ชื่อลูกค้า', selectedBill.customer_name || '-'],
            ['จำนวนคน', selectedBill.customer_count ? `${selectedBill.customer_count} คน` : '-'],
            ['เบอร์โทร', selectedBill.phone || '-'],
            ['เวลาเปิดโต๊ะ', selectedBill.open_at],
            ['สถานะ', selectedBill.status]
        ] : []
        return (
            <Frame bg={bgAdd} title={selectedTable.table_name} onBack={backToMap}>
                <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
                    <View style={s.contentopen}>
                        <Text style={s.billPageTitle}>ข้อมูลโต๊ะ</Text>
                        {selectedBill ? rows.map(([k, v]) => (
                            <View key={k} style={{ marginBottom: 5 }}>
                                <Text style={s.textopen}>{k}</Text>
                                <Text style={s.infoText}>{String(v)}</Text>
                            </View>
                        )) : <Text style={s.noBillText}>ไม่พบข้อมูลบิลของโต๊ะนี้</Text>}
                    </View>
                </ScrollView>
                <View style={s.bottomfix}>
                    <TouchableOpacity style={s.butswitch} onPress={openHistory}><Text style={s.textswitch}>ประวัติ/ชำระเงิน</Text></TouchableOpacity>
                    <TouchableOpacity style={s.butswitch} onPress={() => setView('move')}><Text style={s.textswitch}>ย้ายโต๊ะ</Text></TouchableOpacity>
                    <TouchableOpacity style={s.butswitch} onPress={openSplit}><Text style={s.textswitch}>แยกบิล</Text></TouchableOpacity>
                </View>
            </Frame>
        )
    }

    /* ---------- ประวัติการสั่ง + ชำระเงิน ---------- */
    if (view === 'history' && selectedTable) {
        return (
            <ImageBackground source={require('../photo/historyorder.jpg')} style={s.content}>
                <ScrollView contentContainerStyle={{ paddingBottom: 190 }}>
                    <TouchableOpacity style={s.backButton} onPress={() => setView('info')}>
                        <Image source={require('../photo/back.png')} style={s.back} />
                    </TouchableOpacity>
                    <View style={s.tophistory}>
                        <View style={s.historyTitleBox}><Text style={s.titlehistory}>ประวัติการสั่งอาหาร</Text></View>
                    </View>
                    <View style={s.middlehistory}>
                        {rounds.length === 0 ? (
                            <View style={s.emptyBox}><Text style={s.emptyText}>ยังไม่มีรายการอาหาร</Text></View>
                        ) : rounds.map(round => (
                            <View key={round.order_round_id} style={s.order}>
                                <View style={s.rownotable}>
                                    <Text style={s.notable}>{selectedTable.table_name}</Text>
                                    <Text style={s.numround}>รอบที่ {round.round} เวลา {round.order_at}</Text>
                                </View>
                                {round.items.map(item => {
                                    const cancelled = item.status === ITEM_STATUS.CANCELLED
                                    return (
                                        <View key={item.order_item_id} style={s.list}>
                                            <Text style={[s.c1, cancelled && s.strike]}>{item.menu_name}{item.note ? `\n(${item.note})` : ''}</Text>
                                            <Text style={[s.c2, cancelled && s.strike]}>x{item.amount}</Text>
                                            <Text style={[s.c3, cancelled && s.strike]}>{formatBaht(item.line_total)}</Text>
                                            <Text style={s.c4}>{item.status}</Text>
                                        </View>
                                    )
                                })}
                                <View style={s.roundTotal}>
                                    <Text style={s.roundTotalText}>รวมรอบนี้ {formatBaht(round.round_total)} บาท</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
                <View style={s.bottomfix}>
                    <View style={s.bottompay}>
                        <View style={s.allbill}>
                            <Text style={s.paytext}>ยอดรวมทั้งหมด {formatBaht(billTotal)} บาท</Text>
                            <TouchableOpacity style={s.butpay} onPress={confirmPay}><Text style={s.pay}>ชำระเงิน</Text></TouchableOpacity>
                        </View>
                    </View>
                    <View style={s.bottomRow}>
                        <TouchableOpacity style={s.butswitch} onPress={() => setView('info')}><Text style={s.textswitch}>ข้อมูลโต๊ะ</Text></TouchableOpacity>
                        <TouchableOpacity style={s.butswitch} onPress={loadHistory}><Text style={s.textswitch}>รีเฟรช</Text></TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        )
    }

    /* ---------- ข4: ย้ายโต๊ะ ---------- */
    if (view === 'move' && selectedTable) {
        return (
            <Frame bg={bgAdd} title="ย้ายโต๊ะ" onBack={() => setView('info')}>
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <Text style={s.billPageTitle}>ย้ายจาก {selectedTable.table_name} ไปโต๊ะ</Text>
                    {available.length === 0 && <Text style={s.noBillText}>ไม่มีโต๊ะว่าง</Text>}
                    <View style={s.middle}>
                        {available.map(t => (
                            <TouchableOpacity key={t.table_id} style={s.tablenull} onPress={() => doMove(t)}>
                                <Text style={s.numtable}>{t.table_name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </Frame>
        )
    }

    /* ---------- ข4: แยกบิล ---------- */
    if (view === 'split' && selectedTable) {
        const splittable = billOrders.filter(i => i.status !== ITEM_STATUS.CANCELLED)
        return (
            <Frame bg={bgAdd} title="แยกบิล" onBack={() => setView('info')}>
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
                    <Text style={s.billPageTitle}>1) เลือกรายการที่จะแยก</Text>
                    {splittable.length === 0 && <Text style={s.noBillText}>ไม่มีรายการให้แยก</Text>}
                    {splittable.map(item => {
                        const on = splitSel.includes(item.order_item_id)
                        return (
                            <TouchableOpacity
                                key={item.order_item_id}
                                style={[s.splitItem, on && s.splitItemOn]}
                                onPress={() => toggleSplit(item.order_item_id)}
                            >
                                <Text style={{ flex: 1 }}>{on ? '☑ ' : '☐ '}รอบ {item.round}: {item.menu_name} x{item.amount}</Text>
                                <Text>{formatBaht(item.line_total)}</Text>
                            </TouchableOpacity>
                        )
                    })}

                    <Text style={[s.billPageTitle, { marginTop: 20 }]}>2) เลือกโต๊ะว่างสำหรับบิลใหม่</Text>
                    {available.length === 0 && <Text style={s.noBillText}>ไม่มีโต๊ะว่าง</Text>}
                    <View style={s.middle}>
                        {available.map(t => (
                            <TouchableOpacity
                                key={t.table_id}
                                style={[s.tablenull, targetTable?.table_id === t.table_id && { backgroundColor: 'rgb(135, 84, 180)' }]}
                                onPress={() => setTargetTable(t)}
                            >
                                <Text style={s.numtable}>{t.table_name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                <View style={s.bottomopen}>
                    <TouchableOpacity style={s.butopen} onPress={() => setView('info')}><Text style={s.textbut}>ยกเลิก</Text></TouchableOpacity>
                    <TouchableOpacity
                        style={[s.butopen, (splitSel.length === 0 || !targetTable) && { opacity: 0.4 }]}
                        disabled={splitSel.length === 0 || !targetTable}
                        onPress={doSplit}
                    >
                        <Text style={s.textbut}>ยืนยันแยกบิล</Text>
                    </TouchableOpacity>
                </View>
            </Frame>
        )
    }

    /* ---------- แผนผังโต๊ะ ---------- */
    return (
        <ImageBackground source={require('../photo/TableMap.jpg')} style={s.content}>
            <TouchableOpacity style={s.backButton} onPress={() => changepage('Login')}>
                <Image source={require('../photo/back.png')} style={s.back} />
            </TouchableOpacity>
            <View style={s.top}>
                <View style={s.titleContainer}><Text style={s.title}>Table</Text></View>
            </View>

            <View style={{ alignItems: 'center' }}>
                <View style={s.statustable}>
                    <Text style={{ fontSize: 15 }}>จำนวนโต๊ะที่ว่าง : {available.length}</Text>
                    <Text style={{ fontSize: 15 }}>จำนวนโต๊ะที่ไม่ว่าง : {notAvailableCount}</Text>
                </View>
                <TouchableOpacity style={s.butopen} onPress={confirmReset}>
                    <Text style={s.textbut}>ล้างข้อมูลการขาย</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={s.middle}>
                    {tables.map(item => (
                        <TouchableOpacity
                            key={item.table_id}
                            style={item.table_status === 'available' ? s.tablenull : s.table}
                            onPress={() => selectTable(item)}
                        >
                            <Text style={s.numtable}>{item.table_name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={s.bottombar}>
                {[['Table', 'TableMap'], ['Order', 'Order'], ['Menu', 'Menu'], ['Account', 'Account']].map(([label, p]) => (
                    <TouchableOpacity key={p} style={s.page} onPress={() => changepage(p)}>
                        <Text style={s.titlepage}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ImageBackground>
    )
}

const s = StyleSheet.create({
    content: { flex: 1, paddingTop: 20 },
    top: { alignItems: 'center', marginBottom: 10 },
    titleContainer: { paddingHorizontal: 20, borderRadius: 50 },
    title: { fontSize: 50, fontWeight: 'bold', color: colors.red },
    backButton: { marginLeft: 10 },
    back: { width: 50, height: 50, borderRadius: 25, position: 'absolute', left: 0 },
    table: {
        width: '30%', height: 60, alignItems: 'center', justifyContent: 'center',
        backgroundColor: colors.dim, borderColor: colors.red, borderWidth: 2,
        borderRadius: 30, marginBottom: 20
    },
    tablenull: {
        width: '30%', height: 60, alignItems: 'center', justifyContent: 'center',
        backgroundColor: colors.red, borderColor: colors.red, borderWidth: 2,
        borderRadius: 50, marginBottom: 20
    },
    numtable: { fontSize: 30, color: colors.text },
    middle: {
        justifyContent: 'space-around', flexDirection: 'row',
        paddingHorizontal: 20, marginBottom: 30, flexWrap: 'wrap'
    },
    statustable: { width: 250, marginBottom: 10, backgroundColor: colors.text, borderRadius: 10, padding: 10 },
    bottombar: { flexDirection: 'row', position: 'absolute', bottom: 0, left: 0, right: 0 },
    page: {
        borderColor: colors.text, borderTopWidth: 2, borderWidth: 1, flex: 1, height: 70,
        alignItems: 'center', justifyContent: 'center', backgroundColor: colors.red
    },
    titlepage: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
    box: { backgroundColor: colors.text, borderRadius: 20, paddingHorizontal: 20, marginBottom: 10, minHeight: 45 },
    contentopen: { padding: 20 },
    bottomopen: { flexDirection: 'row', justifyContent: 'flex-end', padding: 20 },
    butopen: { backgroundColor: colors.red, padding: 10, borderRadius: 5, marginLeft: 15 },
    textbut: { color: colors.text, fontSize: 15 },
    textopen: { fontSize: 15, fontWeight: 'bold', marginBottom: 5 },
    billPageTitle: { fontSize: 22, fontWeight: 'bold', color: colors.red, marginBottom: 15 },
    infoText: { backgroundColor: colors.text, borderRadius: 20, padding: 12, marginBottom: 6, fontSize: 18 },
    noBillText: { fontSize: 18, textAlign: 'center', marginTop: 30 },
    billcode: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)', margin: 20, borderRadius: 20, padding: 30
    },
    billcodetitle: { fontSize: 30, fontWeight: 'bold', color: colors.red, marginBottom: 30 },
    billcodename: { fontSize: 20, fontWeight: 'bold' },
    billid: { fontSize: 50, fontWeight: 'bold', color: colors.red, marginVertical: 20 },
    billcodeinfo: { fontSize: 16, marginBottom: 20 },
    tophistory: { alignItems: 'center', marginBottom: 5, paddingTop: 5 },
    historyTitleBox: { boxShadow: '0 0 10px rgba(0,0,0,0.5)', paddingHorizontal: 20, borderRadius: 50 },
    titlehistory: { fontSize: 30, fontWeight: 'bold', color: colors.red, padding: 5 },
    middlehistory: { paddingHorizontal: 20, paddingBottom: 20 },
    order: { marginTop: 20, backgroundColor: 'white', borderRadius: 15, padding: 15 },
    rownotable: {
        borderBottomColor: colors.bg, borderBottomWidth: 1, flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8
    },
    notable: { fontSize: 18, fontWeight: 'bold' },
    numround: { fontSize: 12, color: colors.dim, flex: 1, textAlign: 'right', marginLeft: 10 },
    list: { flexDirection: 'row', paddingVertical: 5, alignItems: 'center' },
    c1: { flex: 4 },
    c2: { flex: 1, textAlign: 'center' },
    c3: { flex: 2, textAlign: 'right' },
    c4: { flex: 2, textAlign: 'right', fontSize: 12, color: colors.dim },
    strike: { textDecorationLine: 'line-through', color: colors.dim },
    roundTotal: { borderTopWidth: 1, borderTopColor: colors.dim, marginTop: 8, paddingTop: 8, alignItems: 'flex-end' },
    roundTotalText: { fontWeight: 'bold', fontSize: 15 },
    emptyBox: { backgroundColor: colors.text, borderRadius: 15, padding: 30, marginTop: 30, alignItems: 'center' },
    emptyText: { fontSize: 18 },
    bottomfix: { position: 'absolute', bottom: 0, left: 0, right: 0 },
    bottompay: { backgroundColor: colors.text, padding: 10 },
    allbill: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    paytext: { fontSize: 18, fontWeight: 'bold', marginRight: 10 },
    butpay: { backgroundColor: 'rgb(135, 84, 180)', borderRadius: 10, padding: 10 },
    pay: { fontSize: 20, color: colors.text },
    bottomRow: { flexDirection: 'row', borderColor: colors.text, borderWidth: 2 },
    butswitch: {
        backgroundColor: colors.red, flex: 1, padding: 20, borderColor: colors.text,
        alignItems: 'center', justifyContent: 'center', borderRightWidth: 2
    },
    textswitch: { fontSize: 15, color: colors.text, fontWeight: 'bold' },
    splitItem: {
        flexDirection: 'row', backgroundColor: colors.text, borderRadius: 12,
        padding: 12, marginBottom: 8, borderWidth: 2, borderColor: 'transparent'
    },
    splitItemOn: { borderColor: colors.red }
})

export default TableMap