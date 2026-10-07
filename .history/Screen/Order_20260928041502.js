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
<View style={styles.middle}>
    <View style={styles.order}>
      <View style={styles.rownotable}>
        <Text style={styles.notable}>โต๊ะที่ 1</Text>
        <Text style={styles.numround}>รอบที่ 1</Text>
      </View>
      
      <View style={styles.columnorder}>
        <Text style={styles.columntop}>ชื่อ</Text>
          <Text style={styles.columntop}>จำนวน</Text>
          <Text style={styles.columntop}>เพิ่มเติม</Text>
          <Text style={styles.columntop}>หมายเหตุ</Text>
      </View>
    
    <View style={styles.menu}>
        <View style={styles.rowmenu}>
          <Text style={styles.column}>Cake</Text>
          <Text style={styles.column}>2</Text>
          <Text style={styles.column}>add cream</Text>
           <Text style={styles.column}>less sweet
            ddddddddddddddddddd
           </Text>
        </View>

        <View style={styles.rowmenu}>
          <Text style={styles.column}>Pancake</Text>
          <Text style={styles.column}>2</Text>
          <Text style={styles.column}>-</Text>
           <Text style={styles.column}>extra sweet
            and not grape
           </Text>
        </View>
      </View>
    </View>



    <View style={styles.order}>
      <View style={styles.rownotable}>
        <Text style={styles.notable}>โต๊ะที่ 2</Text>
        <Text style={styles.numround}>รอบที่ 1</Text>
      </View>
      
      <View style={styles.columnorder}>
        <Text style={styles.columntop}>ชื่อ</Text>
          <Text style={styles.columntop}>จำนวน</Text>
          <Text style={styles.columntop}>เพิ่มเติม</Text>
          <Text style={styles.columntop}>หมายเหตุ</Text>
      </View>
    
    <View style={styles.menu}>
        <View style={styles.rowmenu}>
          <Text style={styles.column}>Pancake</Text>
          <Text style={styles.column}>2</Text>
          <Text style={styles.column}>-</Text>
           <Text style={styles.column}>extra sweet
            and not grape
           </Text>
        </View>
      </View>
    </View>



    <View style={styles.order}>
      <View style={styles.rownotable}>
        <Text style={styles.notable}>โต๊ะที่ 1</Text>
        <Text style={styles.numround}>รอบที่ 2</Text>
      </View>
      
      <View style={styles.columnorder}>
        <Text style={styles.columntop}>ชื่อ</Text>
          <Text style={styles.columntop}>จำนวน</Text>
          <Text style={styles.columntop}>เพิ่มเติม</Text>
          <Text style={styles.columntop}>หมายเหตุ</Text>
      </View>
    
    <View style={styles.menu}>
        <View style={styles.rowmenu}>
          <Text style={styles.column}>Cake</Text>
          <Text style={styles.column}>2</Text>
          <Text style={styles.column}>add cream</Text>
           <Text style={styles.column}>less sweet
            ddddddddddddddddddd
           </Text>
        </View>

        <View style={styles.rowmenu}>
          <Text style={styles.column}>Pancake</Text>
          <Text style={styles.column}>2</Text>
          <Text style={styles.column}>-</Text>
           <Text style={styles.column}>extra sweet
            and not grape
           </Text>
        </View>

        <View style={styles.rowmenu}>
          <Text style={styles.column}>Cake</Text>
          <Text style={styles.column}>2</Text>
          <Text style={styles.column}>add cream</Text>
           <Text style={styles.column}>less sweet
            ddddddddddddddddddd
           </Text>
        </View>

        <View style={styles.rowmenu}>
          <Text style={styles.column}>Pancake</Text>
          <Text style={styles.column}>2</Text>
          <Text style={styles.column}>-</Text>
           <Text style={styles.column}>extra sweet
            and not grape
           </Text>
        </View>


      </View>
    </View>
</View>


      <View style={style.bottombar}>
                  <TouchableOpacity style={style.page} onPress={()=>{changepage('TableMap')}}><Text style={style.titlepage}>Table</Text></TouchableOpacity>
                  <TouchableOpacity style={style.page}><Text style={style.titlepage}onPress={()=>{changepage('Order')}}>Order</Text></TouchableOpacity>
                  <TouchableOpacity style={style.page}  onPress={()=>{changepage('Menu')}}><Text style={style.titlepage}>Menu</Text></TouchableOpacity>
                  <TouchableOpacity style={style.page} onPress={()=>{changepage('Account')}}><Text style={style.titlepage}>Account</Text></TouchableOpacity>
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
    middle:{
      paddingLeft:25,
      paddingRight:25
    },
 order:{
  justifyContent:'center',
  marginTop:20,
  backgroundColor:'white',
  boxShadow: '0 0 10px rgba(0,0,0,0.5)',
  borderRadius:15,
  padding:10
},
rownotable:{
  borderBottomColor:colors.bg,
  borderBottomWidth:1,
  flexDirection:'row',
  justifyContent:'space-between',
  alignItems:'center'
},
notable:{
  fontSize:18
},
numround:{
  fontSize:14,
  color:colors.dim
},
columnorder:{
  flexDirection:'row',
  justifyContent:'space-between',
   borderBottomColor:colors.bg,
  borderBottomWidth:1,
  
},
rowmenu:{
  flexDirection:'row',
  justifyContent:'space-between',
},
column:{
 
  width:55
}

  
})
export default Order