import { View, Text, StyleSheet, TextInput, TouchableOpacity , Image,ImageBackground } from 'react-native'
import { colors } from '../src/style/theme';


function Login() {
    return (
        <ImageBackground source={{uri:'https://i.pinimg.com/736x/ef/e2/80/efe28045c7bd7111300259a4a535a0dd.jpg'}} style={styles.login}>
            <View style={styles.top}>
                <Image style={styles.loco} source={{uri:'https://tse3.mm.bing.net/th/id/OIP.M1p8dn71hwNfTs0mcUV5ywHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'}}/>
            <View style={{backgroundColor:'white',padding:5,borderRadius:20}}>
                    <Text style={styles.welcome}>Welcome to my Restaurant</Text>
            </View>
                
            </View>
            <View>
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
        backgroundColor:'lightpink',
        padding:20,
        opacity:0.5
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
        borderWidth:3
    },
    welcome:{
        fontSize:25,
        fontWeight:'bold',
        color: colors.red
       
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