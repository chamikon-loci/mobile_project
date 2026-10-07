import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
// import { useSQLiteContext } from 'expo-sqlite';
// import { createOrderRound } from '../database/db';
import { styles } from '../style/cartstyle';
import { colors } from '../style/theme';
// ทดลอง *******************************************************************************
const test_menu = [
    {   menu_id: 1,
        name: 'food1', 
        unit_price: 50, 
        amount: 1, 
        note: 'ไม่ผัก',
        image_url: 'https://img.wongnai.com/p/1968x0/2026/09/09/fb618e99859b48d3a69037722754ca22.jpg'
    },
    {   menu_id: 2,
        name: 'food2', 
        unit_price: 60, 
        amount: 2, 
        note: 'เผ็ดมาก',
        image_url: 'https://img.wongnai.com/p/400x0/2026/07/01/3cfab8828e5b4c32b41b0fb6def463fa.jpg'
    },
    {   menu_id: 3, 
        name: 'food3', 
        unit_price: 40, 
        amount: 1, 
        note: '',
        image_url: 'https://img.wongnai.com/p/1968x0/2026/09/05/47a0ad1f819a4a2cb79b143d03434185.jpg'
    },
];
//***********************************************************************************************
function Cart({ item, navigation }) {
    // const db = useSQLiteContext();

    const { bill_id = 1, table_name = 'โต๊ะ 1', cart = test_menu } = item?.params || {};

    const [cartItem, setCartItem] = useState(cart); 
    const [submit, setSubmit] = useState(false);
    
    useEffect(() => {
        setCartItem(cart.length > 0 ? cart : test_menu);
    }, [cart]);

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
                note: item.note || '', 
                status: 'รอทำ',
            }));

            Alert.alert('สั่งอาหารเสร็จสิ้น', 'ส่งรายการสั่งอาหารเข้าครัวแล้ว', [
                {
                    text: 'ตกลง',
                    onPress: () => {
                        navigation?.navigate('BillHistory');
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
                        {item.image_url ? (
                            <Image source={{ uri: item.image_url }} style={styles.foodImage} />
                        ) : null}
                        <View style={styles.itemDetails}>
                            <Text style={styles.menuName}>{item.name}</Text>
                            <Text style={styles.price}>{item.unit_price} บาท </Text>
                            {item.note ? (
                                <Text style={styles.noteText}>"{item.note}"</Text>
                            ) : null}
                        </View>
                        <View style={styles.actionContainer}>
                            <TouchableOpacity 
                                style={styles.deleteBtn} 
                                onPress={() => handdleRemove(item.menu_id)}>
                                <Text style={styles.deleteBtnText}>X</Text>
                            </TouchableOpacity>

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
                            </View>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', color: colors.dim, marginTop: 40 }}>
                        ยังไม่ได้เลือกรายการอาหาร
                    </Text>
                }
            />
            
            <View style={styles.footer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <Text style={styles.totalText}>ราคารวม</Text>
                    <Text style={styles.totalAmount}>{totalCartPrice} บาท</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity 
                        style={[
                            styles.submitButton, { flex: 1, backgroundColor: colors.dim}
                        ]} 
                        onPress={() => {
                        }}>
                        <Text style={[styles.submitButtonText, { color: colors.bg }]}>ย้อนกลับ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[
                            styles.submitButton, 
                            { flex: 2 }, 
                            (cartItem.length === 0 || submit) && { opacity: 0.5 }
                        ]} 
                        onPress={handleSubmit}
                        disabled={cartItem.length === 0 || submit}>
                        {submit ? (
                            <ActivityIndicator color={colors.bg} />
                        ) : (
                            <Text style={styles.submitButtonText}>ยืนยันส่งเข้าครัว</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

export default Cart;