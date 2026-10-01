import { View , StyleSheet, TouchableOpacity ,Image,Text} from "react-native"

function Order({changepage}){
  return(
  <View style={styles.content}>
    <View style={styles.top}>
      <TouchableOpacity>
        <Image source={require('../photo/back.png')} style={styles.picback}></Image>
      </TouchableOpacity>
      <Text style={styles.title}>Order</Text>
    </View>
  </View>
  )
}

const styles= StyleSheet.create({
  content:{
    flex:1,
    backgroundColor:'black'
  }
})
export default Order