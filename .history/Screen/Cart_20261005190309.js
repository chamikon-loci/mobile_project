import {
    View, StyleSheet, TouchableOpacity, Text,
    ImageBackground, ScrollView, Alert
} from "react-native"
import { colors } from "../src/style/theme"
import { useEffect, useState } from "react"
import { useSQLiteContext } from "expo-sqlite"
import {
    getCart, getCartTotal, changeCartAmount,
    removeCartItem, createOrderRound
} from "../database/db"
import { formatBaht } from "../database/money"

function Cart({ changepage, billId }) {
    const db = useSQLiteContext()
    const [cart, setCart] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)

    async function loadCart() {
        if (!billId) { setCart([]); setTotal(0); return }
        try {
            setCart(await getCart(db, billId))
            setTotal(await getCartTotal(db, billId))
        } catch (error) {
            console.log('โหลดตะกร้าไม่สำเร็จ', error)
        }
    }

    async function changeAmount(cartId, delta) {
        try { await changeCartAmount(db, cartId, delta); await loadCart() }
        catch (error) { console.log('แก้จำนวนไม่สำเร็จ', error) }
    }

    async function removeItem(cartId) {
        try { await removeCartItem(db, cartId); await loadCart() }
        catch (error) { console.log('ลบรายการไม่สำเร็จ', error) }
    }

    async function orderFood() {
        if (!billId || cart.length === 0 || loading) return
        try {
            setLoading(true)
            const result = await createOrderRound(db, billId)
            await loadCart()
            Alert.alert('ส่งเข้าครัวแล้ว', `สั่งอาหารรอบที่ ${result.round} เรียบร้อย`)
        } catch (error) {
            Alert.alert('สั่งอาหารไม่สำเร็จ', String(error.message || error))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadCart() }, [billId])

    return (
        <ImageBackground source={require('../photo/cart.jpg')} style={styles.content}>
            <ScrollView contentContainerStyle={styles.fixarea}>
                <View style={styles.top}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>รายการอาหาร</Text>
                    </View>
                </View>

                <View style={styles.middle}>
                    {cart.length > 0 ? (
                        <View style={styles.order}>
                            <View style={styles.columnorder}>
                                <Text style={[styles.cellName, styles.head]}>ชื่อ</Text>
                                <Text style={[styles.cellQty, styles.head]}>จำนวน</Text>
                                <Text style={[styles.cellPrice, styles.head]}>รวม</Text>
                            </View>

                            {cart.map(item => (
                                <View key={item.cart_id} style={styles.itemRow}>
                                    <View style={styles.cellName}>
                                        <Text>{item.menu_name}</Text>
                                        <Text style={styles.sub}>{formatBaht(item.unit_price)} บาท/หน่วย</Text>
                                        {!!item.note && <Text style={styles.sub}>หมายเหตุ: {item.note}</Text>}
                                    </View>

                                    <View style={styles.cellQty}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <TouchableOpacity style={styles.qtyBtn} onPress={() => changeAmount(item.cart_id, -1)}>
                                                <Text style={styles.qtyBtnText}>-</Text>
                                            </TouchableOpacity>
                                            <Text style={{ marginHorizontal: 8 }}>{item.amount}</Text>
                                            <TouchableOpacity style={styles.qtyBtn} onPress={() => changeAmount(item.cart_id, 1)}>
                                                <Text style={styles.qtyBtnText}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={styles.remove} onPress={() => removeItem(item.cart_id)}>ลบ</Text>
                                    </View>

                                    <Text style={styles.cellPrice}>{formatBaht(item.line_total)}</Text>
                                </View>
                            ))}

                            <View style={styles.totalRow}>
                                <Text style={styles.totalText}>รวมรอบนี้ {formatBaht(total)} บาท</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.noData}>
                            <Text style={styles.noDataText}>ยังไม่มีอาหารในตะกร้า</Text>
                        </View>
                    )}
                </View>

                {cart.length > 0 && (
                    <TouchableOpacity
                        style={[styles.orderButton, loading && styles.orderButtonDisabled]}
                        onPress={orderFood}
                        disabled={loading}
                    >
                        <Text style={styles.orderButtonText}>
                            {loading ? 'กำลังสั่ง...' : 'ยืนยันและส่งเข้าครัว'}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

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
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    content: { flex: 1, paddingTop: 20 },
    top: { alignItems: 'center', marginTop: 10 },
    titleContainer: {
        boxShadow: '0 0 10px rgba(0,0,0,0.5)', paddingLeft: 20, paddingRight: 20, borderRadius: 50
    },
    title: { fontSize: 45, fontWeight: 'bold', color: colors.red },
    middle: { paddingLeft: 25, paddingRight: 25 },
    order: {
        marginTop: 20, backgroundColor: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        borderRadius: 15, padding: 10
    },
    columnorder: { flexDirection: 'row', borderBottomColor: colors.bg, borderBottomWidth: 1, paddingBottom: 4 },
    head: { fontWeight: 'bold' },
    cellName: { flex: 3 },
    cellQty: { flex: 3, alignItems: 'center' },
    cellPrice: { flex: 2, textAlign: 'right' },
    itemRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
        borderBottomWidth: 1, borderBottomColor: colors.bg
    },
    sub: { fontSize: 12, color: colors.dim },
    qtyBtn: {
        backgroundColor: colors.red, borderRadius: 12, width: 24, height: 24,
        alignItems: 'center', justifyContent: 'center'
    },
    qtyBtnText: { color: colors.text, fontWeight: 'bold' },
    remove: { color: colors.red, textDecorationLine: 'underline', marginTop: 4 },
    totalRow: { alignItems: 'flex-end', marginTop: 10 },
    totalText: { fontWeight: 'bold', fontSize: 16 },
    orderButton: {
        alignSelf: 'center', backgroundColor: colors.red, paddingVertical: 12,
        paddingHorizontal: 30, borderRadius: 10, marginTop: 20, marginBottom: 20
    },
    orderButtonDisabled: { opacity: 0.5 },
    orderButtonText: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
    bottombar: { flexDirection: 'row', position: 'absolute', bottom: 0, left: 0, right: 0 },
    page: {
        borderColor: colors.text, borderTopWidth: 2, borderWidth: 1, flex: 1, height: 70,
        alignItems: 'center', justifyContent: 'center', backgroundColor: colors.red
    },
    titlepage: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
    fixarea: { paddingBottom: 90 },
    noData: { alignItems: 'center' },
    noDataText: {
        color: colors.red, fontSize: 20, fontWeight: 'bold', marginTop: 200,
        backgroundColor: 'rgba(253, 253, 253, 0.7)', borderRadius: 15, padding: 20
    }
})

export default Cart