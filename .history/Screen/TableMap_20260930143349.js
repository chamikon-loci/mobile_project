import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, TextInput } from 'react-native'
import { colors } from '../src/style/theme'
import { useState } from 'react'



function TableMap({ changepage }) {

    const [open, setopen] = useState('history')
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

                                    <View style={style.bill}>
                                        <View style={style.rownotable}>
                                            <Text style={style.notable}>โต๊ะที่ 1</Text>
                                            <Text style={style.numround}>รอบที่ 1 เวลา : 15.00</Text>
                                        </View>

                                        <View style={style.columndata}>
                                            <Text style={style.columnname1}>รายการอาหาร</Text>
                                            <Text style={style.columnname2}>จำนวน</Text>
                                            <Text style={style.columnname3}>เพิ่มเติม</Text>
                                            <Text style={style.columnname4}>หมายเหตุ</Text>
                                        </View>

                                        <View style={style.listfood}>
                                            <View style={style.list}>
                                                <Text style={style.columnname1}>Cake</Text>
                                                <Text style={style.columnname2}>2</Text>
                                                <Text style={style.columnname3}>เพิ่ม cherry</Text>
                                                <Text style={style.columnname4}>แพ้นมวัว</Text>
                                            </View>

                                            <View style={style.list}>
                                                <Text style={style.columnname1}>Cake</Text>
                                                <Text style={style.columnname2}>2</Text>
                                                <Text style={style.columnname3}>-</Text>
                                                <Text style={style.columnname4}>เพิ่มหวาน</Text>
                                            </View>

                                        </View>

                                    </View>

                                </View>


                                
                            </View>

                            <View style={style.bottompay}>
                                    <View style={style.allbill}>
                                        <Text style={style.paytext}>ยอดรวมทั้งหมด 400 บาท</Text>
                                        <TouchableOpacity style={style.butpay}>
                                            <Text style={style.pay}>ชำระเงิน</Text>
                                        </TouchableOpacity>
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
    middlehistory: {
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
        marginBottom:170
    },
    order: {
        justifyContent: 'center',
        marginTop: 20,
        backgroundColor: 'white',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        borderRadius: 15,
        padding: 15
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

    areabill: {
        paddingLeft: 20,
        paddingRight: 20
    },
    columnbill: {
        width: 50
    },
    rowtitlebill: {
        alignItems: 'center',
        marginBottom: '15'
    },
    bill: {
        marginBottom: 10
    },
    summarybill: {
        alignItems: 'flex-end',
        paddingRight: 15
    },
    allbill: {
        fontSize: 20,
        fontWeight: 'bold',

    },
    list: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 5

    },
    summary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderColor: colors.dim,
        borderTopWidth: 1,
        marginTop: 5,
        paddingTop: 5
    },
    columnname1: {
        width: 100,
        color: colors.red,
        textAlign: 'center'
    },
    columnname2: {
        width: 70,
        color: colors.red,
        textAlign: 'center'
    }
    ,
    columnname3: {
        width: 60,
        color: colors.red,
        textAlign: 'center'
    },
    columnname4: {
        flex: 1,
        color: colors.red,
        textAlign: 'center',

    },
    columndata: {
        flexDirection: 'row',
        borderColor: colors.dim,
        borderBottomWidth: 1,
        justifyContent: 'space-between',
        borderTopWidth: 1,

    },
    bottompay:{
        backgroundColor:colors.text,
        flex:1,
        
        
    },
    allbill:{
        flexDirection:'row',
        justifyContent:'flex-end',
        
        
    },
    pay:{
        fontSize:20,
         color:colors.text
    },
    paytext:{
        fontSize:20,
        paddingRight:15,
        fontWeight:'bold'
       
    },
    butpay:{
        backgroundColor:'rgb(135, 84, 180)',
        padding:5,
        borderRadius:10
    }

})



export default TableMap