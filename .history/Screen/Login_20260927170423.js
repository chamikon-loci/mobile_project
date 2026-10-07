import { View, Text, StyleSheet, TextInput, TouchableOpacity , Image } from 'react-native'

function Login() {
    return (
        <View style={styles.login}>
            <View style={styles.top}>
                <Image style={styles.loco} source={{uri:'https://img.freepik.com/free-photo/beautiful-anime-food-cartoon-scene_23-2151035204.jpg?t=st=1701878679~exp=1701882279~hmac=2edcca8fba4bbc6aa9bb00cc47d0a7b946c6196d267c38f55689b39cbcc3287f&w=996'}}/>

                <Text style={styles.welcome}>Welcome to my Restaurant</Text>
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
        </View>
    )
}  

const styles = StyleSheet.create({
    login:{
        padding:20
    },
    top:{
        marginTop:80,
        alignItems:'center',
        justifyContent:'center',
        
    },
    loco:{
        width:200,
        height:200,
        borderRadius:100
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