import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { createOrderRound } from '../database/db';
import { styles } from '../style/cartstyle';
import { colors } from '../style/theme';

function Cart({item}) { 
    const db = useSQLiteContext();
    
    // ดึงค่า params จาก item
    const { bill_id = 1, table_name = 'โต๊ะ 1', cart = [] } = item?.params || {};

    const [cartItem, setCartItem] = useState(cart); 
    const [submit, setSubmit] = useState(false);
    
    const handdleAmount = (menu_id, n) => {
        setCartItem(prev => prev.map(item => {
            if (item.menu_id === menu_id) {
                const newAmount = item.amount + n;
                return newAmount > 0 ? { ...item, amount: newAmount } : item;
            }
            return item;
        }));
    };

    const handdleRemove = (menu_id) => {
        setCartItem(prev => prev.filter(item => item.menu_id !== menu_id));
    };

    const totalCartPrice = cartItem.reduce((sum, item) => sum + item.amount * item.unit_price, 0); 

    const handleSubmit = async () => {
        if (cartItem.length === 0) {
            Alert.alert('แจ้งเตือน', 'ต้องเลือกรายการอาหารก่อนสร้างรายการสั่งอาหาร');
            return;
        }
        try {
            setSubmit(true);
            
            const formatItem = cartItem.map(item => ({
                menu_id: item.menu_id,
                amount: item.amount,
                unit_price: item.unit_price,
                status: item.status || 'รอทำ',
            }));

            await createOrderRound(db, bill_id, formatItem);
            Alert.alert('สั่งอาหารเสร็จสิ้น', 'ส่งรายการสั่งอาหารแล้ว', [
                {
                    text: 'ตกลง',
                    onPress: () => {
                        navigation?.navigate('BillHistory', { 
                            bill_id: bill_id, 
                            table_name: table_name 
                        });
                    }
                },
            ]);
            
        } catch (e) {
            console.error('เกิดข้อผิดพลาดในการสั่งอาหาร', e);
            Alert.alert('สั่งอาหารไม่สำเร็จ', 'โปรดลองใหม่อีกครั้ง');
        } finally {
            setSubmit(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>ตะกร้าอาหาร: {table_name}</Text>
            <FlatList
                data={cartItem}
                keyExtractor={(item) => item.menu_id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                            {/* 2. แก้ไข: ใส่ชื่อเมนูอาหารเพิ่มเติมข้างหน้าราคา */}
                            <View style={{ flex: 1 }}>
                                <Text style={styles.menuName}>{item.name}</Text>
                                <Text style={styles.price}>{item.unit_price} บาท / จาน</Text>
                            </View>

                            <View style={styles.qtyContainer}>
                                <TouchableOpacity 
                                    style={styles.qtyBtn} 
                                    onPress={() => handdleAmount(item.menu_id, -1)}>
                                    <Text style={styles.qtyText}>-</Text>
                                </TouchableOpacity>

                                <Text style={styles.amountText}>{item.amount}</Text>

                                <TouchableOpacity 
                                    style={styles.qtyBtn} 
                                    onPress={() => handdleAmount(item.menu_id, 1)}> 
                                    <Text style={styles.qtyText}>+</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.deleteBtn} 
                                    onPress={() => handdleRemove(item.menu_id)}>
                                    <Text style={{ color: 'red' }}>ลบ</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', color: colors.dim || '#888', marginTop: 40 }}>
                        ยังไม่ได้เลือกรายการอาหาร
                    </Text>
                }
            />
            
            <View style={styles.footer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <Text style={styles.totalText}>ราคารวมรอบนี้</Text>
                    <Text style={styles.totalAmount}>{totalCartPrice} บาท</Text>
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, (cartItem.length === 0 || submit) && { opacity: 0.5 }]} 
                    onPress={handleSubmit}
                    disabled={cartItem.length === 0 || submit}>
                    {submit ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>ยืนยันส่งเข้าครัว</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default Cart;