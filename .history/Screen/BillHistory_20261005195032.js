import { useEffect, useState } from 'react'
import {
    View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
    ImageBackground, StyleSheet, Alert
} from 'react-native'
import { useSQLiteContext } from 'expo-sqlite'
import { colors } from '../src/style/theme'
import {
    getBillOrders, getBillTotal, getBillInfo, cancelOrderItem, ITEM_STATUS
} from '../database/db'
import { formatBaht } from '../database/money'

function BillHistory({ changepage, billId }) {
    const db = useSQLiteContext()

    const [info, setInfo] = useState(null)
    const [items, setItems] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)

    async function loadBill() {
        if (!billId) { setItems([]); setLoading(false); return }
        try {
            setLoading(true)
            setInfo(await getBillInfo(db, billId))
            setItems(await getBillOrders(db, billId))
            setTotal(await getBillTotal(db, billId)) // ยอดรวมจาก SQL
        } catch (error) {
            console.log('โหลดบิลไม่สำเร็จ', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadBill() }, [billId])

    function confirmCancel(item) {
        Alert.alert('ยกเลิกรายการ', `ยกเลิก ${item.menu_name} x${item.amount} ใช่หรือไม่?`, [
            { text: 'ไม่', style: 'cancel' },
            {
                text: 'ยกเลิกรายการ',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await cancelOrderItem(db, item.order_item_id)
                        await loadBill()
                    } catch (error) {
                        Alert.alert('ยกเลิกไม่ได้', String(error.message || error))
                        await loadBill()
                    }
                }
            }
        ])
    }

    // จัดกลุ่มตามรอบ (แค่จัดหน้าจอ ไม่ได้คำนวณเงินใน JS)
    const rounds = []
    items.forEach(item => {
        let r = rounds.find(x => x.order_round_id === item.order_round_id)
        if (!r) {
            r = {
                order_round_id: item.order_round_id,
                round: item.round,
                order_at: item.order_at,
                round_total: item.round_total,
                items: []
            }
            rounds.push(r)
        }
        r.items.push(item)
    })

    const isOpen = info?.status === 'open'

    return (
        <ImageBackground source={require('../photo/historyorder.jpg')} style={styles.content}>
            <ScrollView contentContainerStyle={{ paddingBottom: 170 }}>
                <View style={styles.top}>
                    <View style={styles.titleBox}>
                        <Text style={styles.title}>สรุปบิล</Text>
                    </View>
                    {!!info && (
                        <Text style={styles.subtitle}>
                            โต๊ะ {info.table_name} • รหัสบิล {info.bill_id} • {isOpen ? 'เปิดอยู่' : 'ปิดแล้ว'}
                        </Text>
                    )}
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.red} style={{ marginTop: 40 }} />
                ) : rounds.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyText}>ยังไม่มีรายการที่สั่ง</Text>
                    </View>
                ) : (
                    rounds.map(round => (
                        <View key={round.order_round_id} style={styles.roundBox}>
                            <View style={styles.roundHeader}>
                                <Text style={styles.roundTitle}>รอบที่ {round.round}</Text>
                                <Text style={styles.roundTime}>{round.order_at}</Text>
                            </View>

                            <View style={styles.rowHead}>
                                <Text style={[styles.cName, styles.head]}>รายการ</Text>
                                <Text style={[styles.cQty, styles.head]}>จำนวน</Text>
                                <Text style={[styles.cPrice, styles.head]}>ราคา/หน่วย</Text>
                                <Text style={[styles.cPrice, styles.head]}>รวม</Text>
                            </View>

                            {round.items.map(item => {
                                const cancelled = item.status === ITEM_STATUS.CANCELLED
                                return (
                                    <View key={item.order_item_id} style={styles.itemBox}>
                                        <View style={styles.row}>
                                            <Text style={[styles.cName, cancelled && styles.strike]}>{item.menu_name}</Text>
                                            <Text style={[styles.cQty, cancelled && styles.strike]}>{item.amount}</Text>
                                            <Text style={[styles.cPrice, cancelled && styles.strike]}>{formatBaht(item.unit_price)}</Text>
                                            <Text style={[styles.cPrice, cancelled && styles.strike]}>{formatBaht(item.line_total)}</Text>
                                        </View>
                                        {!!item.note && <Text style={styles.sub}>หมายเหตุ: {item.note}</Text>}
                                        <View style={styles.statusRow}>
                                            <Text style={[styles.sub, cancelled && { color: colors.red }]}>
                                                สถานะ: {item.status}
                                                {cancelled && item.cancelled_at ? ` (${item.cancelled_at})` : ''}
                                            </Text>
                                            {isOpen && item.status === ITEM_STATUS.WAIT && (
                                                <Text style={styles.cancel} onPress={() => confirmCancel(item)}>
                                                    ยกเลิก
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                )
                            })}

                            <View style={styles.roundTotal}>
                                <Text style={styles.bold}>รวมรอบนี้ {formatBaht(round.round_total)} บาท</Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <View style={styles.totalBar}>
                <Text style={styles.totalText}>ยอดรวมทั้งบิล {formatBaht(total)} บาท</Text>
            </View>

            {isOpen ? (
                <View style={styles.bottombar}>
                    <TouchableOpacity style={styles.page} onPress={() => changepage('MenuClient', billId)}>
                        <Text style={styles.titlepage}>เมนูอาหาร</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.page} onPress={() => changepage('Cart', billId)}>
                        <Text style={styles.titlepage}>ตะกร้าอาหาร</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.page} onPress={() => changepage('BillHistory', billId)}>
                        <Text style={styles.titlepage}>ประวัติการสั่ง</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.bottombar}>
                    <TouchableOpacity style={styles.page} onPress={() => changepage('Account')}>
                        <Text style={styles.titlepage}>กลับหน้า Account</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    content: { flex: 1, paddingTop: 20 },
    top: { alignItems: 'center', marginBottom: 10 },
    titleBox: { boxShadow: '0 0 10px rgba(0,0,0,0.5)', paddingHorizontal: 20, borderRadius: 50 },
    title: { fontSize: 40, fontWeight: 'bold', color: colors.red },
    subtitle: {
        marginTop: 8, backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 12,
        paddingVertical: 4, borderRadius: 12
    },
    emptyBox: { backgroundColor: colors.text, borderRadius: 15, padding: 30, margin: 20, alignItems: 'center' },
    emptyText: { fontSize: 18 },
    roundBox: { backgroundColor: 'white', borderRadius: 15, padding: 12, marginHorizontal: 20, marginTop: 15 },
    roundHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        borderBottomWidth: 1, borderBottomColor: colors.bg, paddingBottom: 6
    },
    roundTitle: { fontSize: 18, fontWeight: 'bold' },
    roundTime: { fontSize: 12, color: colors.dim },
    rowHead: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderColor: colors.dim },
    row: { flexDirection: 'row', paddingTop: 6 },
    head: { color: colors.red, fontWeight: 'bold' },
    cName: { flex: 3 },
    cQty: { flex: 1, textAlign: 'center' },
    cPrice: { flex: 2, textAlign: 'right' },
    itemBox: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 6 },
    strike: { textDecorationLine: 'line-through', color: colors.dim },
    sub: { fontSize: 12, color: colors.dim },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
    cancel: { color: colors.red, textDecorationLine: 'underline', fontWeight: 'bold' },
    roundTotal: { alignItems: 'flex-end', marginTop: 8 },
    bold: { fontWeight: 'bold' },
    totalBar: { position: 'absolute', bottom: 70, left: 0, right: 0, backgroundColor: colors.text, padding: 12, alignItems: 'center' },
    totalText: { fontSize: 20, fontWeight: 'bold', color: colors.red },
    bottombar: { flexDirection: 'row', position: 'absolute', bottom: 0, left: 0, right: 0 },
    page: {
        borderColor: colors.text, borderTopWidth: 2, borderWidth: 1, flex: 1, height: 70,
        alignItems: 'center', justifyContent: 'center', backgroundColor: colors.red
    },
    titlepage: { color: colors.text, fontSize: 16, fontWeight: 'bold' }
})

export default BillHistory