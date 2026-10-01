import { View, Text, Button } from 'react-native'
import { useSQLiteContext } from "expo-sqlite"
import { useState, useEffect } from 'react'
import { getAllOrder } from "../database/db"

function OrderForChef() {

    const db = useSQLiteContext()

    const [orders, setOrders] = useState([])

    const loadOrders = async () => {
        try {
            const result = await getAllOrder(db)
            setOrders(result)
        } catch (error) {
            console.error("เกิดข้อผิดพลาด โหลดข้อมูลออเดอร์ไม่ได้: ", error)
        }
    }

    useEffect(() => {
        loadOrders()
    }, [])

    return (
        <View>
            <Button title="Refresh" onPress={loadOrders} />
            {orders.length > 0 ? <Text>มีออเดอร์</Text> : <Text>ไม่มีออเดอร์</Text>}
            {orders.map((order) => (
                <Text key={order.order_item_id}>
                    โต๊ะ {order.table_name} - {order.menu_name} x{order.amount}
                </Text>
            ))}
        </View>
    )
}

export default OrderForChef