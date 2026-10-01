import { View, Text, StyleSheet, TextInput, TouchableOpacity , Image,ImageBackground } from 'react-native'
import { colors } from '../src/style/theme';


function Login() {
    return (
        <ImageBackground source={{uri:'https://i.pinimg.com/736x/83/0c/09/830c09e434271912718f7b3d830fc274.jpg'}} style={styles.login}>
            <View style={styles.top}>
                <Image style={styles.loco} source={{uri:'https://tse1.mm.bing.net/th/id/OIP.fRujBhWHkbcrblxLMwIRHwHaJ1?r=0&w=736&h=977&rs=1&pid=ImgDetMain&o=7&rm=3'}}/>
            <View >
                    <Text style={styles.welcome}>Welcome to my Restaurant</Text>
            </View>
                
            </View>
            <View >
                <TextInput style={styles.input} placeholder='รหัสโต๊ะ'/>
                <TouchableOpacity>
                    <Text>ยืนยัน</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.employee_container}>
                <View>
                    <TouchableOpacity>
                        <Text>สำหรับพนักงาน</Text>
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
    loco:{
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
        color: colors.bg
       
    },
    input:{
        width:300,
        backgroundColor:'white'
    }

 /* client_container: {
    
    backgroundColor: 'lightblue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    width: 200,
    textAlign: 'center',
    backgroundColor: 'white'
  },
  employee_container: {
    marginTop: 300
  },*/
  
});

export default Login