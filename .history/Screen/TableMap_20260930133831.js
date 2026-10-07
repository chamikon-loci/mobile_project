import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, TextInput } from 'react-native'
import { colors } from '../src/style/theme'
import { useState } from 'react'



function TableMap({ changepage }) {

    const [open, setopen] = useState('close')
    const [allow, setallow] = useState(false)
    const [move, setmove] = useState('none')


    function openedtable() {
        setopen('close');
        setallow(true)

    }

    function pagetable() {
        if (allow === true) {
            setopen('opened')
        } else {
            setopen('open')
        }
    }

    function closedtable() {
        setopen('close');
        setopentable1('closed')
    }

    return (

        open === 'close' ?
            <ImageBackground source={require('../photo/TableMap.jpg')} style={style.content}>

                <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => { changepage('Login') }}>
                    <Image source={require('../photo/back.png')} style={style.back}></Image>
                </TouchableOpacity>
                <View style={style.top}>

                    <View style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)', paddingLeft: 20, paddingRight: 20, borderRadius: 50 }}>
                        <Text style={style.title}>Table</Text>
                    </View>
                </View>

                <View style={{ alignItems: 'center' }}>
                    <View style={style.statustable}>
                        <Text style={{ fontSize: 15 }}>จำนวนโต๊ะที่ว่าง : 13  <View style={{ backgroundColor: colors.red, width: 15, height: 15 }}></View></Text>
                        <Text style={{ fontSize: 15 }}>จำนวนโต๊ะที่ไม่ว่าง : 2  <View style={{
                            backgroundColor: colors.dim, width: 15, height: 15
                        }}></View></Text>
                    </View>
                </View>

                <View>
                    <View style={style.middle}>
                        <TouchableOpacity style={style.tablenull} onPress={() => { { pagetable() } }}>
                            <Text style={style.numtable}>1</Text></TouchableOpacity>
                        <TouchableOpacity style={style.tablenull}><Text style={style.numtable}>2</Text></TouchableOpacity>
                        <TouchableOpacity style={style.table}><Text style={style.numtable}>3</Text></TouchableOpacity>

                    </View>

                    <View style={style.middle}>
                        <TouchableOpacity style={style.table}><Text style={style.numtable}>4</Text></TouchableOpacity>
                        <TouchableOpacity style={style.table}><Text style={style.numtable}>5</Text></TouchableOpacity>
                        <TouchableOpacity style={style.table}><Text style={style.numtable}>6</Text></TouchableOpacity>

                    </View>

                    <View style={style.middle}>
                        <TouchableOpacity style={style.table}><Text style={style.numtable}>7</Text></TouchableOpacity>
                        <TouchableOpacity style={style.table}><Text style={style.numtable}>8</Text></TouchableOpacity>
                        <TouchableOpacity style={style.table}><Text style={style.numtable}>9</Text></TouchableOpacity>

                    </View>


                    <View style={style.middle}>
                        <TouchableOpacity style={style.table}><Text style={style.numtable}>10</Text></TouchableOpacity>
                        <TouchableOpacity style={style.table}><Text style={style.numtable}>11</Text></TouchableOpacity>
                        <TouchableOpacity style={style.table}><Text style={style.numtable}>12</Text></TouchableOpacity>

                    </View>


                    <View style={style.middle}>
                        <TouchableOpacity style={style.table}><Text style={style.numtable}>13</Text></TouchableOpacity>
                        <TouchableOpacity style={style.table}><Text style={style.numtable}>14</Text></TouchableOpacity>
                        <TouchableOpacity style={style.table}><Text style={style.numtable}>15</Text></TouchableOpacity>

                    </View>
                </View>

                <View style={style.bottombar}>
                    <TouchableOpacity style={style.page} onPress={() => { changepage('TableMap') }}><Text style={style.titlepage}>Table</Text></TouchableOpacity>
                    <TouchableOpacity style={style.page}><Text style={style.titlepage} onPress={() => { changepage('Order') }}>Order</Text></TouchableOpacity>
                    <TouchableOpacity style={style.page} onPress={() => { changepage('Menu') }}><Text style={style.titlepage}>Menu</Text></TouchableOpacity>
                    <TouchableOpacity style={style.page} onPress={() => { changepage('Account') }}><Text style={style.titlepage}>Account</Text></TouchableOpacity>
                </View>



            </ImageBackground>
            : open === 'open' ?
                <ImageBackground source={require('../photo/addtable.webp')} style={style.content}>

                    <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => { setopen('close') }}>
                        <Image source={require('../photo/back.png')} style={style.back}></Image>
                    </TouchableOpacity>

                    <View style={style.top}>
                        <View style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)', paddingLeft: 20, paddingRight: 20, borderRadius: 50 }}>
                            <Text style={style.title}>โต๊ะ 1</Text>
                        </View>
                    </View>


                    <View style={style.contentopen}>
                        <View style={style.boxdata}>
                            <Text style={style.textopen}>รหัสบิล</Text>
                            <TextInput style={style.box}></TextInput>
                        </View>

                        <View style={style.boxdata}>
                            <Text style={style.textopen}>ชื่อ</Text>
                            <TextInput style={style.box}></TextInput>
                        </View>

                        <View style={style.boxdata}>
                            <Text style={style.textopen}>จำนวนคน</Text>
                            <TextInput style={style.box}></TextInput>
                        </View>

                        <View style={style.boxdata}>
                            <Text style={style.textopen}>เบอร์โทร</Text>
                            <TextInput style={style.box}></TextInput>
                        </View>
                    </View>
                    <View style={style.bottomopen}>
                        <TouchableOpacity style={style.butopen} onPress={() => setopen('close')}>
                            <Text style={style.textbut}>ยกเลิก</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={style.butopen} onPress={() => { openedtable() }}>
                            <Text style={style.textbut}>เสร็จสิ้น</Text>
                        </TouchableOpacity>
                    </View>

                </ImageBackground>
                : open === 'opened' ?
                    <ImageBackground source={require('../photo/addtable.webp')} style={style.content}>

                        <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => { setopen('close') }}>
                            <Image source={require('../photo/back.png')} style={style.back}></Image>
                        </TouchableOpacity>

                        <View style={style.top}>
                            <View style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)', paddingLeft: 20, paddingRight: 20, borderRadius: 50 }}>
                                <Text style={style.title}>โต๊ะ 1</Text>
                            </View>
                        </View>


                        <View style={style.contentopen}>
                            <View style={style.boxdata}>
                                <Text style={style.textopen}>รหัสบิล</Text>
                                <TextInput style={style.box}>186698989</TextInput>
                            </View>

                            <View style={style.boxdata}>
                                <Text style={style.textopen}>ชื่อ</Text>
                                <TextInput style={style.box}>Nanthicha</TextInput>
                            </View>

                            <View style={style.boxdata}>
                                <Text style={style.textopen}>จำนวนคน</Text>
                                <TextInput style={style.box}>2</TextInput>
                            </View>

                            <View style={style.boxdata}>
                                <Text style={style.textopen}>เบอร์โทร</Text>
                                <TextInput style={style.box}>0125586767</TextInput>
                            </View>

                            {move === 'none' ?
                                <View style={style.bottomoption}>
                                    <TouchableOpacity style={style.butopen} onPress={() => { setmove('move') }}>
                                        <Text style={style.textbut} >ย้ายโต๊ะ</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={style.butopen} onPress={() => { setmove('edit') }}>
                                        <Text style={style.textbut}>แก้ไขข้อมูล</Text>
                                    </TouchableOpacity>
                                </View>
                                : move === 'move' ?
                                    <View style={style.boxdata}>
                                        <Text style={style.textopen}>โต๊ะ</Text>

                                        <View style={style.movetable}>
                                            <TextInput style={style.boxmove}></TextInput>
                                            <View style={style.optionmove}>
                                                <TouchableOpacity style={style.butmovetable} onPress={() => { setmove('none') }}>
                                                    <Text style={style.textbut}>ยกเลิก</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity style={style.butmovetable2} onPress={() => { setmove('none') }}>
                                                    <Text style={style.textbut}>ยืนยัน</Text>
                                                </TouchableOpacity>

                                            </View>
                                        </View>
                                    </View>
                                    :
                                    <View style={style.areaedit}>
                                        <View style={style.optionmove}>
                                            <TouchableOpacity style={style.butmoveedit} onPress={() => { setmove('none') }}>
                                                <Text style={style.textbut}>ยกเลิก</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={style.butmoveedit2} onPress={() => { setmove('none') }}>
                                                <Text style={style.textbut}>ยืนยัน</Text>
                                            </TouchableOpacity>

                                        </View>
                                    </View>

                            }


                        </View>

                        <View style={style.bottomopendata}>
                            <TouchableOpacity style={style.butswitch} onPress={() => setopen('opened')}>
                                <Text style={style.textswitch}>ข้อมูลโต๊ะ</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={style.butswitch} onPress={() => setopen('history')}>
                                <Text style={style.textswitch}>ประวัติการสั่งอาหาร</Text>
                            </TouchableOpacity>
                        </View>

                    </ImageBackground>
                    : open === 'history' ?
                        <ImageBackground source={require('../photo/historyorder.jpg')} style={style.content}>


                            <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => { setopen('close') }}>
                                <Image source={require('../photo/back.png')} style={style.back}></Image>
                            </TouchableOpacity>

                            <View style={style.tophistory}>
                                <View style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)', paddingLeft: 20, paddingRight: 20, borderRadius: 50 }}>
                                    <Text style={style.titlehistory}>ประวัติการสั่งอาหาร</Text>
                                </View>
                            </View>


                            <View style={style.middlehistory}>

                                <View style={style.order}>
                                    <View style={style.rownotable}>
                                        <Text style={style.notable}>โต๊ะที่ 1</Text>
                                        <Text style={style.numround}>รอบที่ 2 เวลา : 16.00</Text>
                                    </View>

                                    <View style={style.columnorder}>
                                        <Text style={style.columntop}>ชื่อ</Text>
                                        <Text style={style.columntop}>จำนวน</Text>
                                        <Text style={style.columntop}>เพิ่มเติม</Text>
                                        <Text style={style.columntop}>หมายเหตุ</Text>
                                    </View>
                                    <View style={style.menu}>
                                        <View style={style.rowmenu}>
                                            <Text style={style.column}>Cake</Text>
                                            <Text style={style.column}>2</Text>
                                            <Text style={style.column}>add cream</Text>
                                            <Text style={style.column}>less sweet
                                                ddddddddddddddddddd
                                            </Text>
                                        </View>

                                        <View style={style.rowmenu}>
                                            <Text style={style.column}>Pancake</Text>
                                            <Text style={style.column}>2</Text>
                                            <Text style={style.column}>-</Text>
                                            <Text style={style.column}>extra sweet
                                                and not grape
                                            </Text>
                                        </View>

                                        <View style={style.rowmenu}>
                                            <Text style={style.column}>Cake</Text>
                                            <Text style={style.column}>2</Text>
                                            <Text style={style.column}>add cream</Text>
                                            <Text style={style.column}>less sweet
                                                ddddddddddddddddddd
                                            </Text>
                                        </View>

                                        <View style={style.rowmenu}>
                                            <Text style={style.column}>Pancake</Text>
                                            <Text style={style.column}>2</Text>
                                            <Text style={style.column}>-</Text>
                                            <Text style={style.column}>extra sweet
                                                and not grape
                                            </Text>
                                        </View>


                                    </View>
                                </View>
                            </View>



                            <View style={style.bottomopendata}>
                                <TouchableOpacity style={style.butswitch} onPress={() => setopen('opened')}>
                                    <Text style={style.textswitch}>ข้อมูลโต๊ะ</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={style.butswitch} onPress={() => setopen('history')}>
                                    <Text style={style.textswitch}>ประวัติการสั่งอาหาร</Text>
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                        :
                        <View></View>



    )
}

const style = StyleSheet.create({
    top: {

        alignItems: 'center',
        marginBottom: '10',
        flexDirection: 'row',
        justifyContent: 'center'

    },
    tophistory: {

        alignItems: 'center',
        marginBottom: '5',
        flexDirection: 'row',
        justifyContent: 'center'

    },
    content: {
        flex: 1,
        paddingTop: 20,


    },
    table: {

        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.red,
        borderColor: colors.red,
        borderWidth: 2,
        borderRadius: 30
    },
    tablenull: {

        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.dim,
        borderColor: colors.red,
        borderWidth: 2,
        borderRadius: 30
    },
    numtable: {
        fontSize: 30,
        color: colors.text,
    },
    middle: {

        justifyContent: 'space-around',
        flexDirection: 'row',
        paddingLeft: 20,
        paddingRight: 20,
        marginBottom: 30,
    },
    statustable: {
        width: 250,
        marginBottom: 20,
        boxShadow: '0 0 5px rgba(0,0,0,0.5)',
        backgroundColor: colors.text,
        borderRadius: 10,
        padding: 5,

    },
    title: {
        fontSize: 50,
        fontWeight: 'bold',
        color: colors.red,


    },
    titlehistory: {
        fontSize: 30,
        fontWeight: 'bold',
        color: colors.red,
        width: 150,
        textAlign: 'center',
        lineHeight: 45,
        padding: 5


    },
    bottombar: {

        flexDirection: 'row',
        justifyContent: 'space-around',
        position: 'absolute',
        bottom: 0
    },
    page: {
        borderColor: colors.text,
        borderTopWidth: 2,
        borderWidth: 1,
        flex: 4,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.red,


    },
    titlepage: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',

    },
    back: {
        width: 50,
        height: 50,
        borderRadius: 25,
        position: 'absolute'
    },
    boxdata: {
        flexDirection: 'column'
    },
    box: {
        backgroundColor: colors.text,
        borderRadius: 20,
        boxShadow: '0 0 5px rgba(0,0,0,0.5)',
        paddingLeft: 20,
        paddingRight: 20,
        marginBottom: 10
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

    },
    bottomopendata: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderColor: colors.text,
        borderWidth: 2

    },
    butswitch: {
        backgroundColor: colors.red,
        flex: 1,
        padding: 20,
        borderColor: colors.text,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 2,


    },
    textswitch: {
        fontSize: 15,
        color: colors.text,
        fontWeight: 'bold'
    },
    bottomoption: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    boxmove: {
        backgroundColor: colors.text,
        borderRadius: 20,
        boxShadow: '0 0 5px rgba(0,0,0,0.5)',
        paddingLeft: 20,
        paddingRight: 20,
        marginBottom: 10,
        width: 150
    },
    movetable: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    butmove: {
        backgroundColor: colors.red,
        padding: 10,
        borderRadius: 5,
        marginRight: 15,

    },
    optionmove: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    areaedit: {
        alignItems: 'flex-end'
    },
    butmovetable: {
        backgroundColor: colors.red,
        padding: 7,
        borderRadius: 5,
        marginRight: 15,

    },
    butmoveedit: {
        backgroundColor: colors.red,
        padding: 7,
        borderRadius: 5,
        marginRight: 15,

    },
    butmoveedit2: {
        backgroundColor: 'rgb(135, 84, 180)',
        padding: 7,
        borderRadius: 5,
        marginRight: 15,

    },
    butmovetable2: {
        backgroundColor: 'rgb(135, 84, 180)',
        padding: 7,
        borderRadius: 5,
        marginRight: 15,

    },
    order: {
        justifyContent: 'center',
        marginTop: 20,
        backgroundColor: 'white',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        borderRadius: 15,
        padding: 10
    },
    rownotable: {
        borderBottomColor: colors.bg,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    notable: {
        fontSize: 18
    },
    numround: {
        fontSize: 14,
        color: colors.dim
    },
    columnorder: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: colors.bg,
        borderBottomWidth: 1,

    },
    rowmenu: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    column: {

        width: 55
    },
    middlehistory:{
        padding:20
    }

})



export default TableMap