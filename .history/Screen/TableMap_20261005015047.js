import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, TextInput, ScrollView } from 'react-native'
import { colors } from '../src/style/theme'
import { useState, useEffect } from 'react'
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite'
import { DATABASE_NAME, getAllTable, insertTable, openDATABASE, openBill, getOpenBillByTable } from '../database/db'

const initTables = [
    { Table_Name: 'T1', Status: 'available' }, { Table_Name: 'T2', Status: 'available' }, { Table_Name: 'T3', Status: 'available' },
    { Table_Name: 'T4', Status: 'available' }, { Table_Name: 'T5', Status: 'available' }, { Table_Name: 'T6', Status: 'available' },
    { Table_Name: 'T7', Status: 'available' }, { Table_Name: 'T8', Status: 'available' }, { Table_Name: 'T9', Status: 'available' },
    { Table_Name: 'T10', Status: 'available' }, { Table_Name: 'T11', Status: 'available' }, { Table_Name: 'T12', Status: 'available' },
    { Table_Name: 'T13', Status: 'available' }, { Table_Name: 'T14', Status: 'available' }, { Table_Name: 'T15', Status: 'available' },
]

function TableMap({ changepage }) {
    return (
        <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
            <TableMapScreen changepage={changepage} />
        </SQLiteProvider>
    )
}

function TableMapScreen({ changepage }) {
    const db = useSQLiteContext()
    const [table, setTable] = useState([])
    const [customerName, setCustomerName] = useState('')
    const [customerCount, setCustomerCount] = useState('')
    const [phone, setPhone] = useState('')
    const [selectedTable, setSelectedTable] = useState(null)
    const [billId, setBillId] = useState(null)
    const [selectedBill, setSelectedBill] = useState(null)

    useEffect(() => {
        const loadTable = async () => {
            try {
                await insertTable(db, initTables)
                const data = await getAllTable(db)
                setTable(data)
            } catch (error) {
                console.log('โหลดข้อมูลโต๊ะไม่สำเร็จ', error)
            }
        }

        loadTable()
    }, [])

    async function openTable() {
        if (!selectedTable) return

        if (!customerName.trim()) {
            console.log('กรุณากรอกชื่อลูกค้า')
            return
        }

        if (Number(customerCount) <= 0) {
            console.log('กรุณากรอกจำนวนลูกค้า')
            return
        }

        try {
            const bill = await openBill(
                db,
                selectedTable.table_id,
                customerName.trim(),
                Number(customerCount),
                phone.trim()
            )

            setBillId(bill.bill_id)

            setTable(prev =>
                prev.map(item =>
                    item.table_id === selectedTable.table_id
                        ? { ...item, table_status: 'occupied' }
                        : item
                )
            )

            setCustomerName('')
            setCustomerCount('')
            setPhone('')
        } catch (error) {
            console.log('เปิดโต๊ะไม่สำเร็จ', error)
        }
    }

    function backToTableMap() {
        setSelectedTable(null)
        setSelectedBill(null)
        setCustomerName('')
        setCustomerCount('')
        setPhone('')
    }

    const available = table.filter(item => item.table_status === 'available').length
    const notavailable = table.filter(item => item.table_status !== 'available').length

    if (billId) {
        return (
            <ImageBackground source={require('../photo/addtable.webp')} style={style.content}>
                <View style={style.billcode}>
                    <Text style={style.billcodetitle}>เปิดโต๊ะสำเร็จ</Text>

                    <Text style={style.billcodename}>รหัสบิล</Text>

                    <Text style={style.billid}>{billId}</Text>

                    <Text style={style.billcodeinfo}>
                        กรุณาแจ้งรหัสนี้ให้ลูกค้า
                    </Text>

                    <Text style={style.billcodeinfo}>
                        เพื่อใช้สั่งอาหารจากเครื่องบนโต๊ะ
                    </Text>

                    <TouchableOpacity
                        style={style.butopen}
                        onPress={() => {
                            setBillId(null)
                            setSelectedTable(null)
                            setSelectedBill(null)
                        }}
                    >
                        <Text style={style.textbut}>กลับหน้าหลัก</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        )
    }

    if (selectedTable) {

        if (selectedTable.table_status === 'occupied') {
            return (
                <ImageBackground source={require('../photo/addtable.webp')} style={style.content}>

                    <TouchableOpacity style={{ marginLeft: 10 }} onPress={backToTableMap}>
                        <Image source={require('../photo/back.png')} style={style.back} />
                    </TouchableOpacity>

                    <View style={style.top}>
                        <View style={style.titleContainer}>
                            <Text style={style.title}>{selectedTable.table_name}</Text>
                        </View>
                    </View>

                    <ScrollView>
                        <View style={style.contentopen}>
                            <Text style={style.billPageTitle}>ข้อมูลโต๊ะ</Text>

                            {selectedBill ? (
                                <>
                                    <View style={style.boxdata}>
                                        <Text style={style.textopen}>รหัสบิล</Text>
                                        <Text style={style.infoText}>{selectedBill.bill_id}</Text>
                                    </View>

                                    <View style={style.boxdata}>
                                        <Text style={style.textopen}>ชื่อลูกค้า</Text>
                                        <Text style={style.infoText}>{selectedBill.customer_name}</Text>
                                    </View>

                                    <View style={style.boxdata}>
                                        <Text style={style.textopen}>จำนวนคน</Text>
                                        <Text style={style.infoText}>{selectedBill.customer_count} คน</Text>
                                    </View>

                                    <View style={style.boxdata}>
                                        <Text style={style.textopen}>เบอร์โทร</Text>
                                        <Text style={style.infoText}>{selectedBill.phone || '-'}</Text>
                                    </View>

                                    <View style={style.boxdata}>
                                        <Text style={style.textopen}>เวลาเปิดโต๊ะ</Text>
                                        <Text style={style.infoText}>{selectedBill.open_at}</Text>
                                    </View>

                                    <View style={style.boxdata}>
                                        <Text style={style.textopen}>สถานะ</Text>
                                        <Text style={style.infoText}>{selectedBill.status}</Text>
                                    </View>
                                </>
                            ) : (
                                <Text style={style.noBillText}>
                                    ไม่พบข้อมูลบิลของโต๊ะนี้
                                </Text>
                            )}
                        </View>
                    </ScrollView>

                    <View style={style.bottomopen}>
                        <TouchableOpacity style={style.butopen} onPress={backToTableMap}>
                            <Text style={style.textbut}>กลับ</Text>
                        </TouchableOpacity>
                    </View>

                </ImageBackground>
            )
        }

        return (
            <ImageBackground source={require('../photo/addtable.webp')} style={style.content}>

                <TouchableOpacity style={{ marginLeft: 10 }} onPress={backToTableMap}>
                    <Image source={require('../photo/back.png')} style={style.back} />
                </TouchableOpacity>

                <View style={style.top}>
                    <View style={style.titleContainer}>
                        <Text style={style.title}>{selectedTable.table_name}</Text>
                    </View>
                </View>

                <View style={style.contentopen}>

                    <View style={style.boxdata}>
                        <Text style={style.textopen}>ชื่อ</Text>

                        <TextInput
                            style={style.box}
                            value={customerName}
                            onChangeText={setCustomerName}
                        />
                    </View>

                    <View style={style.boxdata}>
                        <Text style={style.textopen}>จำนวนคน</Text>

                        <TextInput
                            style={style.box}
                            value={customerCount}
                            onChangeText={setCustomerCount}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={style.boxdata}>
                        <Text style={style.textopen}>เบอร์โทร</Text>

                        <TextInput
                            style={style.box}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>

                </View>

                <View style={style.bottomopen}>

                    <TouchableOpacity style={style.butopen} onPress={backToTableMap}>
                        <Text style={style.textbut}>ยกเลิก</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={style.butopen} onPress={openTable}>
                        <Text style={style.textbut}>เปิดโต๊ะ</Text>
                    </TouchableOpacity>

                </View>

            </ImageBackground>
        )
    }

    return (
        <ImageBackground source={require('../photo/TableMap.jpg')} style={style.content}>

            <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => changepage('Login')}>
                <Image source={require('../photo/back.png')} style={style.back} />
            </TouchableOpacity>

            <View style={style.top}>
                <View style={style.titleContainer}>
                    <Text style={style.title}>Table</Text>
                </View>
            </View>

            <View style={{ alignItems: 'center' }}>
                <View style={style.statustable}>
                    <Text style={{ fontSize: 15 }}>
                        จำนวนโต๊ะที่ว่าง : {available}
                    </Text>

                    <Text style={{ fontSize: 15 }}>
                        จำนวนโต๊ะที่ไม่ว่าง : {notavailable}
                    </Text>
                </View>
            </View>

            <View>
                <View style={style.middle}>

                    {table.map(item => (
                        <TouchableOpacity
                            key={item.table_id}
                            style={
                                item.table_status === 'available'
                                    ? style.tablenull
                                    : style.table
                            }
                            onPress={async () => {

                                if (item.table_status === 'occupied') {

                                    try {
                                        const bill = await getOpenBillByTable(
                                            db,
                                            item.table_id
                                        )

                                        setSelectedBill(bill || null)
                                        setSelectedTable(item)

                                    } catch (error) {
                                        console.log('โหลดข้อมูลบิลไม่สำเร็จ', error)
                                    }

                                } else {

                                    setSelectedBill(null)
                                    setSelectedTable(item)

                                }
                            }}
                        >
                            <Text style={style.numtable}>
                                {item.table_name}
                            </Text>
                        </TouchableOpacity>
                    ))}

                </View>
            </View>

            <View style={style.bottombar}>

                <TouchableOpacity
                    style={style.page}
                    onPress={() => changepage('TableMap')}
                >
                    <Text style={style.titlepage}>Table</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={style.page}
                    onPress={() => changepage('Order')}
                >
                    <Text style={style.titlepage}>Order</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={style.page}
                    onPress={() => changepage('Menu')}
                >
                    <Text style={style.titlepage}>Menu</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={style.page}
                    onPress={() => changepage('Account')}
                >
                    <Text style={style.titlepage}>Account</Text>
                </TouchableOpacity>

            </View>

        </ImageBackground>
    )
}

const style = StyleSheet.create({
    top: {
        alignItems: 'center',
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'center'
    },

    content: {
        flex: 1,
        paddingTop: 20
    },

    titleContainer: {
        paddingLeft: 20,
        paddingRight: 20,
        borderRadius: 50
    },

    title: {
        fontSize: 50,
        fontWeight: 'bold',
        color: colors.red
    },

    table: {
        width: '30%',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.dim,
        borderColor: colors.red,
        borderWidth: 2,
        borderRadius: 30,
        marginBottom: 20
    },

    tablenull: {
        width: '30%',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.red,
        borderColor: colors.red,
        borderWidth: 2,
        borderRadius: 50,
        marginBottom: 20
    },

    numtable: {
        fontSize: 30,
        color: colors.text
    },

    middle: {
        justifyContent: 'space-around',
        flexDirection: 'row',
        paddingLeft: 20,
        paddingRight: 20,
        marginBottom: 30,
        flexWrap: 'wrap'
    },

    statustable: {
        width: 250,
        marginBottom: 20,
        backgroundColor: colors.text,
        borderRadius: 10,
        padding: 10
    },

    back: {
        width: 50,
        height: 50,
        borderRadius: 25
    },

    bottombar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0
    },

    page: {
        borderColor: colors.text,
        borderTopWidth: 2,
        borderWidth: 1,
        flex: 1,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.red
    },

    titlepage: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold'
    },

    boxdata: {
        flexDirection: 'column',
        marginBottom: 5
    },

    box: {
        backgroundColor: colors.text,
        borderRadius: 20,
        paddingLeft: 20,
        paddingRight: 20,
        marginBottom: 10,
        minHeight: 45
    },

    contentopen: {
        padding: 20
    },

    bottomopen: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 20
    },

    butopen: {
        backgroundColor: colors.red,
        padding: 10,
        borderRadius: 5,
        marginLeft: 15
    },

    textbut: {
        color: colors.text,
        fontSize: 15
    },

    textopen: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 5
    },

    billPageTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: colors.red,
        marginBottom: 20
    },

    infoText: {
        backgroundColor: colors.text,
        borderRadius: 20,
        padding: 15,
        marginBottom: 10,
        fontSize: 18
    },

    noBillText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 30
    },

    billcode: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)',
        margin: 20,
        borderRadius: 20,
        padding: 30
    },

    billcodetitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: colors.red,
        marginBottom: 30
    },

    billcodename: {
        fontSize: 20,
        fontWeight: 'bold'
    },

    billid: {
        fontSize: 50,
        fontWeight: 'bold',
        color: colors.red,
        marginVertical: 20
    },

    billcodeinfo: {
        fontSize: 16,
        marginBottom: 5
    }
})

export default TableMap