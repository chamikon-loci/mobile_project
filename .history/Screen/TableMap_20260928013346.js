import { View, Text , StyleSheet , TouchableOpacity, ImageBackground,Image} from 'react-native'
import { colors } from '../src/style/theme'


function TableMap({changepage}) {
    return (
        <ImageBackground source={require('../photo/0537d94848a3359a4a588a35e549632a.jpg')} style={style.content}>
          <View style={{flexDirection:'row',position:'relative'}}>
            <TouchableOpacity style={{marginLeft:10}}>
                <Image source={require('../photo/back.png')} style={style.back}></Image>
            </TouchableOpacity>
            <View style={style.top}>
            
                <View style={{boxShadow: '0 0 10px rgba(0,0,0,0.5)',paddingLeft:20,paddingRight:20,borderRadius:50}}>
                <Text style={style.title}>Table</Text>
                </View>
            </View>
         </View>     
            <View style={{alignItems:'center'}}>
            <View style={style.statustable}>
                <Text style={{fontSize: 15}}>จำนวนโต๊ะที่ว่าง : 13  <View style={{backgroundColor:colors.red,width:15,height:15}}></View></Text>
                <Text style={{fontSize: 15}}>จำนวนโต๊ะที่ไม่ว่าง : 2  <View style={{backgroundColor:colors.dim,width:15,height:15}}></View></Text>
            </View>
            </View>
            <View style={style.middle}>
                <TouchableOpacity style={style.tablenull}>
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


        <View style={style.bottombar}>
            <TouchableOpacity style={style.page} onPress={()=>{changepage('TableMap')}}><Text style={style.titlepage}>Table</Text></TouchableOpacity>
            <TouchableOpacity style={style.page}><Text style={style.titlepage}onPress={()=>{changepage('Order')}}>Order</Text></TouchableOpacity>
            <TouchableOpacity style={style.page}  onPress={()=>{changepage('Menu')}}><Text style={style.titlepage}>Menu</Text></TouchableOpacity>
            <TouchableOpacity style={style.page} onPress={()=>{changepage('Account')}}><Text style={style.titlepage}>Account</Text></TouchableOpacity>
            

        </View>
            
            
        </ImageBackground>
    )
}

const style = StyleSheet.create({
    top:{
        
        alignItems:'center',
        marginBottom:'10',
        flexDirection:'row',
        justifyContent:'center'
        
    },
    content:{
        flex:1,
        paddingTop:20,
       
        
    },
    table:{
        
       
        width:50,
        height:50,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:colors.red,
    },
    tablenull:{
       
        width:50,
        height:50,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:colors.dim,
    },
    numtable:{
        fontSize:30,
         color:colors.text,
    },
    middle:{
        
        justifyContent:'space-around',
        flexDirection:'row',
        paddingLeft:20,
        paddingRight:20,
        marginBottom:30,
    },
    statustable:{
        width:250,
        marginBottom:20,
        boxShadow: '0 0 5px rgba(0,0,0,0.5)',
        backgroundColor:colors.text,
        borderRadius:10,
        padding:5,        
        
    },
    title:{
    fontSize: 50,
    fontWeight:'bold',
    color:colors.red,
    position:'absolute',
    left:0,
    right:0,
    alignItems:'center'
    
    },
    bottombar:{
        backgroundColor:colors.text,
        flexDirection:'row',
        height:58,
        justifyContent:'space-around',
        
    },
    page:{
        borderColor:colors.text,
        borderTopWidth:2,
        borderWidth:1,
        flex:1,
        height:58,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:colors.red
    },
    titlepage:{
        color:colors.text,
        fontSize:20,
        fontWeight:'bold',
        
    },
    back:{
        width:50,
        height:50,
        borderRadius:25,
        position:'absolute'
    }

    

})



export default TableMap