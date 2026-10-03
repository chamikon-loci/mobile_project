import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { createOrderRound } from '../database/db';
import { styles } from '../style/cartstyle';
import { colors } from '../style/theme';
import BillHistory from './BillHistory';

function Cart(props) {
    const params = props?.item?.params || {};
    const billId = params.bill_id ?? props.billId ?? 1;
    const tableName = params.table_name ?? props.tableName ?? "โต๊ะ 1";
    const cart = params.cart ?? props.cart ?? test_menu;

    const db = useSQLiteContext();
    const [cartItem, setCartItem] = useState(cart); 
    const [submit, setSubmit] = useState(false);

    const [showBillHistory, setShowBillHistory] = useState(false);

    useEffect(() => {
        if (cart && cart.length > 0) {
            setCartItem(cart);
        }
    }, [cart]);

    const handleAmount = (menu_id, n) => {
        setCartItem(prev => prev.map(item => {
            if (item.menu_id === menu_id) {
                const newAmount = item.amount + n;
                return newAmount > 0 ? { ...item, amount: newAmount } : item;
            }
            return item;
        }));
    };

    const handleRemove = (menu_id) => {
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

            await createOrderRound(db, billId, formatItem);
            setCartItem([]);
            Alert.alert('สั่งอาหารเสร็จสิ้น', 'ส่งรายการสั่งอาหารเข้าครัวแล้ว', [
                {
                    text: 'ตกลง',
                    onPress: () => {
                        setShowBillHistory(true);
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

        if (showBillHistory) {
        return (
            <BillHistory 
                cart={cartItem} 
                bill_id={billId} 
                table_name={tableName} 
                onBack={() => setShowBillHistory(false)} 
            />
        );
        }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>ตะกร้าอาหาร: {tableName}</Text>
            
            <FlatList
                data={cartItem}
                keyExtractor={(item, index) => item.menu_id ? item.menu_id.toString() : index.toString()}
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
                                onPress={() => handleRemove(item.menu_id)}>
                                <Text style={styles.deleteBtnText}>X</Text>
                            </TouchableOpacity>

                            <View style={styles.qtyContainer}>
                                <TouchableOpacity 
                                    style={styles.qtyBtn} 
                                    onPress={() => handleAmount(item.menu_id, -1)}>
                                    <Text style={styles.qtyText}>-</Text>
                                </TouchableOpacity>

                                <Text style={styles.amountText}>{item.amount}</Text>

                                <TouchableOpacity 
                                    style={styles.qtyBtn} 
                                    onPress={() => handleAmount(item.menu_id, 1)}> 
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

                <TouchableOpacity 
                    style={[styles.submitButton, (cartItem.length === 0 || submit) && { opacity: 0.5 }]} 
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
    );
}

export default Cart;