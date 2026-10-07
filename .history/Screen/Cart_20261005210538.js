import { View, StyleSheet, TouchableOpacity, Text, ImageBackground, ScrollView } from "react-native"
import { colors } from "../src/style/theme"
import { useEffect, useState } from "react"
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite"
import { DATABASE_NAME, getCart, createOrderRound, openDATABASE, updateCartAmount, removeFromCart } from "../database/db"

function Cart({ changepage, billId }) {
    return (
        <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
            <CartScreen changepage={changepage} billId={billId} />
        </SQLiteProvider>
    )
}

function CartScreen({ changepage, billId }) {
    const db = useSQLiteContext()
    const [cart, setCart] = useState([])
    const [loading, setLoading] = useState(false)

    async function loadCart() {
        if (!billId) return setCart([])

        try {
            setCart(await getCart(db, billId))
        } catch (error) {
            console.log('โหลดตะกร้าไม่สำเร็จ', error)
        }
    }

    async function increaseAmount(cartId, currentAmount) {
        try {
            await updateCartAmount(db, cartId, currentAmount + 1)
            await loadCart()
        } catch (error) {
            console.log('เพิ่มจำนวนไม่สำเร็จ', error)
        }
    }

    async function decreaseAmount(cartId, currentAmount) {
        try {
            await updateCartAmount(db, cartId, currentAmount - 1)
            await loadCart()
        } catch (error) {
            console.log('ลดจำนวนไม่สำเร็จ', error)
        }
    }

    async function removeItem(cartId) {
        try {
            await removeFromCart(db, cartId)
            await loadCart()
        } catch (error) {
            console.log('ลบรายการไม่สำเร็จ', error)
        }
    }

    async function orderFood() {
        if (!billId) return console.log('ไม่พบ Bill ID')
        if (!cart.length) return console.log('ไม่มีอาหารในตะกร้า')
        if (loading) return

        try {
            setLoading(true)
            const result = await createOrderRound(db, billId)
            console.log('สั่งอาหารสำเร็จ', result)
            await loadCart()
        } catch (error) {
            console.log('สั่งอาหารไม่สำเร็จ', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCart()
    }, [billId])

    return (
        <ImageBackground source={require('../photo/cart.jpg')} style={styles.content}>
            <ScrollView contentContainerStyle={styles.fixarea}>
                <View style={styles.top}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>รายการอาหาร</Text>
                    </View>
                </View>

                <View style={styles.middle}>
                    {cart.length ? cart.map(item => (
                        <View style={styles.order} key={item.cart_id}>
                            <View style={styles.columnorder}>
                                <Text style={styles.columntop}>ชื่อ</Text>
                                <Text style={styles.columntop}>จำนวน</Text>
                                <Text style={styles.columntop}>ราคา</Text>
                                <Text style={styles.columntop}>หมายเหตุ</Text>
                            </View>

                            <View style={styles.menu}>
                                <View style={styles.rowmenu}>
                                    <Text style={styles.column}>{item.menu_name}</Text>
                                    <Text style={styles.column}>{item.amount}</Text>
                                    <Text style={styles.column}>{item.unit_price}</Text>
                                    <Text style={styles.column}>{item.note || '-'}</Text>
                                </View>
                            </View>

                            {/* ส่วนปุ่มจัดการ เพิ่ม-ลด และลบ */}
                            <View style={styles.actionRow}>
                                <View style={styles.quantityControl}>
                                    <TouchableOpacity 
                                        style={styles.qtyButton} 
                                        onPress={() => decreaseAmount(item.cart_id, item.amount)}
                                    >
                                        <Text style={styles.qtyButtonText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.qtyText}>{item.amount}</Text>
                                    <TouchableOpacity 
                                        style={styles.qtyButton} 
                                        onPress={() => increaseAmount(item.cart_id, item.amount)}
                                    >
                                        <Text style={styles.qtyButtonText}>+</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity 
                                    style={styles.deleteButton} 
                                    onPress={() => removeItem(item.cart_id)}
                                >
                                    <Text style={styles.deleteButtonText}>ลบ</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )) : (
                        <View style={styles.noData}>
                            <View style={styles.framedata}>
                                <Text style={styles.noDataText}>ยังไม่มีอาหารในตะกร้า</Text>
                            </View>
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
                            {loading ? 'กำลังสั่ง...' : 'สั่งออเดอร์'}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <View style={styles.bottombar}>
                <TouchableOpacity style={styles.page} onPress={() => changepage('MenuClient')}>
                    <Text style={styles.titlepage}>เมนูอาหาร</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.page} onPress={() => changepage('Cart')}>
                    <Text style={styles.titlepage}>ตะกร้าอาหาร</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingTop: 20
    },
    top: {
        alignItems: 'center',
        marginTop: 10
    },
    titleContainer: {
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        paddingLeft: 20,
        paddingRight: 20,
        borderRadius: 50
    },
    title: {
        fontSize: 45,
        fontWeight: 'bold',
        color: colors.red
    },
    middle: {
        paddingLeft: 25,
        paddingRight: 25
    },
    order: {
        justifyContent: 'center',
        marginTop: 20,
        backgroundColor: 'white',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        borderRadius: 15,
        padding: 10
    },
    columnorder: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: colors.bg,
        borderBottomWidth: 1
    },
    columntop: {
        width: 70
    },
    menu: {
        paddingTop: 5
    },
    rowmenu: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    column: {
        width: 70
    },
    // สไตล์เพิ่มเติมสำหรับปุ่มจัดการจำนวนและลบ (คุมโทนสีตาม UI เดิม)
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: colors.bg,
        paddingTop: 8
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    qtyButton: {
        backgroundColor: colors.red,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6
    },
    qtyButtonText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold'
    },
    qtyText: {
        marginHorizontal: 12,
        fontSize: 16,
        fontWeight: 'bold'
    },
    deleteButton: {
        backgroundColor: '#ff4d4d',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 6
    },
    deleteButtonText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: 'bold'
    },
    orderButton: {
        alignSelf: 'center',
        backgroundColor: colors.red,
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 30,
        paddingRight: 30,
        borderRadius: 10,
        marginTop: 20,
        marginBottom: 20
    },
    orderButtonDisabled: {
        opacity: 0.5
    },
    orderButtonText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold'
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
        flex: 4,
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
    fixarea: {
        paddingBottom: 90
    },
    noData: {
        flex: 1,
        alignItems: 'center'
    },
    framedata: {
        alignItems: 'center'
    },
    noDataText: {
        color: colors.red,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 200,
        backgroundColor: 'rgba(253, 253, 253, 0.7)',
        borderRadius: 15,
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 20,
        paddingRight: 20
    }
})

export default Cart