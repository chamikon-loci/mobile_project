import React,{useEffect,useState} from 'react'
import {View,Text,ScrollView,TouchableOpacity,ActivityIndicator,ImageBackground,Alert,Image} from 'react-native'
import {SQLiteProvider,useSQLiteContext} from 'expo-sqlite'
import {styles} from '../src/style/billhistorystyle'
import {colors} from '../src/style/theme'
import {DATABASE_NAME,openDATABASE,getBillDetail,updateOrderItemStatus} from '../database/db'

function BillHistory({changepage,billId,tableName}) {
  return <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
    <BillHistoryScreen changepage={changepage} billId={billId} tableName={tableName}/>
  </SQLiteProvider>
}

function BillHistoryScreen({changepage,billId,tableName}) {
  const db=useSQLiteContext(),[items,setItems]=useState([]),[loading,setLoading]=useState(true)

  async function loadBillDetail() {
    if(!billId)return setItems([]),setLoading(false)
    try {
      setLoading(true)
      setItems(await getBillDetail(db,billId))
    } catch(error) {
      console.log('โหลดรายละเอียดบิลไม่สำเร็จ',error)
      setItems([])
    } finally {setLoading(false)}
  }

  useEffect(()=>{loadBillDetail()},[billId])
  
  const handleCancelItem=async item=>{
    if(item.status&&item.status!=="รอทำ")
      return Alert.alert("ไม่สามารถยกเลิกได้","อาหารรายการนี้กำลังทำหรือเสิร์ฟแล้ว ไม่สามารถยกเลิกได้")

    Alert.alert("ยืนยันการยกเลิก",`คุณต้องการยกเลิกเมนู "${item.menu_name}" ใช่หรือไม่?`,[
      {text:"ไม่",style:"cancel"},
      {text:"ใช่",style:"destructive",onPress:async()=>{
        try {
          await updateOrderItemStatus(
            db,
            item.order_item_id,
            "ยกเลิก"
        )
          loadBillDetail()
        } catch(error) {
          console.log("ยกเลิกออร์เดอร์ไม่สำเร็จ",error)
          Alert.alert("เกิดข้อผิดพลาด","ไม่สามารถยกเลิกออร์เดอร์ได้")
        }
      }}
    ])
  }


  const getItemTotal=i=>i.status==="ยกเลิก"?0:Number(i.unit_price||0)*Number(i.amount||0)
  const totalPrice=items.reduce((s,i)=>s+getItemTotal(i),0)
  const roundsMap=items.reduce((r,i)=>((r[i.round||1]||=[]).push(i),r),{})
  const roundNumbers=Object.keys(roundsMap).sort((a,b)=>Number(a)-Number(b))

  return <ImageBackground source={require('../photo/historyorder.jpg')} style={styles.content}>
    <ScrollView contentContainerStyle={{paddingBottom:190}}>
      <TouchableOpacity style={{marginLeft:10,marginTop:10}} onPress={()=>changepage('MenuClient',billId)}>
        <Image source={require('../photo/back.png')} style={{width:50,height:50,borderRadius:25}}/>
      </TouchableOpacity>

      <View style={{alignItems:'center',marginVertical:10}}>
        <Text style={{fontSize:35,fontWeight:'bold',color:colors.red}}>ประวัติการสั่งอาหาร</Text>
        <Text style={{fontSize:16,color:colors.dim,marginTop:5}}>
          {tableName?`โต๊ะ : ${tableName} `:''} | รหัสบิล : {billId}
        </Text>
      </View>

      <View style={styles.middlehistory||{paddingHorizontal:20}}>
        {loading?
          <View style={{alignItems:'center',marginTop:30}}>
            <ActivityIndicator size="large" color={colors.red}/>
            <Text style={{marginTop:10,color:colors.red}}>กำลังโหลดข้อมูล...</Text>
          </View>:
        !items.length?
          <View style={{alignItems:'center',marginTop:50,backgroundColor:'rgba(253, 253, 253, 0.8)',padding:20,borderRadius:15}}>
            <Text style={{color:colors.red,fontSize:20,fontWeight:'bold'}}>ยังไม่มีรายการอาหาร</Text>
          </View>:
          roundNumbers.map(roundNumber=>{
            const roundItems=roundsMap[roundNumber]
            const roundTotal=roundItems.reduce((s,i)=>s+getItemTotal(i),0)

            return <View key={roundNumber} style={styles.order||{backgroundColor:'white',borderRadius:15,padding:15,marginBottom:20}}>
              <View style={styles.bill}>
                <View style={styles.rownotable}>
                  <Text style={styles.notable}>{tableName||'โต๊ะ'}</Text>
                  <Text style={styles.numround}>
                    รอบที่ {roundNumber} | เวลา : {roundItems[0]?.order_at||'-'}
                  </Text>
                </View>

                <View style={styles.columndata||{flexDirection:'row',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:'#ddd',paddingVertical:5}}>
                  <Text style={{flex:2,fontWeight:'bold'}}>รายการอาหาร</Text>
                  <Text style={{flex:1,textAlign:'center',fontWeight:'bold'}}>จำนวน</Text>
                  <Text style={{flex:1,textAlign:'center',fontWeight:'bold'}}>ราคาต่อหน่วย</Text>
                  <Text style={{flex:1,textAlign:'center',fontWeight:'bold'}}>ราคารวม</Text>
                  <Text style={{flex:1,textAlign:'center',fontWeight:'bold'}}>สถานะ/ยกเลิก</Text>
                </View>

                <View style={styles.listfood}>
                  {roundItems.map(item=>{
                    const currentStatus=item.status||"รอทำ"
                    const isWaiting=currentStatus==="รอทำ",isCancelled=currentStatus==="ยกเลิก"
                    const unitPrice=Number(item.unit_price||0)
                    const itemTotal=unitPrice*Number(item.amount||0)

                    return <View key={item.order_item_id} style={[
                      styles.list,
                      {
                        flexDirection:'row',justifyContent:'space-between',alignItems:'center',
                        paddingVertical:8,borderBottomWidth:.5,borderBottomColor:'#eee',
                        opacity:isCancelled?.5:1
                      }
                    ]}>
                      <View style={{flex:2}}>
                        <Text style={{fontWeight:'bold',textDecorationLine:isCancelled?'line-through':'none'}}>
                          {item.menu_name}
                        </Text>

                        {item.note&&<Text style={{fontSize:12,color:colors.dim}}>หมายเหตุ : {item.note}</Text>}
                        {isCancelled&&item.cancelled_at&&
                          <Text style={{fontSize:10,color:'red'}}>ยกเลิกเมื่อ: {item.cancelled_at}</Text>}
                      </View>

                      <Text style={{flex:1,textAlign:'center'}}>{item.amount}</Text>
                      <View style={{flex:1,alignItems:'center'}}>
                        <Text>{unitPrice.toFixed(2)} บาท</Text>
                      </View>
                      <View style={{flex:1,alignItems:'center'}}>
                        <Text>{itemTotal.toFixed(2)} บาท</Text>
                      </View>

                      <View style={{flex:1,alignItems:'center'}}>
                        <Text style={{
                          fontSize:12,fontWeight:'bold',
                          color:currentStatus==='เสิร์ฟแล้ว'?'green':
                            currentStatus==='กำลังทำ'?'orange':
                            currentStatus==='ยกเลิก'?'gray':'red'
                        }}>{currentStatus}</Text>

                        {isWaiting&&<TouchableOpacity
                          onPress={()=>handleCancelItem(item)}
                          style={{backgroundColor:'#ff4d4d',paddingHorizontal:6,paddingVertical:2,borderRadius:4,marginTop:4}}>
                          <Text style={{color:'white',fontSize:10,fontWeight:'bold'}}>ยกเลิก</Text>
                        </TouchableOpacity>}
                      </View>
                    </View>
                  })}
                </View>

                <View style={styles.roundTotal||{alignItems:'flex-end',marginTop:10}}>
                  <Text style={styles.roundTotalText||{fontWeight:'bold',color:colors.red}}>
                    รวมรอบที่ {roundNumber} : {roundTotal.toFixed(2)} บาท
                  </Text>
                </View>
              </View>
            </View>
          })
        }
      </View>
    </ScrollView>

    {!loading&&items.length>0&&<View style={{
      position:'absolute',bottom:0,left:0,right:0,backgroundColor:'white',padding:15,
      borderTopWidth:1,borderTopColor:'#ddd',flexDirection:'row',
      justifyContent:'space-between',alignItems:'center'
    }}>
      <Text style={{fontSize:18,fontWeight:'bold',color:colors.red}}>ยอดรวมทั้งสิ้น:</Text>
      <Text style={{fontSize:20,fontWeight:'bold',color:colors.red}}>{totalPrice.toFixed(2)} บาท</Text>
    </View>}
  </ImageBackground>
}

export default BillHistory