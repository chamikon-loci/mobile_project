import { useState } from 'react'

import Login from './Screen/Login'
import TableMap from './Screen/TableMap'
import Menu from './Screen/Menu'
import Account from './Screen/Account'
import MenuClient from './Screen/MenuClient'
import Cart from './Screen/Cart'
import Order from './Screen/Order'

export default function App() {
  const [currentpage, setpage] = useState('Login')
  const [billId, setBillId] = useState(null)

  const changepage = (page, newBillId) => {

    if (newBillId !== undefined) {
      setBillId(newBillId)
    }

    setpage(page)
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

      case 'Order':
        return (
          <Order
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
        return (
          <Login
            changepage={changepage}
          />
        )
    }
  }

  return screen()
}