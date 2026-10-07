import { View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground, ScrollView, TextInput } from "react-native"
import { colors } from "../src/style/theme"
import { useState, useEffect } from "react"


function Menu({changepage}) {
  return (
    <SQLiteProvider onInit={openDATABASE} databaseName={DATABASE_NAME}>
      <MenuScreen changepage={changepage}/>
    </SQLiteProvider>
  )
}

function MenuScreen({ changepage }) {
  const [open,setopen]=useState('เปิดการขาย')
  const [tabfood, settabfood] = useState('listfood');

  return (

    <ImageBackground source={require('../photo/order.jpg')} style={styles.content}>
      
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 20,


  }

})
export default MenuClient