import { View, Text, StyleSheet } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { DATABASE_NAME, openDATABASE } from './database/db.js'
import TableMap from './Screen/TableMap.js'
import Login from './Screen/Login.js';
import { useState } from 'react';
export default function App() {
  const [currentpage,setpage]=useState('Login');
  const screen=()=>{
    switch(currentpage){
      case 'Login':{return <Login changepage={setpage} />}
      case 'TableMap':{return <TableMap changepage={setpage}/>}
      
    }
  }

  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={openDATABASE}>
      
        {screen()}
      
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  
  },
});
