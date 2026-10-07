import {
    View,
    StyleSheet
} from 'react-native'

import { SQLiteProvider } from 'expo-sqlite'

import TableMap from './Screen/TableMap.js'
import Login from './Screen/Login.js'
import Account from './Screen/Account.js'
import Menu from './Screen/Menu.js'
import Order from './Screen/Order.js'
import MenuClient from './Screen/MenuClient.js'
import Cart from './Screen/Cart.js'
import BillHistory from './Screen/BillHistory.js'

import { DATABASE_NAME, openDATABASE } from './database/db.js'

import { useState } from 'react'


export default function App() {

    const [
        currentpage,
        setpage
    ] = useState('Login')

    const [
        billId,
        setBillId
    ] = useState(null)


    function changepage(
        page,
        newBillId = null
    ) {

        setpage(page)

        if (newBillId !== null) {
            setBillId(newBillId)
        }
    }


    const screen = () => {

        switch (currentpage) {

            case 'Login':

                return (
                    <Login
                        changepage={changepage}
                    />
                )


            case 'TableMap':

                return (
                    <TableMap
                        changepage={changepage}
                    />
                )


            case 'Order':

                return (
                    <Order
                        changepage={changepage}
                    />
                )


            case 'Menu':

                return (
                    <Menu
                        changepage={changepage}
                    />
                )


            case 'Account':

                return (
                    <Account
                        changepage={changepage}
                    />
                )


            case 'MenuClient':

                return (
                    <MenuClient
                        changepage={changepage}
                        billId={billId}
                    />
                )


            case 'Cart':

                return (
                    <Cart
                        changepage={changepage}
                        billId={billId}
                    />
                )


            case 'BillHistory':

                return (
                    <BillHistory
                        changepage={changepage}
                        billId={billId}
                    />
                )


            default:

                return (
                    <Login
                        changepage={changepage}
                    />
                )
        }
    }


    return (

        <SQLiteProvider
            databaseName={DATABASE_NAME}
            onInit={openDATABASE}
        >

            <View style={styles.container}>

                {screen()}

            </View>

        </SQLiteProvider>

    )
}


const styles = StyleSheet.create({

    container: {
        flex: 1,
    },

})