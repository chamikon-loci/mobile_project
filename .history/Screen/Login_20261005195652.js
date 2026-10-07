import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    Image, ImageBackground, ScrollView, Alert
} from 'react-native'
import { colors } from '../src/style/theme'
import { useState, useEffect } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { getOpenBillById, getAllTable, openOrGetBill } from '../database/db'

function Login({ changepage }) {
    const db = useSQLiteContext()
    const empPassword = '1'

    const [password, setPassword] = useState('')
    const [tab, settab] = useState('client')
    const [tables, setTables] = useState([])

    useEffect(() => {
        if (tab !== 'client') return
        getAllTable(db).then(setTables).catch(e => console.log('โหลดโต๊ะไม่สำเร็จ', e))
    }, [db, tab])

    async function pickTable(table) {
        try {
            const bill = await openOrGetBill(db, table.table_id)
            changepage('MenuClient', bill.bill_id)
        } catch (error) {
            Alert.alert('เข้าโต๊ะไม่สำเร็จ', String(error.message || error))
        }
    }

    const screen = async () => {
        if (tab === 'client') {
            try {
                const bill = await getOpenBillById(db, Number(password.trim()))
                if (!bill) {
                    Alert.alert('ไม่พบรหัสบิล หรือบิลถูกปิดแล้ว')
                    return
                }
                changepage('MenuClient', bill.bill_id)
            } catch (error) {
                console.log('เข้าสู่ระบบลูกค้าไม่สำเร็จ', error)
            }
        } else if (password === empPassword) {
            console.log('Logged in')
            changepage('TableMap')
        } else {
            Alert.alert('รหัสไม่ถูกต้อง')
        }
    }

    return (
        <ImageBackground
            source={require('../photo/830c09e434271912718f7b3d830fc274.jpg')}
            style={styles.login}
        >
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.top}>
                    <Image style={styles.logo} source={require('../photo/OIP.webp')} />
                    <Text style={styles.welcome}>
                        {tab === 'client' ? 'เลือกโต๊ะของคุณ' : 'You are Employee!'}
                    </Text>
                </View>

                {tab === 'client' && (
                    <View style={styles.tableGrid}>
                        {tables.map(t => (
                            <TouchableOpacity
                                key={t.table_id}
                                style={[
                                    styles.tableBtn,
                                    t.table_status === 'occupied' && styles.tableBtnBusy
                                ]}
                                onPress={() => pickTable(t)}
                            >
                                <Text style={styles.tableText}>{t.table_name}</Text>
                                <Text style={styles.tableSub}>
                                    {t.table_status === 'occupied' ? 'มีบิลเปิดอยู่' : 'ว่าง'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={{ marginTop: 20, alignItems: 'center' }}>
                    <TextInput
                        style={styles.input}
                        placeholder={tab === 'client' ? 'หรือกรอกรหัสบิล' : 'รหัสเข้าสู่ระบบร้าน'}
                        value={password}
                        onChangeText={setPassword}
                        keyboardType={tab === 'client' ? 'numeric' : 'default'}
                    />
                    <TouchableOpacity style={styles.confirm} onPress={screen}>
                        <Text style={{ color: colors.red, fontSize: 15 }}>ยืนยัน</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.employee_container}>
                <Text
                    style={styles.role}
                    onPress={() => {
                        settab(tab === 'client' ? 'employee' : 'client')
                        setPassword('')
                    }}
                >
                    {tab === 'client' ? 'สำหรับพนักงาน' : 'สำหรับลูกค้า'}
                </Text>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    login: { flex: 1 },
    top: { marginTop: 40, alignItems: 'center', justifyContent: 'center' },
    logo: {
        width: 120, height: 120, borderRadius: 60, marginBottom: 20,
        borderColor: 'white', borderWidth: 6
    },
    welcome: {
        fontSize: 25, fontWeight: 'bold', color: colors.bg,
        boxShadow: '0 0 6px rgba(0, 0, 0, 0.8)', borderRadius: 20, padding: 5
    },
    tableGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-around', marginTop: 20, paddingHorizontal: 10
    },
    tableBtn: {
        width: '28%', height: 60, marginBottom: 12, borderRadius: 15,
        backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'
    },
    tableBtnBusy: { backgroundColor: colors.red },
    tableText: { fontSize: 20, fontWeight: 'bold' },
    tableSub: { fontSize: 11 },
    input: {
        width: 300, backgroundColor: 'white', borderRadius: 20, paddingLeft: 22,
        boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    },
    confirm: {
        marginTop: 20, padding: 10, width: 100, backgroundColor: 'white',
        borderRadius: 20, alignItems: 'center', boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    },
    employee_container: {
        position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center'
    },
    role: { textDecorationLine: 'underline', color: colors.text, fontSize: 18 }
})

export default Login