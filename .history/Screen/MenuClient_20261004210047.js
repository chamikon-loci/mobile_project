import { View, StyleSheet, TouchableOpacity, Image, Text, ImageBackground, ScrollView, TextInput } from "react-native"
import { colors } from "../src/style/theme"
import { useState, useEffect } from "react"


function MenuClient({changepage}) {
  
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