import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    ImageBackground,
    ScrollView
} from 'react-native'

import { colors } from '../src/style/theme'

import {
    useEffect,
    useState
} from 'react'

import {
    SQLiteProvider,
    useSQLiteContext
} from 'expo-sqlite'

import {
    DATABASE_NAME,
    getCart,
    createOrderRound,
    openDATABASE
} from '../database/db'


function Cart({
    changepage,
    billId
}) {

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


function CartScreen({
    changepage,
    billId
}) {

    const db = useSQLiteContext()

    const [cart, setCart] =
        useState([])

    const [sending, setSending] =
        useState(false)


    async function loadCart() {

        try {

            const data =
                await getCart(db)

            setCart(data)

        } catch (error) {

            console.log(
                'โหลดตะกร้าไม่สำเร็จ',
                error
            )
        }
    }


    async function sendOrder() {

        if (!billId) {

            console.log(
                'ไม่พบ Bill ID'
            )

            return
        }

        if (cart.length === 0) {

            console.log(
                'ไม่มีอาหารในตะกร้า'
            )

            return
        }

        if (sending) {
            return
        }

        try {

            setSending(true)

            /*
             * เอาข้อมูล Cart
             * ไปสร้าง Order_Rounds
             * และ Order_Items
             */
            await createOrderRound(
                db,
                billId,
                cart
            )

            /*
             * createOrderRound()
             * ล้าง Cart ให้แล้ว
             */
            setCart([])

            console.log(
                'ส่งออเดอร์สำเร็จ'
            )

            /*
             * กลับไปหน้าเมนู
             */
            changepage(
                'MenuClient',
                billId
            )

        } catch (error) {

            console.log(
                'ส่งออเดอร์ไม่สำเร็จ',
                error
            )

        } finally {

            setSending(false)
        }
    }


    useEffect(() => {

        loadCart()

    }, [])


    const totalPrice =
        cart.reduce(
            (total, item) =>
                total +
                (
                    item.unit_price *
                    item.amount
                ),
            0
        )


    return (

        <ImageBackground
            source={require('../photo/cart.jpg')}
            style={styles.content}
        >

            <ScrollView
                contentContainerStyle={
                    styles.fixarea
                }
            >

                <View style={styles.top}>

                    <Text style={styles.title}>
                        รายการอาหาร
                    </Text>

                </View>


                <View style={styles.middle}>

                    {
                        cart.length > 0

                            ?

                            cart.map(item => (

                                <View
                                    style={styles.order}
                                    key={item.cart_id}
                                >

                                    <View
                                        style={
                                            styles.rowmenu
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.menuName
                                            }
                                        >
                                            {
                                                item.menu_name
                                            }
                                        </Text>

                                        <Text
                                            style={
                                                styles.amount
                                            }
                                        >
                                            x{item.amount}
                                        </Text>

                                    </View>


                                    <View
                                        style={
                                            styles.rowmenu
                                        }
                                    >

                                        <Text>
                                            ราคา
                                        </Text>

                                        <Text>
                                            {
                                                item.unit_price
                                            } บาท
                                        </Text>

                                    </View>


                                    <View
                                        style={
                                            styles.rowmenu
                                        }
                                    >

                                        <Text>
                                            รวม
                                        </Text>

                                        <Text>
                                            {
                                                item.unit_price *
                                                item.amount
                                            } บาท
                                        </Text>

                                    </View>


                                    <View
                                        style={
                                            styles.noteRow
                                        }
                                    >

                                        <Text>
                                            หมายเหตุ :
                                        </Text>

                                        <Text>
                                            {
                                                item.note || '-'
                                            }
                                        </Text>

                                    </View>

                                </View>

                            ))

                            :

                            <View
                                style={
                                    styles.noData
                                }
                            >

                                <Text
                                    style={
                                        styles.noDataText
                                    }
                                >
                                    ยังไม่มีอาหารในตะกร้า
                                </Text>

                            </View>
                    }

                </View>


                {
                    cart.length > 0 && (

                        <View
                            style={
                                styles.totalBox
                            }
                        >

                            <Text
                                style={
                                    styles.totalText
                                }
                            >
                                รวมทั้งหมด
                            </Text>

                            <Text
                                style={
                                    styles.totalPrice
                                }
                            >
                                {totalPrice} บาท
                            </Text>

                        </View>

                    )
                }


            </ScrollView>


            <View style={styles.bottom}>

                <TouchableOpacity
                    style={styles.backButton}

                    onPress={() => {

                        changepage(
                            'MenuClient',
                            billId
                        )

                    }}
                >

                    <Text
                        style={
                            styles.buttonText
                        }
                    >
                        กลับไปเลือกอาหาร
                    </Text>

                </TouchableOpacity>


                <TouchableOpacity
                    style={[
                        styles.orderButton,

                        sending && {
                            opacity: 0.5
                        }
                    ]}

                    disabled={sending}

                    onPress={sendOrder}
                >

                    <Text
                        style={
                            styles.buttonText
                        }
                    >
                        {
                            sending
                                ? 'กำลังสั่ง...'
                                : 'สั่งออเดอร์'
                        }
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
        marginTop: 10,
        marginBottom: 10
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
        marginTop: 15,
        backgroundColor: colors.text,
        borderRadius: 15,
        padding: 15,
        boxShadow:
            '0 0 10px rgba(0,0,0,0.5)'
    },

    rowmenu: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },

    menuName: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1
    },

    amount: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10
    },

    noteRow: {
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    totalBox: {
        margin: 25,
        padding: 15,
        backgroundColor: colors.text,
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    totalText: {
        fontSize: 20,
        fontWeight: 'bold'
    },

    totalPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.red
    },

    bottom: {
        flexDirection: 'row',
        padding: 10,
        paddingBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.8)'
    },

    backButton: {
        flex: 1,
        backgroundColor: colors.bg,
        padding: 15,
        borderRadius: 10,
        marginRight: 5,
        alignItems: 'center'
    },

    orderButton: {
        flex: 1,
        backgroundColor: colors.red,
        padding: 15,
        borderRadius: 10,
        marginLeft: 5,
        alignItems: 'center'
    },

    buttonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold'
    },

    fixarea: {
        paddingBottom: 100
    },

    noData: {
        alignItems: 'center',
        marginTop: 200
    },

    noDataText: {
        color: colors.red,
        fontSize: 20,
        fontWeight: 'bold',
        backgroundColor: 'rgba(253,253,253,0.7)',
        borderRadius: 15,
        padding: 20
    }

})

export default Cart