import {
    View, StyleSheet, TouchableOpacity, Image, Text,
    ImageBackground, ScrollView, TextInput, Alert
} from "react-native"
import { colors } from "../src/style/theme"
import { useState, useEffect } from "react"
import { useSQLiteContext } from "expo-sqlite"
import { searchMenu, getAllCategories, addToCart, getCart } from "../database/db"
import { formatBaht } from "../database/money"

function MenuClient({ changepage, billId }) {
    const db = useSQLiteContext()

    const [categories, setCategories] = useState([])
    const [categoryId, setCategoryId] = useState(null) // null = ทั้งหมด
    const [menu, setMenu] = useState([])
    const [cart, setCart] = useState([])
    const [qty, setQty] = useState({})
    const [notes, setNotes] = useState({})
    const [searchText, setSearchText] = useState('')
    const [onlyAvailable, setOnlyAvailable] = useState(true)

    const getQty = id => qty[id] || 1

    function changeQty(id, delta) {
        setQty(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }))
    }

    async function loadCart() {
        if (!billId) { setCart([]); return }
        try { setCart(await getCart(db, billId)) }
        catch (e) { console.log('โหลดตะกร้าไม่สำเร็จ', e) }
    }

    useEffect(() => {
        getAllCategories(db).then(setCategories).catch(e => console.log(e))
    }, [db])

    useEffect(() => {
        searchMenu(db, { categoryId, search: searchText, onlyAvailable })
            .then(setMenu)
            .catch(e => console.log('โหลดเมนูไม่สำเร็จ', e))
    }, [db, categoryId, searchText, onlyAvailable])

    useEffect(() => { loadCart() }, [billId])

    async function addcartfood(menuId) {
        if (!billId) {
            Alert.alert('ไม่พบบิล', 'กรุณากลับไปเลือกโต๊ะใหม่')
            return
        }
        try {
            await addToCart(db, billId, menuId, getQty(menuId), notes[menuId] || '')
            await loadCart()
            setNotes(prev => ({ ...prev, [menuId]: '' }))
            setQty(prev => ({ ...prev, [menuId]: 1 }))
        } catch (error) {
            Alert.alert('เพิ่มลงตะกร้าไม่สำเร็จ', String(error.message || error))
        }
    }

    return (
        <ImageBackground source={require('../photo/MenuClient.jpg')} style={styles.content}>
            <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => changepage('Login')}>
                <Image source={require('../photo/back.png')} style={styles.picback} />
            </TouchableOpacity>

            <View style={styles.top}>
                <View style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)', paddingLeft: 20, paddingRight: 20, borderRadius: 50 }}>
                    <Text style={styles.title}>Menu</Text>
                </View>
            </View>

            <View style={styles.column}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.categoryItem, categoryId === null && styles.categoryActive]}
                        onPress={() => setCategoryId(null)}
                    >
                        <Text>อาหารทั้งหมด</Text>
                    </TouchableOpacity>
                    {categories.map(c => (
                        <TouchableOpacity
                            key={c.category_id}
                            style={[styles.categoryItem, categoryId === c.category_id && styles.categoryActive]}
                            onPress={() => setCategoryId(c.category_id)}
                        >
                            <Text>{c.category_name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.search}>
                <TextInput
                    style={styles.searchfood}
                    placeholder="ค้นหาชื่ออาหาร"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                <TouchableOpacity
                    style={[styles.searchbut, !onlyAvailable && { opacity: 0.5 }]}
                    onPress={() => setOnlyAvailable(v => !v)}
                >
                    <Text style={{ color: colors.text }}>
                        {onlyAvailable ? 'เฉพาะที่มีของ ✓' : 'แสดงทั้งหมด'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
                {menu.length > 0 ? (
                    menu.map(item => (
                        <View style={styles.card} key={item.menu_id}>
                            <Image
                                source={item.image ? { uri: item.image } : require('../photo/OIP.webp')}
                                style={styles.picfood}
                            />
                            <View style={styles.data}>
                                <Text style={styles.namefood}>{item.menu_name}</Text>
                                <Text style={styles.price}>{formatBaht(item.unit_price)} บาท</Text>

                                {item.is_available === 1 ? (
                                    <>
                                        <View style={styles.num}>
                                            <TouchableOpacity style={styles.minusnum} onPress={() => changeQty(item.menu_id, -1)}>
                                                <Text style={{ color: colors.text }}>-</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.numfood}>{getQty(item.menu_id)}</Text>
                                            <TouchableOpacity style={styles.addnum} onPress={() => changeQty(item.menu_id, 1)}>
                                                <Text style={{ color: colors.text }}>+</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <TextInput
                                            style={styles.note}
                                            placeholder="หมายเหตุ เช่น ไม่ใส่ผักชี"
                                            value={notes[item.menu_id] || ''}
                                            onChangeText={text => setNotes(prev => ({ ...prev, [item.menu_id]: text }))}
                                        />

                                        <TouchableOpacity style={styles.addcart} onPress={() => addcartfood(item.menu_id)}>
                                            <Text style={{ color: colors.text }}>เพิ่มอาหารเข้าตะกร้า</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <Text style={styles.soldout}>หมดชั่วคราว</Text>
                                )}
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.noData}>
                        <Text style={styles.noDataText}>ไม่มีเมนู</Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.bottombar}>
                <TouchableOpacity style={styles.page} onPress={() => changepage('MenuClient', billId)}>
                    <Text style={styles.titlepage}>เมนูอาหาร</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.page} onPress={() => changepage('Cart', billId)}>
                    <Text style={styles.titlepage}>ตะกร้าอาหาร</Text>
                    {cart.length > 0 && (
                        <View style={styles.cartCount}>
                            <Text style={styles.cartCountText}>{cart.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.page} onPress={() => changepage('BillHistory', billId)}>
                    <Text style={styles.titlepage}>ประวัติการสั่ง</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    content: { flex: 1, paddingTop: 20 },
    picback: { width: 50, height: 50, borderRadius: 25, position: 'absolute', left: 0 },
    top: { alignItems: 'center' },
    title: { fontSize: 50, fontWeight: 'bold', color: colors.red },
    column: { flexDirection: 'row', backgroundColor: colors.text, marginTop: 15 },
    categoryItem: { borderColor: colors.red, borderWidth: 2, backgroundColor: colors.text, padding: 10 },
    categoryActive: { backgroundColor: 'rgba(253, 47, 129, 0.3)' },
    search: { padding: 5, flexDirection: 'row', alignItems: 'center' },
    searchfood: {
        backgroundColor: colors.text, padding: 12, borderRadius: 25, marginBottom: 5,
        marginTop: 5, boxShadow: '0 0 6px rgba(0, 0, 0, 0.5)', flex: 1
    },
    searchbut: {
        backgroundColor: colors.red, paddingLeft: 12, paddingRight: 12,
        justifyContent: 'center', borderRadius: 20, height: 40, marginLeft: 5
    },
    card: {
        backgroundColor: colors.text, padding: 5, flexDirection: 'row',
        borderBottomWidth: 1, borderColor: 'rgba(232, 227, 227, 1)'
    },
    picfood: { width: 150, height: 170 },
    data: { padding: 10, flex: 1 },
    namefood: { fontWeight: 'bold', fontSize: 19 },
    price: { fontSize: 16, marginBottom: 8 },
    soldout: { color: colors.red, fontWeight: 'bold', fontSize: 16, marginTop: 10 },
    num: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    numfood: { marginHorizontal: 12, fontSize: 16 },
    addnum: { backgroundColor: colors.red, paddingVertical: 2, paddingHorizontal: 10, borderRadius: 20 },
    minusnum: { backgroundColor: colors.red, paddingVertical: 2, paddingHorizontal: 12, borderRadius: 20 },
    note: {
        borderColor: 'rgba(172, 169, 169, 0.9)', borderWidth: 1, borderRadius: 15,
        height: 35, paddingLeft: 10, marginBottom: 6
    },
    addcart: { padding: 8, backgroundColor: colors.red, borderRadius: 5, alignSelf: 'flex-start' },
    bottombar: { flexDirection: 'row', position: 'absolute', bottom: 0, left: 0, right: 0 },
    page: {
        borderColor: colors.text, borderTopWidth: 2, borderWidth: 1, flex: 1, height: 70,
        alignItems: 'center', justifyContent: 'center', backgroundColor: colors.red
    },
    titlepage: { color: colors.text, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
    cartCount: {
        position: 'absolute', top: 5, right: 15, minWidth: 22, height: 22, borderRadius: 11,
        backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center'
    },
    cartCountText: { color: colors.red, fontWeight: 'bold' },
    noData: { alignItems: 'center', marginTop: 60 },
    noDataText: {
        color: colors.red, fontSize: 20, fontWeight: 'bold',
        backgroundColor: 'rgba(253, 253, 253, 0.7)', borderRadius: 15, padding: 20
    }
})

export default MenuClient