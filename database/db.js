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
            unit_price REAL NOT NULL CHECK(unit_price >= 0),
            image TEXT,
            is_available TEXT CHECK(is_available IN ('open', 'closed', NULL)),
            FOREIGN KEY(category_id) REFERENCES Categories(category_id) ON DELETE RESTRICT
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
            amount INTEGER NOT NULL CHECK(amount > 0),
            unit_price REAL NOT NULL,
            note TEXT,
            FOREIGN KEY(bill_id) REFERENCES Bills(bill_id) ON DELETE CASCADE,
            FOREIGN KEY(menu_id) REFERENCES Menu(menu_id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS Transactions(
            transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            total_price REAL NOT NULL,
            discount REAL,
            net_price REAL,
            promotion_id INTEGER,
            payment_time DATETIME,
            FOREIGN KEY(bill_id) REFERENCES Bills(bill_id)
        );
        CREATE INDEX IF NOT EXISTS idx_menu_category ON Menu(category_id);
        CREATE INDEX IF NOT EXISTS idx_bills_status ON Bills(status);

        CREATE TABLE IF NOT EXISTS promotion(
            promotion_id INTEGER PRIMARY KEY AUTOINCREMENT,
            promotion_name TEXT NOT NULL,
            discount_type TEXT NOT NULL,
            discount_value REAL NOT NULL,
            min_price REAL DEFAULT 0,
            is_active TEXT DEFAULT 'open'
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
        ['Order_Items', 'cancelled_at', 'TEXT'],
        ['Menu', 'image', 'TEXT'],
        ['Menu', 'is_available', 'TEXT'],
        ['Transactions', 'discount', 'REAL'],
        ['Transactions', 'net_price', 'REAL'],
        ['Transactions', 'promotion_id', 'INTEGER']
    ]

    for (const [table, column, type] of migrations) {
        const columns = await db.getAllAsync(`PRAGMA table_info(${table})`)
        if (!columns.some(c => c.name === column))
            await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`)
    }

    await seedInitialData(db)
}

export async function insertTable(db, tables) {
    for (const table of tables)
        await db.runAsync(
            `INSERT OR IGNORE INTO Tables(table_name,table_status) VALUES(?,?)`,
            [table.Table_Name, table.Status]
        )
}

export async function getDailySalesByCategory(db, date) {
    return db.getAllAsync(`
        SELECT c.category_id, c.category_name,
               SUM(oi.amount) AS total_quantity,
               SUM(oi.amount * oi.unit_price) AS total_price
        FROM Order_Items AS oi
        JOIN Order_Rounds AS r ON oi.order_round_id = r.order_round_id
        JOIN Bills AS b ON r.bill_id = b.bill_id
        JOIN Menu AS m ON oi.menu_id = m.menu_id
        JOIN Categories AS c ON m.category_id = c.category_id
        WHERE DATE(b.open_at) = ? AND b.status = 'closed'
        GROUP BY c.category_id, c.category_name
        ORDER BY total_price DESC
    `, [date])
}

export async function getBillHistoryByDate(db, date) {
    return db.getAllAsync(`
        SELECT b.bill_id, b.open_at, b.close_at, t.table_name,
               b.customer_name, b.customer_count, b.phone,
               tr.total_price, tr.payment_time
        FROM Bills AS b
        JOIN Tables AS t ON b.table_id = t.table_id
        LEFT JOIN Transactions AS tr ON b.bill_id = tr.bill_id
        WHERE DATE(b.open_at) = ? AND b.status = 'closed'
        ORDER BY b.close_at DESC
    `, [date])
}

export async function getAllClosedBills(db) {
    return db.getAllAsync(`
        SELECT b.bill_id, b.open_at, b.close_at, t.table_name,
               b.customer_name, b.customer_count, b.phone,
               tr.total_price, tr.payment_time
        FROM Bills AS b
        JOIN Tables AS t ON b.table_id = t.table_id
        LEFT JOIN Transactions AS tr ON b.bill_id = tr.bill_id
        WHERE b.status = 'closed'
        ORDER BY b.close_at DESC
    `)
}

export async function getAllTable(db) {
    return db.getAllAsync(`SELECT * FROM Tables`)
}

export async function getCart(db, billId) {
    return db.getAllAsync(`
        SELECT c.cart_id,c.bill_id,c.menu_id,c.amount,c.unit_price,c.note,
               m.name AS menu_name
        FROM Cart AS c
        JOIN Menu AS m ON c.menu_id=m.menu_id
        WHERE c.bill_id=?
        ORDER BY c.cart_id
    `, [billId])
}

export async function addToCart(db, billId, menuId, amount, unitPrice, note) {
    const trimmedNote = note?.trim() || ''

    const existing = await db.getFirstAsync(
        `SELECT * FROM Cart WHERE bill_id=? AND menu_id=? AND COALESCE(note,'')=? LIMIT 1`,
        [billId, menuId, trimmedNote]
    )

    if (existing) {
        await db.runAsync(
            `UPDATE Cart SET amount=?,unit_price=? WHERE cart_id=?`,
            [existing.amount + amount, unitPrice, existing.cart_id]
        )
    } else {
        await db.runAsync(
            `INSERT INTO Cart(bill_id,menu_id,amount,unit_price,note) VALUES(?,?,?,?,?)`,
            [billId, menuId, amount, unitPrice, trimmedNote]
        )
    }
}

export async function updateCartAmount(db, cartId, newAmount) {
    if (newAmount <= 0)
        return await removeFromCart(db, cartId)

    await db.runAsync(
        `UPDATE Cart SET amount=? WHERE cart_id=?`,
        [newAmount, cartId]
    )
}

export async function removeFromCart(db, cartId) {
    await db.runAsync(
        `DELETE FROM Cart WHERE cart_id=?`,
        [cartId]
    )
}

export const getAllMenu = async db => {
    return await db.getAllAsync(`
        SELECT Menu.*, Categories.category_name
        FROM Menu
        LEFT JOIN Categories ON Menu.category_id=Categories.category_id
        ORDER BY Menu.menu_id
    `)
}

export async function updateMenuStatus(db, menuId, status) {
    await db.runAsync(
        `UPDATE Menu SET is_available=? WHERE menu_id=?`,
        [status, menuId]
    )
}

export const getMenu = async (db, categoryId) => {
    return await db.getAllAsync(`
        SELECT Menu.*, Categories.category_name
        FROM Menu
        LEFT JOIN Categories ON Menu.category_id=Categories.category_id
        WHERE Menu.category_id=?
        ORDER BY Menu.menu_id
    `, [categoryId])
}

export async function saveMenu(db, menuId, name, unitPrice, categoryId, image) {
    await db.runAsync(
        `UPDATE Menu SET name=?,unit_price=?,category_id=?,image=? WHERE menu_id=?`,
        [name, unitPrice, categoryId, image, menuId]
    )
}

export async function addMenu(db, name, unitPrice, categoryId, image) {
    await db.runAsync(
        `INSERT INTO Menu(category_id,name,unit_price,image) VALUES(?,?,?,?)`,
        [categoryId, name, unitPrice, image]
    )
}

export async function deleteMenu(db, menuId) {
    await db.withTransactionAsync(async () => {
        await db.runAsync(`DELETE FROM Order_Items WHERE menu_id=?`, [menuId])
        await db.runAsync(`DELETE FROM Menu WHERE menu_id=?`, [menuId])
    })
}

export async function getAllCategories(db) {
    return db.getAllAsync(`
        SELECT * FROM Categories
        ORDER BY category_id
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
        let billId
        let exists = true

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
            )
            VALUES(?,?,?,?,?,datetime('now','+7 hours'),?)
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
        ORDER BY open_at DESC
        LIMIT 1
    `, [tableId])
}

export async function getOpenBillById(db, billId) {
    return db.getFirstAsync(`
        SELECT * FROM Bills
        WHERE bill_id=? AND status='open'
        LIMIT 1
    `, [billId])
}

export async function getAllBill(db) {
    return db.getAllAsync(`
        SELECT * FROM Bills
        ORDER BY bill_id DESC
    `)
}

export async function createOrderRound(db, billId) {
    let createdRound = null

    await db.withTransactionAsync(async () => {
        const cartItems = await db.getAllAsync(`
            SELECT cart_id,bill_id,menu_id,amount,unit_price,note
            FROM Cart
            WHERE bill_id=?
            ORDER BY cart_id
        `, [billId])

        if (!cartItems.length)
            throw new Error('ไม่มีรายการอาหารในตะกร้า')

        const { max_round } = await db.getFirstAsync(`
            SELECT MAX(round) AS max_round
            FROM Order_Rounds
            WHERE bill_id=?
        `, [billId])

        const nextRound = (max_round || 0) + 1

        const { lastInsertRowId: orderRoundId } = await db.runAsync(`
            INSERT INTO Order_Rounds(bill_id,round,order_at)
            VALUES(?,?,datetime('now','+7 hours'))
        `, [billId, nextRound])

        for (const item of cartItems) {
            await db.runAsync(`
                INSERT INTO Order_Items(
                    order_round_id,menu_id,amount,unit_price,extra,note,status
                )
                VALUES(?,?,?,?,?,?,?)
            `, [
                orderRoundId,
                item.menu_id,
                item.amount,
                item.unit_price,
                null,
                item.note || '',
                'รอทำ'
            ])
        }

        await db.runAsync(
            `DELETE FROM Cart WHERE bill_id=?`,
            [billId]
        )

        createdRound = {
            orderRoundId,
            round: nextRound
        }
    })

    return createdRound
}

export async function getAllOrder(db) {
    return db.getAllAsync(`
        SELECT oi.order_item_id,oi.amount,oi.unit_price,oi.extra,oi.note,oi.status,oi.cancelled_at,
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

export const deleteOrderItem = async (db, orderItemId) => {
    try {
        await db.runAsync(
            `DELETE FROM order_items WHERE order_item_id=?`,
            [orderItemId]
        )
        return true
    } catch (error) {
        console.log('Error deleting order item:', error)
        throw error
    }
}

export async function getBillOrders(db, billId) {
    return db.getAllAsync(`
        SELECT r.order_round_id,r.round,r.order_at,
               oi.order_item_id,oi.amount,oi.unit_price,oi.extra,oi.note,oi.status,oi.cancelled_at,
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
    if (status === 'ยกเลิก') {
        const cancelledAt = new Date().toLocaleString('th-TH')

        await db.runAsync(
            `UPDATE Order_Items SET status=?,cancelled_at=? WHERE order_item_id=?`,
            [status, cancelledAt, orderItemId]
        )
    } else {
        await db.runAsync(
            `UPDATE Order_Items SET status=?,cancelled_at=NULL WHERE order_item_id=?`,
            [status, orderItemId]
        )
    }
}

export async function getDailySales(db, date) {
    return db.getAllAsync(`
        SELECT m.name AS menu_name,
               oi.unit_price,
               SUM(oi.amount) AS quantity,
               SUM(oi.amount*oi.unit_price) AS total_price,
               c.category_name
        FROM Order_Items AS oi
        JOIN Order_Rounds AS r ON oi.order_round_id=r.order_round_id
        JOIN Bills AS b ON r.bill_id=b.bill_id
        JOIN Menu AS m ON oi.menu_id=m.menu_id
        LEFT JOIN Categories AS c ON m.category_id=c.category_id
        WHERE DATE(b.open_at)=? AND b.status='closed'
        GROUP BY m.menu_id,oi.unit_price,c.category_name
        ORDER BY total_price DESC
    `, [date])
}

export async function getBestSellingMenus(db, date) {
    return db.getAllAsync(`
        SELECT m.menu_id,m.name AS menu_name,m.unit_price,m.image,
               SUM(oi.amount) AS quantity,
               SUM(oi.amount*oi.unit_price) AS total_price
        FROM Order_Items AS oi
        JOIN Order_Rounds AS r ON oi.order_round_id=r.order_round_id
        JOIN Bills AS b ON r.bill_id=b.bill_id
        JOIN Menu AS m ON oi.menu_id=m.menu_id
        WHERE b.status='closed' AND DATE(b.open_at)=?
        GROUP BY m.menu_id,m.name,m.unit_price,m.image
        ORDER BY quantity DESC
        LIMIT 10
    `, [date])
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
               oi.unit_price,oi.note,oi.status,oi.cancelled_at,
               oround.round,oround.order_at,
               m.name AS menu_name
        FROM Order_Items oi
        INNER JOIN Order_Rounds oround ON oi.order_round_id=oround.order_round_id
        INNER JOIN Menu m ON oi.menu_id=m.menu_id
        WHERE oround.bill_id=?
        ORDER BY oround.round ASC,oi.order_item_id ASC
    `, [billId])
}

export async function closeBill(db, billId, discount, promotionId) {
    let result = null

    await db.withTransactionAsync(async () => {
        const bill = await db.getFirstAsync(`
            SELECT bill_id,table_id,status
            FROM Bills
            WHERE bill_id=?
        `, [billId])

        if (!bill)
            throw new Error('ไม่พบบิลนี้')

        if (bill.status !== 'open')
            throw new Error('บิลนี้ถูกปิดไปแล้ว')

        const { total_price: totalPrice } = await db.getFirstAsync(`
            SELECT COALESCE(SUM(oi.amount*oi.unit_price),0) AS total_price
            FROM Order_Rounds AS r
            JOIN Order_Items AS oi ON r.order_round_id=oi.order_round_id
            WHERE r.bill_id=?
        `, [billId])

        const actualDiscount = Math.min(discount || 0, totalPrice)
        const net_price = Math.max(0, totalPrice - actualDiscount)

        await db.runAsync(`
            UPDATE Bills
            SET status='closed',close_at=datetime('now','+7 hours')
            WHERE bill_id=?
        `, [billId])

        await db.runAsync(
            `UPDATE Tables SET table_status='available' WHERE table_id=?`,
            [bill.table_id]
        )

        await db.runAsync(`
            INSERT INTO Transactions(
                bill_id,status,total_price,discount,net_price,promotion_id,payment_time
            )
            VALUES(?,?,?,?,?,?,datetime('now','+7 hours'))
        `, [
            billId,
            'paid',
            totalPrice,
            actualDiscount,
            net_price,
            promotionId
        ])

        result = {
            billId,
            tableId: bill.table_id,
            totalPrice,
            discount: actualDiscount,
            net_price
        }
    })

    return result
}

export function formatThaiDateTime(dateString) {
    if (!dateString)
        return '-'

    const date = new Date(
        dateString.replace(' ', 'T') +
        (dateString.includes('Z') ? '' : 'Z')
    )

    if (isNaN(date.getTime()))
        return dateString

    return date.toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    })
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
        FROM Bills AS b
        JOIN Tables AS t ON b.table_id=t.table_id
        WHERE b.bill_id=? AND b.status='closed'
    `, [billId])

    const orders = await getBillDetail(db, billId)

    const transaction = await db.getFirstAsync(`
        SELECT * FROM Transactions
        WHERE bill_id=?
        ORDER BY transaction_id DESC
        LIMIT 1
    `, [billId])

    return {
        bill,
        orders,
        transaction
    }
}

export async function getPromotion(db, Active = false) {
    const result = Active ? `WHERE is_active='open'` : ''

    return db.getAllAsync(`
        SELECT * FROM promotion
        ${result}
        ORDER BY promotion_id DESC
    `)
}

export async function savePromotion(
    db,
    { promotionId, promotionName, discountType, discountValue, minPrice }
) {
    if (promotionId) {
        return db.runAsync(`
            UPDATE promotion
            SET promotion_name=?,
                discount_type=?,
                discount_value=?,
                min_price=?
            WHERE promotion_id=?
        `, [
            promotionName,
            discountType,
            discountValue,
            minPrice,
            promotionId
        ])
    }

    return db.runAsync(`
        INSERT INTO promotion(
            promotion_name,discount_type,discount_value,min_price,is_active
        )
        VALUES(?,?,?,?, 'open')
    `, [
        promotionName,
        discountType,
        discountValue,
        minPrice
    ])
}

export async function updatePromotionStatus(db, promotionId, status) {
    return db.runAsync(
        `UPDATE promotion SET is_active=? WHERE promotion_id=?`,
        [status, promotionId]
    )
}

export async function deletePromotion(db, promotionId) {
    return db.runAsync(
        `DELETE FROM promotion WHERE promotion_id=?`,
        [promotionId]
    )
}

export async function seedInitialData(db) {
    const categories = [
        'กาแฟ',
        'ชาและเครื่องดื่ม',
        'เบเกอรี่',
        'ของหวาน'
    ]

    const categoryMap = {}

    for (const categoryName of categories) {
        const rows = await db.getAllAsync(
            `SELECT category_id FROM Categories WHERE category_name=? ORDER BY category_id ASC`,
            [categoryName]
        )

        let categoryId

        if (rows.length === 0) {
            const result = await db.runAsync(
                `INSERT INTO Categories(category_name) VALUES(?)`,
                [categoryName]
            )

            categoryId = result.lastInsertRowId
        } else {
            categoryId = rows[0].category_id

            for (let i = 1; i < rows.length; i++) {
                await db.runAsync(
                    `UPDATE Menu SET category_id=? WHERE category_id=?`,
                    [categoryId, rows[i].category_id]
                )

                await db.runAsync(
                    `DELETE FROM Categories WHERE category_id=?`,
                    [rows[i].category_id]
                )
            }
        }

        categoryMap[categoryName] = categoryId
    }

    const menus = [
        ['กาแฟ','เอสเพรสโซ่',45,'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=500&q=80&auto=format&fit=crop'],
        ['กาแฟ','อเมริกาโน่',50,'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=500'],
        ['กาแฟ','คาปูชิโน่',60,'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500'],
        ['กาแฟ','ลาเต้',60,'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500'],
        ['กาแฟ','มอคค่า',65,'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=500'],
        ['กาแฟ','คาราเมลมัคคิอาโต้',70,'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500'],
        ['กาแฟ','อเมริกาโน่น้ำผึ้ง',65,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500'],
        ['ชาและเครื่องดื่ม','ชาไทยเย็น',50,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500'],
        ['ชาและเครื่องดื่ม','ชาเขียวมัทฉะเย็น',60,'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=500'],
        ['ชาและเครื่องดื่ม','ชามะนาว',45,'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500'],
        ['ชาและเครื่องดื่ม','โกโก้เย็น',55,'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500'],
        ['ชาและเครื่องดื่ม','นมสดคาราเมล',55,'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500'],
        ['ชาและเครื่องดื่ม','สตรอว์เบอร์รีโซดา',50,'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500'],
        ['ชาและเครื่องดื่ม','น้ำผึ้งมะนาวโซดา',50,'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500'],
        ['เบเกอรี่','ครัวซองต์เนยสด',65,'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500'],
        ['เบเกอรี่','ครัวซองต์อัลมอนด์',75,'https://images.unsplash.com/photo-1623334044303-241021148842?w=500'],
        ['เบเกอรี่','ช็อกโกแลตบราวนี่',65,'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=500'],
        ['เบเกอรี่','ชีสเค้ก',85,'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500'],
        ['เบเกอรี่','เค้กช็อกโกแลต',80,'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500'],
        ['เบเกอรี่','เค้กสตรอว์เบอร์รี',85,'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500'],
        ['เบเกอรี่','บานอฟฟี่เค้ก',85,'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500'],
        ['ของหวาน','ฮันนี่โทสต์',95,'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=500'],
        ['ของหวาน','ช็อกโกแลตโทสต์',105,'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500'],
        ['ของหวาน','วาฟเฟิลไอศกรีม',95,'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500'],
        ['ของหวาน','แพนเค้กเมเปิลไซรัป',90,'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=500'],
        ['ของหวาน','ไอศกรีมซันเดย์',85,'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500'],
        ['ของหวาน','บราวนี่ไอศกรีม',95,'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500'],
        ['ของหวาน','เฟรนช์โทสต์',90,'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=500']
    ]

    for (const [category, name, price, image] of menus) {
        const categoryId = categoryMap[category]

        const exists = await db.getFirstAsync(
            `SELECT menu_id FROM Menu WHERE name=? LIMIT 1`,
            [name]
        )

        if (exists) {
            await db.runAsync(
                `UPDATE Menu
                 SET category_id=?,unit_price=?,image=?,is_available='open'
                 WHERE menu_id=?`,
                [categoryId, price, image, exists.menu_id]
            )
        } else {
            await db.runAsync(
                `INSERT INTO Menu(
                    category_id,name,unit_price,image,is_available
                )
                VALUES(?,?,?,?,?)`,
                [categoryId, name, price, image, 'open']
            )
        }
    }

    const tableCount = await db.getFirstAsync(
        `SELECT COUNT(*) AS count FROM Tables`
    )

    if (tableCount.count === 0) {
        for (let i = 1; i <= 6; i++) {
            await db.runAsync(
                `INSERT INTO Tables(table_name,table_status) VALUES(?,?)`,
                [`Table ${i}`, 'available']
            )
        }
    }
}