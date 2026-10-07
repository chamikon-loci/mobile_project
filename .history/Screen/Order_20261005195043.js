import {
    View, StyleSheet, TouchableOpacity, Image,
    Text, ImageBackground, ScrollView
} from "react-native"
import { colors } from "../src/style/theme"
import { useEffect, useState, useCallback } from "react"
import { useSQLiteContext } from "expo-sqlite"
import { getKitchenOrders, updateOrderItemStatus, ITEM_STATUS } from "../database/db"

const STATUS_LIST = [ITEM_STATUS.WAIT, ITEM_STATUS.DOING, ITEM_STATUS.DONE]

function Order({ changepage }) {
    const db = useSQLiteContext()
    const [order, setOrder] = useState([])

    const loadOrder = useCallback(async () => {
        try {
            setOrder(await getKitchenOrders(db)) // เรียงเก่าสุดขึ้นก่อนด้วย SQL
        } catch (error) {
            console.log('โหลด Order ไม่สำเร็จ', error)
        }
    }, [db])

    useEffect(() => {
        loadOrder()
        const timer = setInterval(loadOrder, 3000)
        return () => clearInterval(timer)
    }, [loadOrder])

    async function changeStatus(orderItemId, status) {
        try {
            await updateOrderItemStatus(db, orderItemId, status)
            await loadOrder()
        } catch (error) {
            console.log('เปลี่ยนสถานะไม่สำเร็จ', error)
        }
    }

    return (
        <ImageBackground source={require('../photo/order.jpg')} style={styles.content}>
            <ScrollView contentContainerStyle={styles.fixarea}>
                <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => changepage('Login')}>
                    <Image source={require('../photo/back.png')} style={styles.picback} />
                </TouchableOpacity>

                <View style={styles.top}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Order</Text>
                    </View>
                </View>

                <View style={styles.middle}>
                    {order.length > 0 ? (
                        order.map(item => {
                            const cancelled = item.status === ITEM_STATUS.CANCELLED
                            const done = item.status === ITEM_STATUS.DONE
                            return (
                                <View
                                    style={[styles.order, (cancelled || done) && { opacity: 0.5 }]}
                                    key={item.order_item_id}
                                >
                                    <View style={styles.rownotable}>
                                        <Text style={styles.notable}>โต๊ะที่ {item.table_name}</Text>
                                        <Text style={styles.numround}>
                                            รอบที่ {item.round} เวลา : {item.order_at}
                                        </Text>
                                    </View>

                                    <View style={styles.rowmenu}>
                                        <Text style={[styles.cName, cancelled && styles.strike]}>{item.menu_name}</Text>
                                        <Text style={[styles.cQty, cancelled && styles.strike]}>x{item.amount}</Text>
                                    </View>
                                    <Text style={styles.note}>หมายเหตุ: {item.note || '-'}</Text>

                                    {cancelled ? (
                                        <Text style={styles.cancelText}>
                                            ยกเลิกแล้ว {item.cancelled_at ? `(${item.cancelled_at})` : ''}
                                        </Text>
                                    ) : (
                                        <View style={styles.rowstatus}>
                                            <Text>สถานะ : {item.status}</Text>
                                            <View style={styles.butt}>
                                                {STATUS_LIST.map(s => (
                                                    <TouchableOpacity
                                                        key={s}
                                                        style={[styles.status, item.status === s && styles.statusActive]}
                                                        onPress={() => changeStatus(item.order_item_id, s)}
                                                    >
                                                        <Text style={styles.namestatus}>{s}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )
                        })
                    ) : (
                        <View style={styles.noData}>
                            <Text style={styles.noDataText}>ไม่มี Order</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

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
    picback: { width: 50, height: 50, borderRadius: 25 },
    top: { alignItems: 'center' },
    titleContainer: { boxShadow: '0 0 10px rgba(0,0,0,0.5)', paddingHorizontal: 20, borderRadius: 50 },
    title: { fontSize: 50, fontWeight: 'bold', color: colors.red },
    middle: { paddingHorizontal: 25 },
    order: {
        marginTop: 20, backgroundColor: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        borderRadius: 15, padding: 10
    },
    rownotable: {
        borderBottomColor: colors.bg, borderBottomWidth: 1, flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center', paddingBottom: 4
    },
    notable: { fontSize: 18, fontWeight: 'bold' },
    numround: { fontSize: 13, color: colors.dim },
    rowmenu: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    cName: { fontSize: 18, flex: 1 },
    cQty: { fontSize: 18, fontWeight: 'bold' },
    strike: { textDecorationLine: 'line-through' },
    note: { color: colors.dim, marginTop: 2 },
    cancelText: { color: colors.red, fontWeight: 'bold', marginTop: 8 },
    rowstatus: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' },
    butt: { flexDirection: 'row' },
    status: { padding: 5, backgroundColor: colors.red, borderRadius: 5, marginRight: 5 },
    statusActive: { backgroundColor: 'rgb(135, 84, 180)' },
    namestatus: { color: colors.text },
    bottombar: { flexDirection: 'row', position: 'absolute', bottom: 0, left: 0, right: 0 },
    page: {
        borderColor: colors.text, borderTopWidth: 2, borderWidth: 1, flex: 1, height: 70,
        alignItems: 'center', justifyContent: 'center', backgroundColor: colors.red
    },
    titlepage: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
    fixarea: { paddingBottom: 90 },
    noData: { alignItems: 'center' },
    noDataText: {
        color: colors.red, fontSize: 20, fontWeight: 'bold', marginTop: 200,
        backgroundColor: 'rgba(253, 253, 253, 0.7)', borderRadius: 15, padding: 20
    }
})

export default Order