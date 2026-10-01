import { View , StyleSheet, TouchableOpacity ,Image,Text, ImageBackground, ScrollView} from "react-native"
import { colors } from "../src/style/theme"

function Menu({changepage}){
  return(
  
  <ImageBackground source={require('../photo/order.jpg')} style={styles.content}>
    <TouchableOpacity style={{marginLeft:10}} onPress={()=>{changepage('Login')}}>
        <Image source={require('../photo/back.png')} style={styles.picback} ></Image>
      </TouchableOpacity>
    <View style={styles.top}>
      <View style={{boxShadow: '0 0 10px rgba(0,0,0,0.5)',paddingLeft:20,paddingRight:20,borderRadius:50}}>
        <Text style={styles.title}>Menu</Text>
      </View>
    </View>
<View style={styles.table}>
    <View style={styles.column}>
      <TouchableOpacity style={styles.category}><Text style={styles.categoryname}>Maincourse</Text></TouchableOpacity>    
      <TouchableOpacity style={styles.category}><Text style={styles.categoryname}>Dessert</Text></TouchableOpacity>    
      <TouchableOpacity style={styles.category}><Text style={styles.categoryname}>Drinks</Text></TouchableOpacity>    
     
    </View>
    <View style={styles.listfood}>
      <Image source={require('../photo/OIP.webp')} style={styles.picfood}></Image>
    </View>

  </View>

      <View style={styles.bottombar}>
                  <TouchableOpacity style={styles.page} onPress={()=>{changepage('TableMap')}}><Text style={styles.titlepage}>Table</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.page}><Text style={styles.titlepage}onPress={()=>{changepage('Order')}}>Order</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.page}  onPress={()=>{changepage('Menu')}}><Text style={styles.titlepage}>Menu</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.page} onPress={()=>{changepage('Account')}}><Text style={styles.titlepage}>Account</Text></TouchableOpacity>
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
   
bottombar:{
        
        flexDirection:'row',
        justifyContent:'space-around',
         position:'absolute',
         bottom:0
    },
    page:{
        borderColor:colors.text,
        borderTopWidth:2,
        borderWidth:1,
        flex:4,
        height:70,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:colors.red,
    
       
    },
    titlepage:{
        color:colors.text,
        fontSize:20,
        fontWeight:'bold',
        
    },
    column:{
      flexDirection:'row',
      backgroundColor:colors.text,
      
      marginTop:15,
      justifyContent:'space-between',
      
    },
    category:{
      borderColor:colors.red,
        borderWidth:2,
        backgroundColor:colors.text,
        flex:1,
        padding:10,
        
    },
    categoryname:{
      textAlign:'center',
      fontSize:18
    },
    listfood:{
      backgroundColor:colors.text,
      height:100%
    },
    picfood:{
      width:50,
      height:70
    }

  
})
export default Menu