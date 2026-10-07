import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    ImageBackground,
    ScrollView
} from "react-native"
import { colors } from "../src/style/theme"
import { useEffect, useState } from "react"
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite"
import {
    DATABASE_NAME,
    getCart,
    createOrderRound,
    openDATABASE
} from "../database/db"

function Cart({ changepage, billId }) {
    return (
        <SQLiteProvider
            onInit={openDATABASE}
            databaseName={DATABASE_NAME}
        >
            <CartScreen
                changepage={changepage}
                billId={billId}
            />
        </SQLiteProvider>
    )
}

function CartScreen({ changepage, billId }) {
    const db = useSQLiteContext()
    const [cart, setCart] = useState([])
    const [loading, setLoading] = useState(false)

    async function loadCart() {
        if (!billId) {
            setCart([])
            return
        }

        try {
            const data = await getCart(db, billId)
            setCart(data)
        } catch (error) {
            console.log('โหลดตะกร้าไม่สำเร็จ', error)
        }
    }

    async function orderFood() {
        if (!billId) {
            console.log('ไม่พบ Bill ID')
            return
        }

        if (cart.length === 0) {
            console.log('ไม่มีอาหารในตะกร้า')
            return
        }

        if (loading) {
            return
        }

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
        <ImageBackground
            source={require('../photo/cart.jpg')}
            style={styles.content}
        >
            <ScrollView contentContainerStyle={styles.fixarea}>
                <View style={styles.top}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>
                            รายการอาหาร
                        </Text>
                    </View>
                </View>

                <View style={styles.middle}>
                    {cart.length > 0 ? (
                        cart.map(item => (
                            <View
                                style={styles.order}
                                key={item.cart_id}
                            >
                                <View style={styles.columnorder}>
                                    <Text style={styles.columntop}>
                                        ชื่อ
                                    </Text>
                                    <Text style={styles.columntop}>
                                        จำนวน
                                    </Text>
                                    <Text style={styles.columntop}>
                                        ราคา
                                    </Text>
                                    <Text style={styles.columntop}>
                                        หมายเหตุ
                                    </Text>
                                </View>

                                <View style={styles.menu}>
                                    <View style={styles.rowmenu}>
                                        <Text style={styles.column}>
                                            {item.menu_name}
                                        </Text>
                                        <Text style={styles.column}>
                                            {item.amount}
                                        </Text>
                                        <Text style={styles.column}>
                                            {item.unit_price}
                                        </Text>
                                        <Text style={styles.column}>
                                            {item.note || '-'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.noData}>
                            <View style={styles.framedata}>
                                <Text style={styles.noDataText}>
                                    ยังไม่มีอาหารในตะกร้า
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {cart.length > 0 && (
                    <TouchableOpacity
                        style={[
                            styles.orderButton,
                            loading && styles.orderButtonDisabled
                        ]}
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
                <TouchableOpacity
                    style={styles.page}
                    onPress={() => {
                        changepage('MenuClient')
                    }}
                >
                    <Text style={styles.titlepage}>
                        เมนูอาหาร
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.page}
                    onPress={() => {
                        changepage('Cart')
                    }}
                >
                    <Text style={styles.titlepage}>
                        ตะกร้าอาหาร
                    </Text>
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