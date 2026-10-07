export const DATABASE_NAME = 'restaurant.db'

export async function openDATABASE(db) {
    await db.execAsync(`
        PRAGMA foreign_keys=ON;
        CREATE TABLE IF NOT EXISTS Tables(
            table_id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT NOT NULL UNIQUE,
            table_status TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS Categories(
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS Menu(
            menu_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER,
            name TEXT NOT NULL,
            unit_price REAL NOT NULL,
            FOREIGN KEY(category_id) REFERENCES Categories(category_id)
        );
        CREATE TABLE IF NOT EXISTS Bills(
            bill_id INTEGER PRIMARY KEY,
            table_id INTEGER NOT NULL,
            customer_name TEXT,
            customer_count INTEGER,
            phone TEXT,
            open_at DATETIME NOT NULL,
            close_at DATETIME,
            status TEXT NOT NULL,
            FOREIGN KEY(table_id) REFERENCES Tables(table_id)
        );
        CREATE TABLE IF NOT EXISTS Order_Rounds(
            order_round_id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER NOT NULL,
            round INTEGER NOT NULL,
            order_at DATETIME NOT NULL,
            FOREIGN KEY(bill_id) REFERENCES Bills(bill_id)
        );
        CREATE TABLE IF NOT EXISTS Order_Items(
            order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_round_id INTEGER NOT NULL,
            menu_id INTEGER NOT NULL,
            amount INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            extra TEXT,
            note TEXT,
            status TEXT NOT NULL,
            FOREIGN KEY(order_round_id) REFERENCES Order_Rounds(order_round_id),
            FOREIGN KEY(menu_id) REFERENCES Menu(menu_id)
        );
        CREATE TABLE IF NOT EXISTS Cart(
            cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER NOT NULL,
            menu_id INTEGER NOT NULL,
            amount INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            note TEXT,
            FOREIGN KEY(bill_id) REFERENCES Bills(bill_id),
            FOREIGN KEY(menu_id) REFERENCES Menu(menu_id)
        );
        CREATE TABLE IF NOT EXISTS Transactions(
            transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            total_price REAL NOT NULL,
            payment_time DATETIME,
            FOREIGN KEY(bill_id) REFERENCES Bills(bill_id)
        );
    `)

    const migrations = [
        ['Bills', 'customer_name', 'TEXT'],
        ['Bills', 'customer_count', 'INTEGER'],
        ['Bills', 'phone', 'TEXT'],
        ['Cart', 'bill_id', 'INTEGER'],
        ['Order_Items', 'extra', 'TEXT'],
        ['Order_Items', 'note', 'TEXT'],
        ['Order_Items', 'status', 'TEXT'],
        ['Menu', 'image', 'TEXT']
    ]

    for (const [table, column, type] of migrations) {
        const columns = await db.getAllAsync(`PRAGMA table_info(${table})`)
        if (!columns.some(c => c.name === column))
            await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`)
    }
}

export async function insertTable(db, tables) {
    for (const table of tables)
        await db.runAsync(
            `INSERT OR IGNORE INTO Tables(table_name,table_status) VALUES(?,?)`,
            [table.Table_Name, table.Status]
        )
}

export async function getAllTable(db) {
    return db.getAllAsync(`SELECT * FROM Tables`)
}


export async function getCart(db, billId) {
    return db.getAllAsync(`
        SELECT c.cart_id,c.bill_id,c.menu_id,c.amount,c.unit_price,c.note,
               m.name AS menu_name
        FROM Cart AS c JOIN Menu AS m ON c.menu_id=m.menu_id
        WHERE c.bill_id=? ORDER BY c.cart_id
    `, [billId])
}

export async function clearCart(db, billId) {
    await db.runAsync(`DELETE FROM Cart WHERE bill_id=?`, [billId])
}

export async function getAllMenu(db) {
    return db.getAllAsync(`
        SELECT m.menu_id, m.name AS menu_name, m.unit_price, m.image,
               c.category_id, c.category_name
        FROM Menu AS m LEFT JOIN Categories AS c ON m.category_id=c.category_id
    `)
}

export async function getMenu(db, categoryid) {
    return db.getAllAsync(`
        SELECT m.menu_id, m.name AS menu_name, m.unit_price, m.image,
               c.category_id, c.category_name
        FROM Menu AS m 
        LEFT JOIN Categories AS c ON m.category_id = c.category_id
        WHERE m.category_id = ?
    `, [categoryid])
}

export async function saveMenu(db, menuId, name, unitPrice, categoryId, image) {
    await db.runAsync(
        `UPDATE Menu SET name=?, unit_price=?, category_id=?, image=? WHERE menu_id=?`,
        [name, unitPrice, categoryId, image, menuId]
    )
}

export async function addMenu(db, name, unitPrice, categoryId, image) {
    await db.runAsync(
        `INSERT INTO Menu(category_id, name, unit_price, image) VALUES(?,?,?,?)`,
        [categoryId, name, unitPrice, image]
    )
}
export async function deleteMenu(db, menuId) {
    await db.runAsync(`DELETE FROM Menu WHERE menu_id=?`, [menuId])
}

export async function getAllCategories(db) {
    return db.getAllAsync(`
        SELECT category_id,category_name FROM Categories ORDER BY category_id
    `)
}

export async function addCategory(db, categoryName) {
    await db.runAsync(
        `INSERT INTO Categories(category_name) VALUES(?)`,
        [categoryName]
    )
}

export async function deleteCategory(db, categoryId) {
    const result = await db.getFirstAsync(
        `SELECT COUNT(*) AS count FROM Menu WHERE category_id=?`,
        [categoryId]
    )

    if (result.count > 0)
        throw new Error('ไม่สามารถลบหมวดหมู่ที่มีเมนูอยู่ได้')

    await db.runAsync(
        `DELETE FROM Categories WHERE category_id=?`,
        [categoryId]
    )
}

function generateBillId() {
    return Math.floor(100000 + Math.random() * 900000)
}

export async function openBill(db, tableId, customerName, customerCount, phone) {
    let bill

    await db.withTransactionAsync(async () => {
        let billId, exists = true

        while (exists) {
            billId = generateBillId()
            exists = !!await db.getFirstAsync(
                `SELECT bill_id FROM Bills WHERE bill_id=?`,
                [billId]
            )
        }

        await db.runAsync(`
            INSERT INTO Bills(
                bill_id,table_id,customer_name,customer_count,phone,open_at,status
            ) VALUES(?,?,?,?,?,datetime('now'),?)
        `, [billId, tableId, customerName, customerCount, phone, 'open'])

        bill = await db.getFirstAsync(
            `SELECT * FROM Bills WHERE bill_id=?`,
            [billId]
        )

        await db.runAsync(
            `UPDATE Tables SET table_status='occupied' WHERE table_id=?`,
            [tableId]
        )
    })

    return bill
}

export async function getOpenBillByTable(db, tableId) {
    return db.getFirstAsync(`
        SELECT * FROM Bills
        WHERE table_id=? AND status='open'
        ORDER BY open_at DESC LIMIT 1
    `, [tableId])
}

export async function getOpenBillById(db, billId) {
    return db.getFirstAsync(`
        SELECT * FROM Bills
        WHERE bill_id=? AND status='open' LIMIT 1
    `, [billId])
}

export async function getAllBill(db) {
    return db.getAllAsync(`SELECT * FROM Bills ORDER BY bill_id DESC`)
}

export async function createOrderRound(db, billId) {
    let createdRound = null

    await db.withTransactionAsync(async () => {
        const cartItems = await db.getAllAsync(`
            SELECT cart_id,bill_id,menu_id,amount,unit_price,note
            FROM Cart WHERE bill_id=? ORDER BY cart_id
        `, [billId])

        if (!cartItems.length)
            throw new Error('ไม่มีรายการอาหารในตะกร้า')

        const { max_round } = await db.getFirstAsync(`
            SELECT MAX(round) AS max_round
            FROM Order_Rounds WHERE bill_id=?
        `, [billId])

        const nextRound = (max_round || 0) + 1

        const { lastInsertRowId: orderRoundId } = await db.runAsync(`
            INSERT INTO Order_Rounds(bill_id,round,order_at)
            VALUES(?,?,datetime('now'))
        `, [billId, nextRound])

        for (const item of cartItems)
            await db.runAsync(`
                INSERT INTO Order_Items(
                    order_round_id,menu_id,amount,unit_price,extra,note,status
                ) VALUES(?,?,?,?,?,?,?)
            `, [
                orderRoundId,
                item.menu_id,
                item.amount,
                item.unit_price,
                null,
                item.note || '',
                'รอทำ'
            ])

        await db.runAsync(`DELETE FROM Cart WHERE bill_id=?`, [billId])

        createdRound = { orderRoundId, round: nextRound }
    })

    return createdRound
}

export async function getAllOrder(db) {
    return db.getAllAsync(`
        SELECT oi.order_item_id,oi.amount,oi.unit_price,oi.extra,oi.note,oi.status,
               r.order_round_id,r.bill_id,r.round,r.order_at,
               t.table_name,m.name AS order_menu_name
        FROM Order_Items AS oi
        JOIN Order_Rounds AS r ON oi.order_round_id=r.order_round_id
        JOIN Bills AS b ON r.bill_id=b.bill_id
        JOIN Tables AS t ON b.table_id=t.table_id
        JOIN Menu AS m ON oi.menu_id=m.menu_id
        ORDER BY r.order_at ASC,oi.order_item_id ASC
    `)
}

export async function getBillOrders(db, billId) {
    return db.getAllAsync(`
        SELECT r.order_round_id,r.round,r.order_at,
               oi.order_item_id,oi.amount,oi.unit_price,oi.extra,oi.note,oi.status,
               m.menu_id,m.name AS menu_name,
               oi.amount*oi.unit_price AS total_price
        FROM Order_Rounds AS r
        JOIN Order_Items AS oi ON r.order_round_id=oi.order_round_id
        JOIN Menu AS m ON oi.menu_id=m.menu_id
        WHERE r.bill_id=?
        ORDER BY r.round,oi.order_item_id
    `, [billId])
}

export async function getBillTotal(db, billId) {
    const result = await db.getFirstAsync(`
        SELECT COALESCE(SUM(oi.amount*oi.unit_price),0) AS total_price
        FROM Order_Rounds AS r
        JOIN Order_Items AS oi ON r.order_round_id=oi.order_round_id
        WHERE r.bill_id=?
    `, [billId])

    return result?.total_price || 0
}

export async function getKitchenOrders(db) {
    return db.getAllAsync(`
        SELECT oi.order_item_id,oi.amount,oi.unit_price,oi.extra,oi.note,oi.status,
               r.order_round_id,r.round,r.order_at,b.bill_id,
               t.table_id,t.table_name,m.menu_id,m.name AS menu_name
        FROM Order_Items AS oi
        JOIN Order_Rounds AS r ON oi.order_round_id=r.order_round_id
        JOIN Bills AS b ON r.bill_id=b.bill_id
        JOIN Tables AS t ON b.table_id=t.table_id
        JOIN Menu AS m ON oi.menu_id=m.menu_id
        ORDER BY r.order_at ASC,oi.order_item_id ASC
    `)
}

export async function updateOrderItemStatus(db, orderItemId, status) {
    await db.runAsync(
        `UPDATE Order_Items SET status=? WHERE order_item_id=?`,
        [status, orderItemId]
    )
}

export async function getDailySales(db, date) {
    return db.getAllAsync(`
        SELECT m.menu_id,m.name AS menu_name,m.unit_price,
               SUM(oi.amount) AS quantity,
               SUM(oi.amount*oi.unit_price) AS total_price
        FROM Order_Items AS oi
        JOIN Order_Rounds AS r ON oi.order_round_id=r.order_round_id
        JOIN Bills AS b ON r.bill_id=b.bill_id
        JOIN Menu AS m ON oi.menu_id=m.menu_id
        WHERE DATE(b.open_at)=? AND b.status='closed'
        GROUP BY m.menu_id,m.name,m.unit_price
        ORDER BY quantity DESC
    `, [date])
}

export async function getBestSellingMenus(db) {
    return db.getAllAsync(`
        SELECT m.menu_id,m.name AS menu_name,m.unit_price,
               SUM(oi.amount) AS quantity,
               SUM(oi.amount*oi.unit_price) AS total_price
        FROM Order_Items AS oi
        JOIN Order_Rounds AS r ON oi.order_round_id=r.order_round_id
        JOIN Bills AS b ON r.bill_id=b.bill_id
        JOIN Menu AS m ON oi.menu_id=m.menu_id
        WHERE b.status='closed'
        GROUP BY m.menu_id,m.name,m.unit_price
        ORDER BY quantity DESC
    `)
}

export async function getBillHistory(db, date) {
    return db.getAllAsync(`
        SELECT b.bill_id,b.open_at,b.close_at,t.table_name,
               m.name AS menu_name,oi.amount,oi.unit_price
        FROM Bills AS b
        JOIN Tables AS t ON b.table_id=t.table_id
        JOIN Order_Rounds AS r ON b.bill_id=r.bill_id
        JOIN Order_Items AS oi ON r.order_round_id=oi.order_round_id
        JOIN Menu AS m ON oi.menu_id=m.menu_id
        WHERE DATE(b.open_at)=? AND b.status='closed'
    `, [date])
}

export async function getBillDetail(db, billId) {
    return db.getAllAsync(`
        SELECT oi.order_item_id,oi.order_round_id,oi.menu_id,oi.amount,
               oi.unit_price,oi.note,oi.status,oround.round,oround.order_at,
               m.name AS menu_name
        FROM Order_Items oi
        INNER JOIN Order_Rounds oround ON oi.order_round_id=oround.order_round_id
        INNER JOIN Menu m ON oi.menu_id=m.menu_id
        WHERE oround.bill_id=?
        ORDER BY oround.round ASC,oi.order_item_id ASC
    `, [billId])
}

export async function closeBill(db, billId) {
    let result = null

    await db.withTransactionAsync(async () => {
        const bill = await db.getFirstAsync(`
            SELECT bill_id,table_id,status
            FROM Bills WHERE bill_id=?
        `, [billId])

        if (!bill) throw new Error('ไม่พบบิลนี้')
        if (bill.status !== 'open') throw new Error('บิลนี้ถูกปิดไปแล้ว')

        const { total_price: totalPrice } = await db.getFirstAsync(`
            SELECT COALESCE(SUM(oi.amount*oi.unit_price),0) AS total_price
            FROM Order_Rounds AS r
            JOIN Order_Items AS oi ON r.order_round_id=oi.order_round_id
            WHERE r.bill_id=?
        `, [billId])

        await db.runAsync(`
            UPDATE Bills
            SET status='closed',close_at=datetime('now')
            WHERE bill_id=?
        `, [billId])

        await db.runAsync(
            `UPDATE Tables SET table_status='available' WHERE table_id=?`,
            [bill.table_id]
        )

        await db.runAsync(`
            INSERT INTO Transactions(bill_id,status,total_price,payment_time)
            VALUES(?,?,?,datetime('now'))
        `, [billId, 'paid', totalPrice])

        result = {
            billId,
            tableId: bill.table_id,
            totalPrice
        }
    })

    return result
}

export async function getTableBillHistory(db, tableId) {
    return db.getAllAsync(`
        SELECT b.bill_id,b.table_id,b.customer_name,b.customer_count,b.phone,
               b.open_at,b.close_at,b.status,
               tr.status AS payment_status,tr.total_price,tr.payment_time
        FROM Bills AS b
        LEFT JOIN Transactions AS tr ON b.bill_id=tr.bill_id
        WHERE b.table_id=? AND b.status='closed'
        ORDER BY b.close_at DESC
    `, [tableId])
}

export async function getClosedBillDetail(db, billId) {
    const bill = await db.getFirstAsync(`
        SELECT b.*,t.table_name
        FROM Bills AS b JOIN Tables AS t ON b.table_id=t.table_id
        WHERE b.bill_id=? AND b.status='closed'
    `, [billId])

    const orders = await getBillDetail(db, billId)

    const transaction = await db.getFirstAsync(`
        SELECT * FROM Transactions
        WHERE bill_id=? ORDER BY transaction_id DESC LIMIT 1
    `, [billId])

    return { bill, orders, transaction }
}
