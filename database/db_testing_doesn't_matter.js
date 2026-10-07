/* import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from 'react'

function Database_Testing() {

    const db = useSQLiteContext();

    const [text, setText] = useState('')
    const [query, setQuery] = useState('')

    async function insertData() {
        try {
            await db.runAsync(`INSERT INTO test (test) VALUES (?)`, [text])
            setText('')
        } catch (error) {
            console.error(error);
        }
    }

    async function getData() {
        try {
            //await db.runAsync(`DELETE FROM test WHERE test = ""`)
            const read = await db.getFirstAsync("SELECT test FROM test ORDER BY id DESC")
            console.log(read)
            setQuery(read["test"])
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <TextInput 
                style={{height: 50 ,width: 200, borderWidth: 1, color: '#060000'}}
                value={text}
                onChangeText={setText}
            />
            
            <TouchableOpacity onPress={insertData}>
                <Text>Insert Data</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={getData}>
                <Text>Get Data</Text>
            </TouchableOpacity>

            <Text>Text : {query}</Text>
        </View>
    )
}

export default Database_Testing */