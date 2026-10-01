import { View, Text , StyleSheet , TouchableOpacity, ImageBackground} from 'react-native'
import { colors } from '../src/style/theme'

function TableMap({changepage}) {
    return (
        <ImageBackground source={require('../photo/0537d94848a3359a4a588a35e549632a.jpg')} style={style.content}>
            <View style={style.top}>
                <View style={{boxShadow: '0 0 10px rgba(0,0,0,0.5)',paddingLeft:5,borderRadius:50}}>
                <Text style={style.title}>Table</Text>
                </View>
            </View>

            <View style={style.statustable}>
                <Text style={{fontSize: 15}}>จำนวนโต๊ะที่ว่าง : 13  <View style={{backgroundColor:colors.red,width:15,height:15}}></View></Text>
                <Text style={{fontSize: 15}}>จำนวนโต๊ะที่ไม่ว่าง : 2  <View style={{backgroundColor:colors.dim,width:15,height:15}}></View></Text>
            </View>

            <View style={style.middle}>
                <TouchableOpacity style={style.tablenull}><Text style={style.numtable}>1</Text></TouchableOpacity>
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



            
            
        </ImageBackground>
    )
}

const style = StyleSheet.create({
    top:{
        
        alignItems:'center',
        marginTop:20,
        marginBottom:10
        
    },
    content:{
        flex:1
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
        
        marginBottom:30,
    },
    statustable:{
        marginLeft:20,
        marginBottom:30,
        
    },
    title:{
    fontSize: 50,
    fontWeight:'bold',
    color:colors.red,
    
    }

    
    
    

})



export default TableMap