import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'

function Login() {
    return (
        <View style={styles.client_container}>
            <View>
                <TextInput style={styles.input} placeholder='รหัสบิล'/>
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
  client_container: {
    flex: 1,
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
  },
  
});

export default Login