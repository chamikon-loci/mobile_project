import { useState } from 'react'
import { SQLiteProvider } from 'expo-sqlite'
import { DATABASE_NAME, openDATABASE } from './database/db'

import Login from './Screens/Login'
import MenuClient from './Screens/MenuClient'
import Cart from './Screens/Cart'
import BillHistory from './Screens/BillHistory'
import TableMap from './Screens/TableMap'
import Order from './Screens/Order'
import Menu from './Screens/Menu'
import Account from './Screens/Account'

export default function App() {
    const [page, setPage] = useState('Login')
    const [billId, setBillId] = useState(null)

    function changepage(nextPage, nextBillId) {
        if (nextPage === 'Login') setBillId(null)
        else if (nextBillId !== undefined) setBillId(nextBillId)
        setPage(nextPage)
    }

    const props = { changepage, billId }

    return (
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={openDATABASE}>
            {page === 'Login' && <Login {...props} />}
            {page === 'MenuClient' && <MenuClient {...props} />}
            {page === 'Cart' && <Cart {...props} />}
            {page === 'BillHistory' && <BillHistory {...props} />}
            {page === 'TableMap' && <TableMap {...props} />}
            {page === 'Order' && <Order {...props} />}
            {page === 'Menu' && <Menu {...props} />}
            {page === 'Account' && <Account {...props} />}
        </SQLiteProvider>
    )
}