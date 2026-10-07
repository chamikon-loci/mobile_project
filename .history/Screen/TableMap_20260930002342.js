import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image,TextInput } from 'react-native'
import { colors } from '../src/style/theme'
import { useState } from 'react'



function TableMap({ changepage }) {

    const [open, setopen] = useState('close')
    const [allow, setallow] = useState(false)
   
   function openedtable(){
    setopen('close');
    setallow(true)

   }

   function pagetable()
   {
    if(allow===true){
        setopen('opened')
    }else{
        setopen('open')
    }
   }

   function closedtable(){
    setopen('close');
    setopentable1('closed')
   }

    return (

        open === 'close'  ?
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
                        <TouchableOpacity style={style.tablenull} onPress={() => { {pagetable()}}}>
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
            : open==='open'?
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
                        <TouchableOpacity style={style.butopen} onPress={()=>setopen('close')}>
                            <Text style={style.textbut}>ยกเลิก</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={style.butopen} onPress={()=>{openedtable()}}>
                            <Text style={style.textbut}>เสร็จสิ้น</Text>
                        </TouchableOpacity>
                </View>

            </ImageBackground>
            :open === 'opened' ?
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
                <View style={style.bottomopendata}>
                        <TouchableOpacity style={style.butswitch} >
                            <Text style={style.textswitch}>ข้อมูลโต๊ะ</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={style.butswitch} >
                            <Text style={style.textswitch}>ประวัติการสั่งอาหาร</Text>
                        </TouchableOpacity>
                </View>

            </ImageBackground>
            :
            (()=>{closedtable()})


    )
}

const style = StyleSheet.create({
    top: {

        alignItems: 'center',
        marginBottom: '10',
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
    boxdata:{
        flexDirection:'column'
    },
    box:{
        backgroundColor:colors.text,
        borderRadius:20,
        boxShadow:'0 0 5px rgba(0,0,0,0.5)',
        paddingLeft:20,
        paddingRight:20,
        marginBottom:10
    },
    contentopen:{
        padding:20
    },
    bottomopen:{
        flexDirection:'row',
        justifyContent:'flex-end',
        padding:20

    },
    butopen:{
        backgroundColor:colors.red,
        padding:10,
        borderRadius:5,
        marginLeft:15
    },
    textbut:{
        color:colors.text,
        fontSize:15
    },
    textopen:{
        fontSize:15,
        fontWeight:'bold',
        
    },
    bottomopendata:{
        flexDirection:'row',
        position:'absolute',
        bottom:0,
        left:0,
        right:0,
        
    },
    butswitch:{
        backgroundColor:colors.red,
        flex:1,
        padding:20,
        borderColor:colors.text,
        borderWidth:2,
        alignItems:'center',
        justifyContent:'center'

    },
    textswitch:{
        fontSize:15,
        color:colors.text,
        fontWeight:'bold'
    }

})



export default TableMap