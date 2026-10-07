import { View, Text, StyleSheet } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { DATABASE_NAME, openDATABASE } from './database/db.js'
import TableMap from './Screen/TableMap.js'
import Login from './Screen/Login.js';
import { useState } from 'react';
export default function App() {

  const [tab,settab] = useState('Login');
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={openDATABASE}>
      <View style={styles.container}>
        <Login/>
      </View>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
