import {
    View, StyleSheet, TouchableOpacity, Image, Text,
    ImageBackground, ScrollView, TextInput, Alert
} from "react-native"
import { colors } from "../src/style/theme"
import { useState, useEffect } from "react"
import { useSQLiteContext } from "expo-sqlite"
import * as ImagePicker from 'expo-image-picker'
import {
    searchMenu, saveMenu, addMenu, getAllCategories, addCategory,
    deleteCategory, deleteMenu, setMenuAvailable
} from "../database/db"
import { formatBaht, bahtToSatang } from "../database/money"

function Menu({ changepage }) {
    const db = useSQLiteContext()

    const [tab, setTab] = useState('list') // list | form | category
    const [menu, setMenu] = useState([])
    const [categories, setCategories] = useState([])

    // ตัวกรองรายการ (ข2)
    const [filterCat, setFilterCat] = useState(null)
    const [searchText, setSearchText] = useState('')
    const [onlyAvailable, setOnlyAvailable] = useState(false)

    // ฟอร์มเพิ่ม/แก้ไข
    const [editMenu, setEditMenu] = useState(null) // null = เพิ่มใหม่
    const [fName, setFName] = useState('')
    const [fPrice, setFPrice] = useState('')
    const [fCat, setFCat] = useState(null)
    const [fImage, setFImage] = useState(null)
    const [showDropdown, setShowDropdown] = useState(false)

    const [categoryName, setCategoryName] = useState('')

    async function loadMenu() {
        try {
            setMenu(await searchMenu(db, { categoryId: filterCat, search: searchText, onlyAvailable }))
        } catch (e) { console.log('โหลดเมนูไม่สำเร็จ', e) }
    }

    async function loadCategories() {
        try { setCategories(await getAllCategories(db)) }
        catch (e) { console.log('โหลดหมวดหมู่ไม่สำเร็จ', e) }
    }

    useEffect(() => { loadCategories() }, [db])
    useEffect(() => { loadMenu() }, [db, filterCat, searchText, onlyAvailable])

    async function pickImage() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.4,
            base64: true
        })
        if (!result.canceled && result.assets[0].base64) {
            // เก็บเป็น data URI ในฐานข้อมูล เพื่อให้รูปไม่หายเมื่อเปิดแอปใหม่
            setFImage(`data:image/jpeg;base64,${result.assets[0].base64}`)
        }
    }

    function openForm(item) {
        setEditMenu(item || null)
        setFName(item ? item.menu_name : '')
        setFPrice(item ? formatBaht(item.unit_price) : '')
        setFCat(item ? item.category_id : null)
        setFImage(item ? item.image : null)
        setShowDropdown(false)
        setTab('form')
    }

    async function saveForm() {
        const price = bahtToSatang(fPrice)
        if (!fName.trim() || price === null || !fCat) {
            Alert.alert('กรอกข้อมูลไม่ครบ', 'ต้องมีชื่อ ราคา (ตัวเลข) และหมวดหมู่')
            return
        }
        try {
            if (editMenu) {
                await saveMenu(db, editMenu.menu_id, fName.trim(), price, fCat, fImage)
            } else {
                await addMenu(db, fName.trim(), price, fCat, fImage)
            }
            await loadMenu()
            setTab('list')
        } catch (e) {
            Alert.alert('บันทึกเมนูไม่สำเร็จ', String(e.message || e))
        }
    }

    async function toggleAvailable(item) {
        try {
            await setMenuAvailable(db, item.menu_id, item.is_available !== 1)
            await loadMenu()
        } catch (e) { console.log('เปลี่ยนสถานะไม่สำเร็จ', e) }
    }

    function confirmDeleteMenu(item) {
        Alert.alert('ลบเมนู', `ลบ ${item.menu_name} ใช่หรือไม่?`, [
            { text: 'ยกเลิก', style: 'cancel' },
            {
                text: 'ลบ', style: 'destructive',
                onPress: async () => {
                    try { await deleteMenu(db, item.menu_id); await loadMenu() }
                    catch (e) { Alert.alert('ลบไม่ได้', String(e.message || e)) }
                }
            }
        ])
    }

    async function saveCategory() {
        if (!categoryName.trim()) return
        try {
            await addCategory(db, categoryName.trim())
            await loadCategories()
            setCategoryName('')
            setTab('list')
        } catch (e) {
            Alert.alert('เพิ่มหมวดหมู่ไม่สำเร็จ', 'ชื่อหมวดหมู่อาจซ้ำกัน')
        }
    }

    async function removeCategory(id) {
        try {
            await deleteCategory(db, id)
            if (filterCat === id) setFilterCat(null)
            await loadCategories()
        } catch (e) {
            Alert.alert('ลบหมวดหมู่ไม่ได้', String(e.message || e))
        }
    }

    return (
        <ImageBackground source={require('../photo/order.jpg')} style={styles.content}>
            <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => changepage('Login')}>
                <Image source={require('../photo/back.png')} style={styles.picback} />
            </TouchableOpacity>
            <View style={styles.top}>
                <Text style={styles.title}>Menu</Text>
            </View>

            <View style={styles.table}>
                <View style={styles.column}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity style={styles.category} onPress={() => setTab('category')}>
                            <Text style={styles.categoryname}>+ หมวดหมู่อาหาร</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.categoryButton, filterCat === null && styles.categoryButtonActive]}
                            onPress={() => { setFilterCat(null); setTab('list') }}
                        >
                            <Text>ทั้งหมด</Text>
                        </TouchableOpacity>
                        {categories.map(c => (
                            <View key={c.category_id} style={styles.categoryItem}>
                                <TouchableOpacity
                                    style={[styles.categoryButton, filterCat === c.category_id && styles.categoryButtonActive]}
                                    onPress={() => { setFilterCat(c.category_id); setTab('list') }}
                                >
                                    <Text>{c.category_name}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteCategory} onPress={() => removeCategory(c.category_id)}>
                                    <Text style={styles.deleteCategoryText}>×</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {tab === 'list' && (
                    <>
                        <View style={styles.searchRow}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="ค้นหาชื่อเมนู"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            <TouchableOpacity
                                style={[styles.fix, !onlyAvailable && { opacity: 0.5 }]}
                                onPress={() => setOnlyAvailable(v => !v)}
                            >
                                <Text style={{ color: colors.text }}>เฉพาะที่มีของ</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ paddingBottom: 90, flexGrow: 1 }}>
                            <View style={styles.addfood}>
                                <TouchableOpacity style={styles.butaddfood} onPress={() => openForm(null)}>
                                    <Text style={{ fontSize: 20 }}>เพิ่มเมนูอาหาร</Text>
                                </TouchableOpacity>
                            </View>

                            {menu.length > 0 ? menu.map(item => (
                                <View style={styles.card} key={item.menu_id}>
                                    <Image
                                        source={item.image ? { uri: item.image } : require('../photo/OIP.webp')}
                                        style={styles.picfood}
                                    />
                                    <View style={styles.data}>
                                        <Text style={styles.namefood}>{item.menu_name}</Text>
                                        <Text>ราคา : {formatBaht(item.unit_price)} บาท</Text>
                                        <Text>หมวด : {item.category_name || '-'}</Text>
                                        <Text style={{ color: item.is_available === 1 ? 'green' : colors.red, fontWeight: 'bold' }}>
                                            สถานะ : {item.is_available === 1 ? 'เปิดการขาย' : 'ปิดการขาย'}
                                        </Text>
                                        <View style={styles.option}>
                                            <TouchableOpacity style={styles.fix} onPress={() => toggleAvailable(item)}>
                                                <Text style={{ color: colors.text }}>
                                                    {item.is_available === 1 ? 'ปิดการขาย' : 'เปิดการขาย'}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.fix} onPress={() => confirmDeleteMenu(item)}>
                                                <Text style={{ color: colors.text }}>Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <TouchableOpacity style={styles.edit} onPress={() => openForm(item)}>
                                            <Text style={{ color: colors.text }}>Edit</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )) : (
                                <View style={styles.noData}>
                                    <Text style={styles.noDataText}>ไม่มีเมนู</Text>
                                </View>
                            )}
                        </ScrollView>
                    </>
                )}

                {tab === 'form' && (
                    <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
                        <View style={styles.contentaddfood}>
                            <TouchableOpacity onPress={pickImage}>
                                <View style={styles.cardaddfood}>
                                    <Image
                                        source={fImage ? { uri: fImage } : require('../photo/plus.webp')}
                                        style={styles.picaddfood}
                                    />
                                    <Text style={{ color: colors.red, marginTop: 5 }}>[ กดเพื่อเลือกรูปภาพ ]</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.dataaddfood}>
                                <View style={styles.bottomaddfood}>
                                    <Text>ชื่อเมนู</Text>
                                    <TextInput style={styles.input} value={fName} onChangeText={setFName} />
                                    <Text>ราคา (บาท)</Text>
                                    <TextInput style={styles.input} value={fPrice} onChangeText={setFPrice} keyboardType="decimal-pad" />
                                    <Text>หมวดหมู่</Text>
                                    <TouchableOpacity style={styles.dropBtn} onPress={() => setShowDropdown(v => !v)}>
                                        <Text style={{ color: colors.text, textAlign: 'center' }}>
                                            {fCat ? categories.find(c => c.category_id === fCat)?.category_name : 'เลือกหมวดหมู่'}
                                        </Text>
                                    </TouchableOpacity>
                                    {showDropdown && (
                                        <View style={styles.dropdownList}>
                                            {categories.length > 0 ? categories.map(c => (
                                                <TouchableOpacity
                                                    key={c.category_id}
                                                    style={styles.dropdownItem}
                                                    onPress={() => { setFCat(c.category_id); setShowDropdown(false) }}
                                                >
                                                    <Text>{c.category_name}</Text>
                                                </TouchableOpacity>
                                            )) : <Text style={{ padding: 10 }}>ยังไม่มีหมวดหมู่ (กด + หมวดหมู่อาหาร ก่อน)</Text>}
                                        </View>
                                    )}
                                    <View style={styles.option}>
                                        <TouchableOpacity style={styles.fix} onPress={() => setTab('list')}>
                                            <Text style={{ color: colors.text }}>ยกเลิก</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.fix1} onPress={saveForm}>
                                            <Text style={{ color: colors.text }}>เสร็จสิ้น</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                )}

                {tab === 'category' && (
                    <View style={{ backgroundColor: 'rgba(255, 255, 255,0.25)', flex: 1 }}>
                        <View style={styles.topcate}>
                            <View style={styles.frametitle}>
                                <Text style={styles.titlecate}>ชื่อหมวดหมู่อาหาร</Text>
                            </View>
                        </View>
                        <View style={styles.viewcate}>
                            <TextInput
                                placeholder="ชื่อหมวดหมู่อาหาร"
                                style={styles.framenamecate}
                                value={categoryName}
                                onChangeText={setCategoryName}
                            />
                        </View>
                        <View style={styles.optioncate}>
                            <TouchableOpacity style={styles.fix} onPress={() => setTab('list')}>
                                <Text style={{ color: colors.text }}>ยกเลิก</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.fix1} onPress={saveCategory}>
                                <Text style={{ color: colors.text }}>เสร็จสิ้น</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            <View style={styles.bottombar}>
                {[['Table', 'TableMap'], ['Order', 'Order'], ['Menu', 'Menu'], ['Account', 'Account']].map(([label, p]) => (
                    <TouchableOpacity key={p} style={styles.page} onPress={() => changepage(p)}>
                        <Text style={styles.titlepage}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    content: { flex: 1, paddingTop: 20 },
    picback: { width: 50, height: 50, borderRadius: 25, position: 'absolute', left: 0 },
    top: { alignItems: 'center' },
    title: { fontSize: 50, fontWeight: 'bold', color: colors.red },
    bottombar: { flexDirection: 'row', position: 'absolute', bottom: 0, left: 0, right: 0 },
    page: {
        borderColor: colors.text, borderTopWidth: 2, borderWidth: 1, flex: 1, height: 70,
        alignItems: 'center', justifyContent: 'center', backgroundColor: colors.red
    },
    titlepage: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
    column: { flexDirection: 'row', backgroundColor: colors.text, marginTop: 15 },
    category: { borderColor: colors.red, borderWidth: 2, backgroundColor: colors.text, padding: 10 },
    categoryname: { textAlign: 'center', fontSize: 18 },
    categoryItem: { flexDirection: 'row', alignItems: 'center', marginRight: 5 },
    categoryButton: { padding: 8, borderWidth: 1, justifyContent: 'center' },
    categoryButtonActive: { backgroundColor: 'rgba(253, 47, 129, 0.3)' },
    deleteCategory: {
        padding: 5, backgroundColor: colors.red, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center', height: 50
    },
    deleteCategoryText: { color: colors.dim, fontSize: 16, fontWeight: 'bold' },
    table: { flex: 1 },
    searchRow: { flexDirection: 'row', alignItems: 'center', padding: 5 },
    searchInput: {
        flex: 1, backgroundColor: colors.text, borderRadius: 25, padding: 10,
        marginRight: 6, boxShadow: '0 0 6px rgba(0, 0, 0, 0.5)'
    },
    addfood: { paddingHorizontal: 5 },
    butaddfood: {
        backgroundColor: colors.text, padding: 5, borderRadius: 20, marginBottom: 5,
        marginTop: 5, alignItems: 'center', boxShadow: '0 0 6px rgba(0, 0, 0, 0.5)'
    },
    card: {
        backgroundColor: colors.text, padding: 5, flexDirection: 'row',
        borderBottomWidth: 1, borderColor: 'rgba(232, 227, 227, 1)'
    },
    picfood: { width: 150, height: 170 },
    data: { padding: 10, flex: 1 },
    namefood: { fontWeight: 'bold', fontSize: 19 },
    option: { marginTop: 12, flexDirection: 'row' },
    fix: { padding: 6, backgroundColor: colors.red, marginRight: 10, borderRadius: 5 },
    fix1: { padding: 6, backgroundColor: 'rgb(14, 84, 236)', marginRight: 10, borderRadius: 5, alignItems: 'center' },
    edit: {
        padding: 5, backgroundColor: 'rgb(14, 84, 236)', borderRadius: 5,
        alignItems: 'center', marginTop: 10, width: 50
    },
    contentaddfood: { backgroundColor: 'rgba(232, 227, 227, 0.5)', alignItems: 'center' },
    cardaddfood: { flexDirection: 'column', width: '100%', alignItems: 'center', marginTop: 10 },
    picaddfood: { width: 200, height: 150, borderColor: colors.text, borderWidth: 2 },
    dataaddfood: { backgroundColor: colors.text, marginTop: 10, width: '100%' },
    bottomaddfood: { padding: 20 },
    input: {
        borderColor: 'rgba(172, 169, 169, 0.9)', borderWidth: 1, borderRadius: 15,
        height: 38, paddingHorizontal: 12, marginBottom: 10, marginTop: 4
    },
    dropBtn: { backgroundColor: colors.red, borderRadius: 15, padding: 8, marginTop: 4 },
    dropdownList: { backgroundColor: 'white', borderWidth: 1, borderColor: colors.dim, borderRadius: 10, marginTop: 4 },
    dropdownItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    topcate: { alignItems: 'center', marginTop: 10 },
    titlecate: { fontSize: 25, fontWeight: 'bold', color: colors.red },
    frametitle: {
        backgroundColor: colors.text, paddingHorizontal: 10, borderRadius: 25,
        boxShadow: '0 0 5px rgba(0,0,0,0.5)', padding: 5
    },
    framenamecate: {
        backgroundColor: colors.text, paddingHorizontal: 10, borderRadius: 25,
        boxShadow: '0 0 5px rgba(0,0,0,0.5)', padding: 8, fontSize: 18
    },
    viewcate: { padding: 20 },
    optioncate: { flexDirection: 'row', justifyContent: 'flex-end', padding: 10 },
    noData: { alignItems: 'center', marginTop: 60 },
    noDataText: {
        color: colors.red, fontSize: 20, fontWeight: 'bold',
        backgroundColor: 'rgba(253, 253, 253, 0.7)', borderRadius: 15, padding: 20
    }
})

export default Menu