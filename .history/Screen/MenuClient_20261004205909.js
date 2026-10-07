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


  },
  picback: {

    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    left: 0
  },
  top: {


    alignItems: 'center'
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: colors.red
  },

  bottombar: {

    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0
  },
  page: {
    borderColor: colors.text,
    borderTopWidth: 2,
    borderWidth: 1,
    flex: 4,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.red,


  },
  titlepage: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',

  },
  column: {
    flexDirection: 'row',
    backgroundColor: colors.text,

    marginTop: 15,
    justifyContent: 'space-between',

  },
  category: {
    borderColor: colors.red,
    borderWidth: 2,
    backgroundColor: colors.text,
    flex: 1,
    padding: 10,

  },
  categoryname: {
    textAlign: 'center',
    fontSize: 18
  },
  contentfood: {
    flex: 1

  },
  listfood: {

    flexDirection: 'column'
  },
  card: {
    backgroundColor: colors.text,
    padding: 5,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: 'rgba(232, 227, 227, 1)',
  },
  picfood: {
    width: 180,
    height: 200
  },
  data: {
    padding: 10,

  },
  fix: {
    padding: 5,
    backgroundColor: colors.red,
    marginRight: 10,
    borderRadius: 5,
  },
  option: {
    marginTop: 15,
    flexDirection: 'row'
  },
  fix1: {
    padding: 5,
    backgroundColor: 'rgb(14, 84, 236)',
    marginRight: 10,
    borderRadius: 5,
    alignItems:'center',
  },
  edit:{
    padding: 5,
    backgroundColor: 'rgb(14, 84, 236)',
    marginRight: 10,
    borderRadius: 5,
    alignItems:'center',
    marginTop:10,
    width:50
  },
  table: {
    flex: 1
  },
  namefood: {
    borderColor: 'rgba(172, 169, 169, 0.9)',
    fontWeight: 'bold',
    fontSize: 19,
    borderWidth: 1,
    height: 25,
    padding: 0,
    width: 150,
    marginBottom: 5,
    paddingLeft: 5,
    borderRadius: 15,
  },
  datafood: {
    borderColor: 'rgba(172, 169, 169, 0.9)',
    fontSize: 15,
    borderWidth: 1,
    height: 25,
    padding: 0,
    width: 150,
    marginBottom: 5,
    borderRadius: 15,
    paddingLeft: 5
  },
  butaddfood: {
    backgroundColor: colors.text,
    padding: 5,
    borderRadius: 20,
    marginBottom: 5,
    marginTop: 5,
    alignItems: 'center',
    boxShadow: '0 0 6px rgba(0, 0, 0, 0.5)',
  },
  cardaddfood: {

    borderBottomWidth: 1,
    borderColor: 'rgba(232, 227, 227, 1)',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    marginTop: 10

  },
  contentaddfood: {
    backgroundColor: 'rgba(232, 227, 227, 0.5)',
    flex: 1,
    alignItems: 'center',
    

  },
  picaddfood: {
    width: 200,
    height: 200,
    borderColor: colors.text,
    borderWidth: 2
  },
  dataaddfood: {
    backgroundColor: colors.text,
    flex: 1,
    marginTop: 10,
    width: '100%',
    


  },
  bottomaddfood:{
    padding:20,
    boxShadow: '0 0 7px rgba(0,0,0,0.5)'
  },
  butt:{
    flexDirection:'row',
    justifyContent:'space-between'
  },
  addpic:{
    width: 200,
    height: 200,
    borderColor: colors.red,
    borderWidth: 4,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:colors.text
  },
  topcate:{
    alignItems:'center',
    marginTop:10
  },
  titlecate:{
    fontSize:25,
    fontWeight:'bold',
    color:colors.red
  },
  frametitle:{
    backgroundColor:colors.text,
    paddingLeft:10,
    paddingRight:10,
    borderRadius:25,
    boxShadow: '0 0 5px rgba(0,0,0,0.5)',
    padding:5
  },
  framenamecate:{
    backgroundColor:colors.text,
    paddingLeft:10,
    paddingRight:10,
    borderRadius:25,
    boxShadow: '0 0 5px rgba(0,0,0,0.5)',
    padding:5,
    fontSize:18
  },
  viewcate:{
    padding:20
  },
  optioncate:{
    flexDirection:'row',
    justifyContent:'flex-end',
    padding:10,
    alignItems:'center',
    
  },
  bottomcate:{
    width:'100%',
    height:'100%',
    backgroundColor: 'rgba(253, 47, 129, 0.26)'
  },
  noData: {
    
     
     justifyContent:'center',
     height:'90%',
     alignItems:'center'
  },
  noDataText: {
    color: colors.red,
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor:'rgba(253, 253, 253, 0.7)',
    borderRadius:15,
    paddingLeft:80,
    paddingRight:80,
    paddingTop:20,
    paddingBottom:20
   
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5
  },

  categoryButton: {
    padding: 8,
    borderWidth: 1,
    height: '100%'
  },

  deleteCategory: {
    padding: 5,
    marginLeft: 3,
    backgroundColor: colors.red,
    borderRadius: 0,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginLeft: 0
  },

  deleteCategoryText: {
    color: colors.dim,
    fontSize: 16,
    fontWeight: 'bold'
  },

})
export default MenuClient