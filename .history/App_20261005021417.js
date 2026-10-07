import {
    View,
    StyleSheet
} from 'react-native'

import { useState } from 'react'

import Login from './Screen/Login.js'
import TableMap from './Screen/TableMap.js'
import Account from './Screen/Account.js'
import Menu from './Screen/Menu.js'
import Order from './Screen/Order.js'
import MenuClient from './Screen/MenuClient.js'
import Cart from './Screen/Cart.js'

export default function App() {

    const [currentpage, setpage] =
        useState('Login')

    const [billId, setBillId] =
        useState(null)

    function changepage(page, newBillId = null) {

        /*
         * ถ้ามี Bill ID ใหม่
         * ให้เก็บไว้สำหรับลูกค้าคนนี้
         */
        if (newBillId !== null) {
            setBillId(newBillId)
        }

        setpage(page)
    }

    function screen() {

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

            default:
                return null
        }
    }

    return (
        <View style={styles.container}>
            {screen()}
        </View>
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1
    }

})