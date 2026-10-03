import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { styles } from '../style/billhistorystyle';
import { colors } from '../style/theme';
import { getBillDetail, getTotalBillPrice } from '../database/db.js';

function BillHistory(props) {
    const db = useSQLiteContext();

    const params = props?.item?.params || props?.item || {};
    const bill_id = props.bill_id ?? props.billId ?? params.bill_id ?? params.billId ?? 1;
    const table_name = props.table_name ?? props.tableName ?? params.table_name ?? params.tableName ?? 'โต๊ะ 1';

    const [items, setItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setIsLoading] = useState(true);

    useEffect(() => {
        loadBillHistory();
    }, [bill_id]);

    const loadBillHistory = async () => {
        try {
            setIsLoading(true);

            const billDetail = await getBillDetail(db, bill_id);
            const total = await getTotalBillPrice(db, bill_id);

            if (billDetail && billDetail.length > 0) {
                setItems(billDetail);
                setTotalPrice(total);
            } 
        } catch (e) {
            console.error('เกิดข้อผิดพลาดในการโหลดรายการ', e);
            setItems([]);
            setTotalPrice(0);
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.green} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {props.onBack && (
                <TouchableOpacity 
                    style={{ marginBottom: 12, paddingVertical: 4 }} 
                    onPress={props.onBack}
                >
                </TouchableOpacity>
            )}

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
                <Text style={styles.totalText}>ยอดรวมทั้งบิล</Text>
                <Text style={styles.totalAmount}>{totalPrice} บาท</Text>
            </View>
        </View>
    );
}

export default BillHistory;