import { SQLiteProvider } from 'expo-sqlite'
import { DATABASE_NAME, openDATABASE } from './database/db.js'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import TableMap from './Screen/TableMap.js'
import OrderForChef from './Screen/OrderForChef.js'
import BillHistory from './Screen/BillHistory.js'

const Stack = createNativeStackNavigator()

export default function App() {
    return (
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={openDATABASE}>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="TableMap" component={TableMap} />
                    <Stack.Screen name="Order For Chef" component={OrderForChef} />
                    <Stack.Screen name="Bill History" component={BillHistory} />
                </Stack.Navigator>
            </NavigationContainer>
        </SQLiteProvider>
    )
}