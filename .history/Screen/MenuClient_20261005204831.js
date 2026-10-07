import { View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground, ScrollView, TextInput } from "react-native"
import { colors } from "../src/style/theme"
import { useState, useEffect } from "react"
import { DATABASE_NAME, getMenu, openDATABASE, getAllCategories, getAllMenu, addToCart, getCart } from "../database/db"
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite"

function MenuClient({ changepage, billId }) {
    return (
        <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
            <MenuClientScreen changepage={changepage} billId={billId} />
        </SQLiteProvider>
    )
}

function MenuClientScreen({ changepage, billId }) {
    const db = useSQLiteContext()
    const [categories, setCategories] = useState([])
    const [menu, setMenu] = useState([])
    const [cart, setCart] = useState([])
    
    // เปลี่ยนเป็นเก็บสถานะแยกตาม menu_id
    const [foodCounts, setFoodCounts] = useState({})
    const [notes, setNotes] = useState({})
    const [searchText, setSearchText] = useState("")

    // ฟังก์ชันจัดการจำนวนอาหารแยกตาม menu_id
    const numbuyfood = (menuId, check) => {
        setFoodCounts(prev => {
            const currentCount = prev[menuId] || 1
            if (check) {
                return { ...prev, [menuId]: currentCount + 1 }
            } else if (currentCount > 1) {
                return { ...prev, [menuId]: currentCount - 1 }
            }
            return prev
        })
    }

    const addcartfood = async (menuId, price) => {
        if (!billId) {
            console.log("ไม่พบ Bill ID")
            return
        }

        const numoffood = foodCounts[menuId] || 1

        try {
            await addToCart(db, billId, menuId, numoffood, price, notes[menuId] || "")
            setCart(await getCart(db, billId))
            // รีเซ็ตค่าเฉพาะเมนูนั้นๆ หลังเพิ่มลงตะกร้า
            setNotes(prev => ({ ...prev, [menuId]: "" }))
            setFoodCounts(prev => ({ ...prev, [menuId]: 1 }))
        } catch (error) {
            console.log("เพิ่มอาหารลงตะกร้าไม่สำเร็จ", error)
        }
    }

    const loadMenu = async categoryid => {
        try {
            const data = await getMenu(db, categoryid)
            setMenu(data)
        } catch (error) {
            console.log("ไม่สามารถโหลดข้อมูลเมนูได้", error)
        }
    }

    const AllMenu = async () => {
        try {
            const data = await getAllMenu(db)
            // หากตาราง Menu ไม่มีคอลัมน์ is_available ให้ใช้ data ตรงๆ ได้เลยครับ
            setMenu(data)
        } catch (error) {
            console.log("ไม่สามารถโหลดข้อมูลเมนูได้", error)
        }
    }

    const loadCategories = async () => {
        try {
            setCategories(await getAllCategories(db))
        } catch (error) {
            console.log("โหลดหมวดหมู่ไม่สำเร็จ", error)
        }
    }

    const loadCurrentCart = async () => {
        if (!billId) {
            setCart([])
            return
        }

        try {
            setCart(await getCart(db, billId))
        } catch (error) {
            console.log("โหลดตะกร้าไม่สำเร็จ", error)
        }
    }

    useEffect(() => {
        loadCategories()
        AllMenu()
        loadCurrentCart()
    }, [billId])

    const filteredMenu = menu.filter(item =>
        item.menu_name?.toLowerCase().includes(searchText.toLowerCase())
    )

    const openCart = () => changepage("Cart", billId)
    const openHistory = () => changepage("BillHistory", billId)

    return (
        <ImageBackground source={require("../photo/MenuClient.jpg")} style={styles.content}>
            <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => changepage("Login")}>
                <Image source={require("../photo/back.png")} style={styles.picback} />
            </TouchableOpacity>

            <View style={styles.top}>
                <View style={{ paddingLeft: 20, paddingRight: 20, borderRadius: 50 }}>
                    <Text style={styles.title}>Menu</Text>
                </View>
            </View>

            {/* แถบแสดงหมวดหมู่ */}
            <View style={styles.column}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryItem}>
                        <TouchableOpacity style={styles.categoryButton} onPress={AllMenu}>
                            <Text style={{ fontWeight: 'bold' }}>อาหารทั้งหมด</Text>
                        </TouchableOpacity>
                    </View>

                    {categories.map(category => (
                        <View key={category.category_id} style={styles.categoryItem}>
                            <TouchableOpacity
                                style={styles.categoryButton}
                                onPress={() => loadMenu(category.category_id)}
                            >
                                <Text>{category.category_name}</Text>
                            </TouchableOpacity>
                        </View>
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
                <TouchableOpacity style={styles.searchbut}>
                    <Text style={{ color: colors.text }}>ค้นหา</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
                <View style={styles.listfood}>
                    {filteredMenu.length ? filteredMenu.map(item => {
                        const currentNum = foodCounts[item.menu_id] || 1;
                        return (
                            <View style={styles.card} key={item.menu_id}>
                                <Image source={item.image 
            ? { uri: item.image } 
            : require("../photo/OIP.webp")} style={styles.picfood} />

                                <View style={styles.data}>
                                    <View style={styles.namedata}>
                                        <Text>Name :</Text>
                                        <TextInput style={styles.namefood} editable={false} value={item.menu_name} />
                                    </View>

                                    <View style={styles.namedata}>
                                        <Text>Price :</Text>
                                        <TextInput
                                            style={styles.datafood}
                                            editable={false}
                                            value={item.unit_price ? item.unit_price.toFixed(2) : "0.00"}
                                        />
                                    </View>

                                    <View style={styles.namedata}>
                                        <Text>Promotion :</Text>
                                        <TextInput style={styles.datafood} editable={false} value="none" />
                                    </View>

                                    <View style={styles.option}>
                                        <View style={styles.namedata}>
                                            <Text>จำนวน :</Text>

                                            <View style={styles.num}>
                                                <TouchableOpacity
                                                    style={styles.minusnum}
                                                    onPress={() => numbuyfood(item.menu_id, false)}
                                                >
                                                    <Text style={{ color: colors.text }}>-</Text>
                                                </TouchableOpacity>

                                                <TextInput
                                                    style={styles.numfood}
                                                    editable={false}
                                                    value={String(currentNum)}
                                                />

                                                <TouchableOpacity
                                                    style={styles.addnum}
                                                    onPress={() => numbuyfood(item.menu_id, true)}
                                                >
                                                    <Text style={{ color: colors.text }}>+</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <TextInput
                                            style={styles.note}
                                            placeholder="หมายเหตุ"
                                            value={notes[item.menu_id] || ""}
                                            onChangeText={text =>
                                                setNotes(prev => ({
                                                    ...prev,
                                                    [item.menu_id]: text
                                                }))
                                            }
                                        />

                                        <TouchableOpacity
                                            style={styles.addcart}
                                            onPress={() => addcartfood(item.menu_id, item.unit_price)}
                                        >
                                            <Text style={{ color: colors.text, textAlign: 'center' }}>เพิ่มอาหารเข้าตะกร้า</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    }) : (
                        <View style={styles.noData}>
                            <Text style={styles.noDataText}>ไม่มีเมนู</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={styles.bottombar}>
                <TouchableOpacity
                    style={styles.page}
                    onPress={() => changepage("MenuClient", billId)}
                >
                    <Text style={styles.titlepage}>เมนูอาหาร</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.page} onPress={openCart}>
                    <Text style={styles.titlepage}>ตะกร้าอาหาร</Text>

                    {cart.length > 0 && (
                        <View style={styles.cartCount}>
                            <Text style={styles.cartCountText}>{cart.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.page} onPress={openHistory}>
                    <Text style={styles.titlepage}>ประวัติการสั่ง</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    content: { flex: 1, paddingTop: 40 },
    picback: { width: 50, height: 50, borderRadius: 25, position: "absolute", left: 0 },
    top: { alignItems: "center" },
    title: { fontSize: 50, fontWeight: "bold", color: colors.red },
    column: { flexDirection: "row", backgroundColor: colors.text, marginTop: 15, justifyContent: "space-between" },
    categoryItem: { borderColor: colors.red, borderWidth: 2, backgroundColor: colors.text, flex: 1, padding: 10 },
    categoryButton: {},
    searchfood: { backgroundColor: colors.text, padding: 12, borderRadius: 25, marginBottom: 5, marginTop: 5, alignItems: "center", boxShadow: "0 0 6px rgba(0, 0, 0, 0.5)", flex: 1 },
    searchbut: { backgroundColor: colors.red, paddingLeft: 15, paddingRight: 15, justifyContent: "center", borderRadius: 20, height: 40 },
    search: { padding: 5, flexDirection: "row", alignItems: "center" },
    listfood: { flexDirection: "column" },
    card: { backgroundColor: colors.text, padding: 5, flexDirection: "row", borderBottomWidth: 1, borderColor: "rgba(232, 227, 227, 1)" },
    picfood: { width: 180, height: 200 },
    data: { padding: 10 },
    namedata: { flexDirection: "row", alignItems: "center" },
    namefood: { borderColor: "rgba(172, 169, 169, 0.9)", fontWeight: "bold", fontSize: 19, borderWidth: 1, height: 25, padding: 0, width: 150, marginBottom: 5, paddingLeft: 5, borderRadius: 15 },
    datafood: { borderColor: "rgba(172, 169, 169, 0.9)", fontSize: 15, borderWidth: 1, height: 25, padding: 0, width: 150, marginBottom: 5, borderRadius: 15, paddingLeft: 5, paddingRight: 5 },
    option: { marginTop: 15 },
    addcart: { padding: 5, backgroundColor: colors.red, marginRight: 10, borderRadius: 5 },
    num: { flexDirection: "row" },
    numfood: { borderColor: "rgba(172, 169, 169, 0.9)", fontSize: 15, borderWidth: 1, height: 25, padding: 0, marginBottom: 5, borderRadius: 15, paddingLeft: 5, paddingRight: 5 },
    addnum: { backgroundColor: colors.red, paddingTop: 1, paddingBottom: 1, marginLeft: 10, paddingLeft: 8, paddingRight: 8, borderRadius: 20, justifyContent: "center", marginBottom: 5 },
    minusnum: { backgroundColor: colors.red, paddingTop: 1, paddingBottom: 1, marginRight: 10, paddingLeft: 11, paddingRight: 11, borderRadius: 20, justifyContent: "center", marginBottom: 5 },
    note: { borderColor: "rgba(172, 169, 169, 0.9)", borderWidth: 1, borderRadius: 15, height: 35, paddingLeft: 10, marginBottom: 5 },
    bottombar: { flexDirection: "row", justifyContent: "space-around", position: "absolute", bottom: 0, left: 0, right: 0 },
    page: { borderColor: colors.text, borderTopWidth: 2, borderWidth: 1, flex: 1, height: 70, alignItems: "center", justifyContent: "center", backgroundColor: colors.red },
    titlepage: { color: colors.text, fontSize: 16, fontWeight: "bold", textAlign: "center" },
    cartCount: { position: "absolute", top: 5, right: 20, minWidth: 22, height: 22, borderRadius: 11, backgroundColor: colors.text, alignItems: "center", justifyContent: "center" },
    cartCountText: { color: colors.red, fontWeight: "bold" },
    noData: { justifyContent: "center", height: "70%", alignItems: "center" },
    noDataText: { color: colors.red, fontSize: 20, fontWeight: "bold", backgroundColor: "rgba(253, 253, 253, 0.7)", borderRadius: 15, paddingLeft: 80, paddingRight: 80, paddingTop: 20, paddingBottom: 20 }
})

export default MenuClient