import { View, Text, StyleSheet } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { DATABASE_NAME, openDATABASE } from './database/db.js'
import TableMap from './Screen/TableMap.js'
import Login from './Screen/Login.js';
import { useState } from 'react';
export default function App() {
    const [currentpage, setpage] = useState('Login');

    return (
        <View style={{ flex: 1 }}>
            <Text
                style={{ fontSize: 30 }}
                onPress={() => setpage('TableMap')}
            >
                {currentpage}
            </Text>
        </View>
    );
}