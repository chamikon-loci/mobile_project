import { View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground, ScrollView } from "react-native"
import { colors } from "../src/style/theme"
import { useEffect, useState } from "react"
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite"
import { DATABASE_NAME, getAllOrder, openDATABASE } from "../database/db"

function Orderhistory({ changepage }) {
    return (
        <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
            <OrderhistoryScreen changepage={changepage} />
        </SQLiteProvider>
    )
}

function OrderhistoryScreen({ changepage }) {
    const db = useSQLiteContext()
    const [historyOrders, setHistoryOrders] = useState([])

    const loadHistory = async () => {
        try {
            const allOrders = await getAllOrder(db)

            const finished = allOrders.filter(item => item.status === "เสิร์ฟแล้ว" || item.status === "ยกเลิก")
            setHistoryOrders(finished)
        } catch (error) {
            console.log("โหลดประวัติ Order ไม่สำเร็จ", error)
        }
    }

    useEffect(() => {
        loadHistory()
    }, [])

    const pages = [
        ["TableMap", "Table"],
        ["Order", "Order"],
        ["History", "History"],
        ["Menu", "Menu"],
        ["Account", "Account"]
    ]

    return (
        <ImageBackground source={require("../photo/order.jpg")} style={styles.content}>
            <ScrollView contentContainerStyle={styles.fixarea}>
                <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => changepage("Order")}>
                    <Image source={require("../photo/back.png")} style={styles.picback} />
                </TouchableOpacity>

                <View style={styles.top}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>History</Text>
                    </View>
                </View>

                <View style={styles.middle}>
                    {historyOrders.length ? historyOrders.map(item => (
                        <View style={styles.order} key={item.order_item_id}>
                            <View style={styles.rownotable}>
                                <Text style={styles.notable}>โต๊ะที่ {item.table_name}</Text>
                                <Text style={styles.numround}>
                                    รอบที่ {item.round} เวลา : {formatThaiDateTime(roundItems[0]?.order_at)}
                                </Text>
                            </View>

                            <View style={styles.columnorder}>
                                {["ชื่อ", "จำนวน", "เพิ่มเติม", "หมายเหตุ"].map(text => (
                                    <Text style={styles.columntop} key={text}>{text}</Text>
                                ))}
                            </View>

                            <View style={styles.menu}>
                                <View style={styles.rowmenu}>
                                    <Text style={[
                                        styles.column,
                                        item.status === "ยกเลิก" && { textDecorationLine: "line-through", color: "gray" }
                                    ]}>
                                        {item.order_menu_name}
                                    </Text>
                                    <Text style={styles.column}>{item.amount}</Text>
                                    <Text style={styles.column}>{item.extra || "-"}</Text>
                                    <Text style={styles.column}>{item.note || "-"}</Text>
                                </View>
                            </View>

                            <View style={styles.rowstatus}>
                                <Text style={{
                                    color: item.status === "ยกเลิก" ? "red" : "green",
                                    fontWeight: "bold"
                                }}>
                                    {item.status === "ยกเลิก"
                                        ? `สถานะ : ยกเลิก${item.cancelled_at ? ` เมื่อ ${item.cancelled_at}` : ""}`
                                        : "สถานะ : เสิร์ฟแล้วเรียบร้อย"}
                                </Text>
                            </View>
                        </View>
                    )) : (
                        <View style={styles.noData}>
                            <View style={styles.framedata}>
                                <Text style={styles.noDataText}>ยังไม่มีประวัติออร์เดอร์</Text>
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
    titleContainer: { paddingLeft: 20, paddingRight: 20, borderRadius: 50 },
    title: { fontSize: 50, fontWeight: "bold", color: colors.red },
    middle: { paddingLeft: 25, paddingRight: 25 },
    order: { justifyContent: "center", marginTop: 20, backgroundColor: "white", borderRadius: 15, padding: 10 },
    rownotable: { borderBottomColor: colors.bg, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    notable: { fontSize: 18 },
    numround: { fontSize: 14, color: colors.dim },
    columnorder: { flexDirection: "row", justifyContent: "space-between", borderBottomColor: colors.bg, borderBottomWidth: 1 },
    columntop: { width: 55 },
    menu: { paddingTop: 5 },
    rowmenu: { flexDirection: "row", justifyContent: "space-between" },
    column: { width: 55 },
    rowstatus: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, alignItems: "center" },
    bottombar: { flexDirection: "row", justifyContent: "space-around", position: "absolute", bottom: 0, left: 0, right: 0 },
    page: { borderColor: colors.text, borderTopWidth: 2, borderWidth: 1, flex: 1, height: 70, alignItems: "center", justifyContent: "center", backgroundColor: colors.red },
    titlepage: { color: colors.text, fontSize: 16, fontWeight: "bold" },
    fixarea: { paddingBottom: 90 },
    noData: { flex: 1, alignItems: "center" },
    framedata: { alignItems: "center" },
    noDataText: { color: colors.red, fontSize: 20, fontWeight: "bold", marginTop: 200, backgroundColor: "rgba(253, 253, 253, 0.7)", borderRadius: 15, paddingLeft: 40, paddingRight: 40, paddingTop: 20, paddingBottom: 20 }
})

export default Orderhistory