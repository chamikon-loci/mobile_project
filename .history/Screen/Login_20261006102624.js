import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ImageBackground } from 'react-native'
import { colors } from '../src/style/theme'
import { useState } from 'react'
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite'
import { DATABASE_NAME, openDATABASE, getOpenBillById } from '../database/db'

function Login({ changepage }) {
    return (
        <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
            <LoginScreen changepage={changepage} />
        </SQLiteProvider>
    )
}

function LoginScreen({ changepage }) {
    const db = useSQLiteContext()
    const empPassword = '1'
    const [password, setPassword] = useState('')
    const [tab, settab] = useState('client')

    const screen = async () => {
        if (tab === 'client') {
            try {
                const bill = await getOpenBillById(db, Number(password.trim()))

                if (!bill) {
                    console.log('ไม่พบรหัสบิล หรือบิลถูกปิดแล้ว')
                    return
                }

                console.log('เข้าสู่ระบบลูกค้า Bill ID:', bill.bill_id)
                console.log('Bill Code:', bill.bill_code)
                changepage('MenuClient', bill.bill_id)
            } catch (error) {
                console.log('เข้าสู่ระบบลูกค้าไม่สำเร็จ', error)
            }
        } else if (password === empPassword) {
            changepage('TableMap')
            console.log('เข้าสู่ระบบร้านสำเร็จ')
        } else {
            console.log('รหัสไม่ถูกต้อง')
        }
    }

    const changeTab = tab => {
        settab(tab)
        setPassword('')
    }

    return (
        <ImageBackground
            source={require('../photo/830c09e434271912718f7b3d830fc274.jpg')}
            style={styles.login}
        >
            <View style={styles.top}>
                <Image style={styles.logo} source={require('../photo/OIP.webp')} />
                <View>
                    <Text style={styles.welcome}>
                        {tab === 'client' ? 'Welcome to my Restaurant' : 'You are Employee!'}
                    </Text>
                </View>
            </View>

            <View style={{ marginTop: 30, alignItems: 'center' }}>
                <TextInput
                    style={styles.input}
                    placeholder={tab === 'client' ? 'รหัสบิล' : 'รหัสเข้าสู่ระบบร้าน'}
                    value={password}
                    onChangeText={setPassword}
                    keyboardType={tab === 'client' ? 'numeric' : 'default'}
                />

                <TouchableOpacity style={styles.confirm} onPress={screen}>
                    <Text style={{ color: colors.red, fontSize: 15 }}>ยืนยัน</Text>
                </TouchableOpacity>
            </View>


            <View style={{ marginTop: 30, alignItems: 'center',backgroundColor:colors.card }}>
                <Text>นายจามีกร เขียวเซน รหัสนิสิต 6721601028</Text>
                 <Text>นายตฤณภัทร จิตใจดี รหัสนิสิต 6721601168</Text>
                  <Text>นางสาวนันธิชา พนาดร รหัสนิสิต 6721601303</Text>
                   <Text>นางสาวสุภารักษ์ สุดธง รหัสนิสิต 6721601583</Text>
                   <Text>หมู่เรียน  700</Text>
            </View>


            <View style={styles.employee_container}>
                <View>
                    <Text
                        style={styles.role}
                        onPress={() => changeTab(tab === 'client' ? 'employee' : 'client')}
                    >
                        {tab === 'client' ? 'สำหรับพนักงาน' : 'สำหรับลูกค้า'}
                    </Text>
                </View>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    login: {
        flex: 1,
        padding: 20,
    },
    top: {
        marginTop: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 200,
        height: 200,
        borderRadius: 100,
        marginBottom: 20,
        borderColor: 'white',
        borderWidth: 6
    },
    welcome: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'black',
        boxShadow: '0 0 6px rgba(0, 0, 0, 0.8)',
        borderRadius: 20,
        padding: 5
    },
    input: {
        width: 300,
        backgroundColor: 'white',
        borderRadius: 20,
        paddingLeft: 22,
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    },
    confirm: {
        marginTop: '20',
        padding: 10,
        width: 100,
        backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center',
        border: 'none',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    },
    employee_container: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center'
    },
    role: {
        textDecorationLine: 'underline',
        color: colors.text,
        fontSize: 18,
    }
})

export default Login
