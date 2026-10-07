import { View , StyleSheet, TouchableOpacity ,Image} from "react-native"

function Order(){
  <View>
    <View style={style.top}>
      <TouchableOpacity>
        <Image source={require('../photo/back.png')} style={styles.picback}></Image>
      </TouchableOpacity>
      <Text>Order</Text>
    </View>
  </View>
}

const styles= StyleSheet.create({

})
export default Order