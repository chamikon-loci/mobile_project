import { View , StyleSheet, TouchableOpacity ,Image,Text, ImageBackground} from "react-native"
import { colors } from "../src/style/theme"

function Order({changepage}){
  return(
  <ImageBackground source={require('../photo/order.jpg')} style={styles.content}>
    <TouchableOpacity style={{marginLeft:10}}>
        <Image source={require('../photo/back.png')} style={styles.picback}></Image>
      </TouchableOpacity>
    <View style={styles.top}>
    <View style={{boxShadow: '0 0 10px rgba(0,0,0,0.5)',paddingLeft:20,paddingRight:20,borderRadius:50}}>
      <Text style={styles.title}>Order</Text>
    </View>
    </View>
  </ImageBackground>
  )
}

const styles= StyleSheet.create({
  content:{
    flex:1,
    paddingTop:20,
    
    
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