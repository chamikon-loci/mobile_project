import { View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground, ScrollView } from "react-native"
import { colors } from "../src/style/theme"
import { useEffect, useState } from "react"
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite"
import { DATABASE_NAME, getAllOrder, openDATABASE, updateOrderItemStatus } from "../database/db"

function Order({ changepage }) {
    return (
        <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
            <OrderScreen changepage={changepage} />
        </SQLiteProvider>
    )
}


function OrderScreen({ changepage }) {
    const db = useSQLiteContext()
    const [order, setOrder] = useState([])
    const [status, setStatus] = useState({})

    const loadOrder = async () => {
        try {
            const allOrders = await getAllOrder(db)
            const activeOrders = allOrders.filter(item => {
                const currentStatus = status[item.order_item_id] || item.status
                return currentStatus !== "เสิร์ฟแล้ว"
            })
            
            activeOrders.sort((a, b) => new Date(a.order_at) - new Date(b.order_at))

            setOrder(activeOrders)
        } catch (error) {
            console.log("โหลด Order ไม่สำเร็จ", error)
        }
    }

    useEffect(() => {
        loadOrder()
    }, [])

    const changeStatus = async (id, change) => {
        const update = { wait: "รอทำ", doing: "กำลังทำ", finish: "เสิร์ฟแล้ว" }[change]
        try {
            await updateOrderItemStatus(db, id, update)
            setStatus(prev => ({ ...prev, [id]: update }))
            loadOrder()
        } catch (error) {
            console.log("อัปเดตสถานะไม่สำเร็จ", error)
        }
    }

    // เอา History ออกจาก Bottom bar เหลือแค่ 4 ปุ่มพอดีพื้นที่
    const pages = [
        ["TableMap", "Table"],
        ["Order", "Order"],
        ["Menu", "Menu"],
        ["Account", "Account"],
        ["Promotion", "Promotion"]
    ]

    return (
        <ImageBackground source={require("../photo/order.jpg")} style={styles.content}>
            <ScrollView contentContainerStyle={styles.fixarea}>
                {/* ส่วนปุ่มย้อนกลับและหัวข้อ พร้อมปุ่ม History มุมขวาบน */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => changepage("Login")}>
                        <Image source={require("../photo/back.png")} style={styles.picback} />
                    </TouchableOpacity>

                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Order</Text>
                    </View>

                    {/* ปุ่มย้ายไปหน้าประวัติ */}
                    <TouchableOpacity
                        style={styles.historyBtn}
                        onPress={() => changepage("Orderhistory")}
                    >
                        <Text style={styles.historyBtnText}>ประวัติ</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.middle}>
                    {order.length ? order.map(item => (
                        <View style={styles.order} key={item.order_item_id}>
                            <View style={styles.rownotable}>
                                <Text style={styles.notable}>โต๊ะที่ {item.table_name}</Text>
                                <Text style={styles.numround}>
                                    รอบที่ {item.round} เวลา : {item.order_at}
                                </Text>
                            </View>

                            <View style={styles.columnorder}>
                                {["ชื่อ", "จำนวน", "เพิ่มเติม", "หมายเหตุ"].map(text => (
                                    <Text style={styles.columntop} key={text}>{text}</Text>
                                ))}
                            </View>

                            <View style={styles.menu}>
                                <View style={styles.rowmenu}>
                                    <Text style={styles.column}>{item.order_menu_name}</Text>
                                    <Text style={styles.column}>{item.amount}</Text>
                                    <Text style={styles.column}>{item.extra || "-"}</Text>
                                    <Text style={styles.column}>{item.note || "-"}</Text>
                                </View>
                            </View>

                            <View style={styles.rowstatus}>
                                <Text>
                                    สถานะ : {status[item.order_item_id] || item.status || "รอทำ"}
                                </Text>

                                <View style={styles.butt}>
                                    {[
                                        ["wait", "รอทำ"],
                                        ["doing", "กำลังทำ"],
                                        ["finish", "เสิร์ฟแล้ว"]
                                    ].map(([key, text]) => (
                                        <TouchableOpacity
                                            key={key}
                                            style={styles.status}
                                            onPress={() => changeStatus(item.order_item_id, key)}
                                        >
                                            <Text style={styles.namestatus}>{text}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )) : (
                        <View style={styles.noData}>
                            <View style={styles.framedata}>
                                <Text style={styles.noDataText}>ไม่มี Order</Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={styles.bottombar}>
                {pages.map(([page, text]) => (
                    <TouchableOpacity
                        key={page}
                        style={styles.page}
                        onPress={() => changepage(page)}
                    >
                        <Text style={styles.titlepage}>{text}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    content: { flex: 1, paddingTop: 20 },
    picback: { width: 50, height: 50, borderRadius: 25 },
    top: { alignItems: "center" },
    titleContainer: { boxShadow: "0 0 10px rgba(0,0,0,0.5)", paddingLeft: 20, paddingRight: 20, borderRadius: 50 },
    title: { fontSize: 50, fontWeight: "bold", color: colors.red },
    middle: { paddingLeft: 25, paddingRight: 25 },
    order: { justifyContent: "center", marginTop: 20, backgroundColor: "white", boxShadow: "0 0 10px rgba(0,0,0,0.5)", borderRadius: 15, padding: 10 },
    rownotable: { borderBottomColor: colors.bg, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    notable: { fontSize: 18 },
    numround: { fontSize: 14, color: colors.dim },
    columnorder: { flexDirection: "row", justifyContent: "space-between", borderBottomColor: colors.bg, borderBottomWidth: 1 },
    columntop: { width: 55 },
    menu: { paddingTop: 5 },
    rowmenu: { flexDirection: "row", justifyContent: "space-between" },
    column: { width: 55 },
    rowstatus: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    butt: { flexDirection: "row" },
    status: { padding: 5, backgroundColor: colors.red, borderRadius: 5, marginRight: 5 },
    namestatus: { color: colors.text },
    bottombar: { flexDirection: "row", justifyContent: "space-around", position: "absolute", bottom: 0, left: 0, right: 0 },
    page: { borderColor: colors.text, borderTopWidth: 2, borderWidth: 1, flex: 1, height: 70, alignItems: "center", justifyContent: "center", backgroundColor: colors.red },
    titlepage: { color: colors.text, fontSize: 15, fontWeight: "bold" },
    fixarea: { paddingBottom: 90 },
    noData: { flex: 1, alignItems: "center" },
    framedata: { alignItems: "center" },
    noDataText: { color: colors.red, fontSize: 20, fontWeight: "bold", marginTop: 200, backgroundColor: "rgba(253, 253, 253, 0.7)", borderRadius: 15, paddingLeft: 80, paddingRight: 80, paddingTop: 20, paddingBottom: 20 },
    historyBtn: {
        backgroundColor: colors.red,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        boxShadow: "0 0 5px rgba(0,0,0,0.3)"
    },
    historyBtnText: {
        color: colors.text,
        fontWeight: "bold",
        fontSize: 16
    },
    content: { flex: 1, paddingTop: 20 },
    picback: { width: 50, height: 50, borderRadius: 25 },
    headerContainer: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        paddingHorizontal: 15,
        marginBottom: 10 
    },
    titleContainer: { 
        boxShadow: "0 0 10px rgba(0,0,0,0.5)", 
        paddingLeft: 20, 
        paddingRight: 20, 
        borderRadius: 50 
    },
    title: { fontSize: 40, fontWeight: "bold", color: colors.red },
    historyBtn: {
        backgroundColor: colors.red,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        boxShadow: "0 0 5px rgba(0,0,0,0.3)"
    }
})

export default Order
