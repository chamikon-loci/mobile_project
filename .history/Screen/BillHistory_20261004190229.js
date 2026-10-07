import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
//import { useNavigation } from '@react-navigation/native';
import { styles } from '../style/billhistorystyle';
import { colors } from '../style/theme';

// import { useSQLiteContext } from 'expo-sqlite';
// import { getBillDetail, getTotalBillPrice } from '../database/db';

/*ทดลอง*******************************************************************************/
const test_bill = [
    { round: 1, menu_name: 'food1', amount: 1, unit_price: 50, total_price: 50, status: 'เสิร์ฟแล้ว' },
    { round: 1, menu_name: 'food2', amount: 2, unit_price: 60, total_price: 120, status: 'กำลังทำ' },
    { round: 2, menu_name: 'food3', amount: 1, unit_price: 40, total_price: 40, status: 'รอทำ' },
];
/*************************************************************************************/
function BillHistory({ route, navigation }) {
    // const db = useSQLiteContext();
    //const navigation = useNavigation();

    const { bill_id = 1, table_name = 'โต๊ะ 1' } = route?.params || {};

    const [items] = useState(test_bill);
    const totalPrice = items.reduce((sum, item) => sum + item.total_price, 0);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>ประวัติการสั่งอาหาร: {table_name}</Text>
            <FlatList
                data={items}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.menuName}>
                                [รอบ {item.round}] {item.menu_name} (x{item.amount})
                            </Text>
                            <Text style={styles.status}>สถานะ: {item.status}</Text>
                        </View>
                        <Text style={styles.price}>{item.total_price} บาท</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', color: colors.dim, marginTop: 20 }}>
                        ยังไม่มีรายการอาหารในบิลนี้
                    </Text>
                }
            />  
            <View style={styles.footer}>
                <Text style={styles.totalText}>ยอดรวมทั้งบิล : </Text>
                <Text style={styles.totalAmount}>{totalPrice} บาท</Text>
            </View>
            <TouchableOpacity 
                style={styles.backButton}>{/*กลับหน้าเลือก menu */}
                <Text style={styles.backButtonText}>ย้อนกลับ</Text>
            </TouchableOpacity>
        </View>
    );
}

export default BillHistory;