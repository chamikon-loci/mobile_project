import { StyleSheet } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { DATABASE_NAME, openDATABASE } from './data_store/db.js'

export default function App() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={openDATABASE}>
      {/*  */}
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
