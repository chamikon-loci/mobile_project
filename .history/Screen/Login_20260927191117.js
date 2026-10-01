import { View, Text, StyleSheet, TextInput, TouchableOpacity , Image,ImageBackground } from 'react-native'
import { colors } from '../src/style/theme';
import { useState } from 'react';
import TableMap from './TableMap';


function Login() {
    const [tab,settab] = useState('client')
      const [tab1,settab1] = useState('Login');
    return (
        <ImageBackground source={{uri:'https://i.pinimg.com/736x/83/0c/09/830c09e434271912718f7b3d830fc274.jpg'}} style={styles.login}>
            <View style={styles.top}>
                <Image style={styles.logo} source={{uri:'https://tse1.mm.bing.net/th/id/OIP.fRujBhWHkbcrblxLMwIRHwHaJ1?r=0&w=736&h=977&rs=1&pid=ImgDetMain&o=7&rm=3'}}/>
            <View >
                    <Text style={styles.welcome}>Welcome to my Restaurant</Text>
            </View>
                
            </View >
            <View style={{marginTop:30 ,alignItems:'center'}}>
                <TextInput style={styles.input} placeholder={tab==='client'?'รหัสโต๊ะ':'รหัสเข้าสู่ระบบร้าน'}/>
                <TouchableOpacity style={styles.confirm} onPress={()=>{tab1==='login'?console.log('clientpage'):<TableMap/>}}>
                    <Text style={{color:colors.red,fontSize:15}}>ยืนยัน</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.employee_container}>
                <View>
                    <TouchableOpacity>
                    {tab==='client'?
                        <Text style={styles.role}onPress={()=>{settab('employee')}}>สำหรับพนักงาน</Text>
                        :
                        <Text style={styles.role}onPress={()=>{settab('client')}}>สำหรับลูกค้า</Text>
                        
                        }
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    )
}  

const styles = StyleSheet.create({
    login:{
        flex:1, 
        padding:20,
        
    },
    top:{
        marginTop:80,
        alignItems:'center',
        justifyContent:'center',
        
    },
    logo:{
        width:200,
        height:200,
        borderRadius:100,
        marginBottom:20,
        borderColor:'white',
        borderWidth:6
    },
    welcome:{
        fontSize:25,
        fontWeight:'bold',
        color: colors.bg,
        boxShadow: '0 0 10px rgba(0,0,0,0.8)',
        borderRadius:20,
        padding:5
       
    },
    input:{
        width:300,
        backgroundColor:'white',
        borderRadius:20,
        paddingLeft:22,
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    },
    confirm:{
        marginTop:20,
        padding:10,
        width:100,
        backgroundColor:'white',
        borderRadius:20,
        alignItems:'center',
        border:'none',
        boxShadow:'0 0 10px rgba(0,0,0,0.5)',
        
    },

  employee_container: {
    
    position:'absolute',
    bottom:40,
    left: 0,
    right:0,
    alignItems:'center'

  },
  role:{
    textDecorationLine:'underline',
    color:colors.text,
    
  }
});

export default Login