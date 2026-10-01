import { View, Text, StyleSheet } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { DATABASE_NAME, openDATABASE } from './database/db.js'
import TableMap from './Screen/TableMap.js'
import Login from './Screen/Login.js';
import { useState } from 'react';
import Account from './Screen/Account.js';
import Menu from './Screen/Menu.js';
import Order from './Screen/Order.js';
export default function App() {
  //const [currentpage,setpage]=useState('Login');
  const [currentpage,setpage]=useState('TableMap');
  const screen=()=>{
    switch(currentpage){
      case 'Login':{return <Login changepage={setpage} />}
      case 'TableMap':{return <TableMap changepage={setpage}/>}
      case 'Order':{return <Order changepage={setpage} />}
      case 'Menu':{return <Menu changepage={setpage}/>}
      case 'Account':{return <Account changepage={setpage} />}
      
      
    }
  }

  return (
    /*<SQLiteProvider databaseName={DATABASE_NAME} onInit={openDATABASE}>*/
      <View style={styles.container}>
        {screen()}
      </View>
    /*</SQLiteProvider>*/
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  
  },
});
