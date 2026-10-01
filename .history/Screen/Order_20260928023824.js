import { View , StyleSheet, TouchableOpacity ,Image,Text} from "react-native"
import { colors } from "../src/style/theme"

function Order({changepage}){
  return(
  <View style={styles.content}>
    <TouchableOpacity>
        <Image source={require('../photo/back.png')} style={styles.picback}></Image>
      </TouchableOpacity>
    <View style={styles.top}>
      
      <Text style={styles.title}>Order</Text>
    </View>
  </View>
  )
}

const styles= StyleSheet.create({
  content:{
    flex:1,
    paddingTop:20,
    justifyContent:'center'
    
  },
  picback:{
    
        width:50,
        height:50,
        borderRadius:25,
        position:'absolute',
        left:0
  },
  top:{
  
   
    alignItems:'center'
  },
  title:{
      fontSize: 50,
      fontWeight:'bold',
      color:colors.red
      },
})
export default Order