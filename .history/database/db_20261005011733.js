export const DATABASE_NAME = 'restaurant.db'

export async function openDATABASE(db) {
    await db.execAsync(`
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS Tables (
            table_id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT NOT NULL UNIQUE,
            table_status TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Menu (
            menu_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER,
            name TEXT NOT NULL,
            unit_price REAL NOT NULL,
            FOREIGN KEY (category_id) REFERENCES Categories(category_id)
        );

        CREATE TABLE IF NOT EXISTS Bills (
            bill_id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_id INTEGER NOT NULL,
            customer_name TEXT,
            customer_count INTEGER,
            phone TEXT,
            open_at DATETIME NOT NULL,
            close_at DATETIME,
            status TEXT NOT NULL,
            FOREIGN KEY (table_id) REFERENCES Tables(table_id)
        );

        CREATE TABLE IF NOT EXISTS Order_Rounds (
            order_round_id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER NOT NULL,
            round INTEGER NOT NULL,
            order_at DATETIME NOT NULL,
            FOREIGN KEY (bill_id) REFERENCES Bills(bill_id)
        );

        CREATE TABLE IF NOT EXISTS Order_Items (
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_round_id INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    extra TEXT,
    note TEXT,
    status TEXT NOT NULL,
    FOREIGN KEY (order_round_id) REFERENCES Order_Rounds(order_round_id),
    FOREIGN KEY (menu_id) REFERENCES Menu(menu_id)
);

CREATE TABLE IF NOT EXISTS Cart (
    cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    note TEXT,
    FOREIGN KEY (menu_id) REFERENCES Menu(menu_id)
);

        CREATE TABLE IF NOT EXISTS Transactions (
            transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            total_price REAL NOT NULL,
            payment_time DATETIME,
            FOREIGN KEY (bill_id) REFERENCES Bills(bill_id)
        );

        
    `)

    // Migration สำหรับ database เก่าที่ไม่มี column เหล่านี้
    const billColumns = await db.getAllAsync(`PRAGMA table_info(Bills)`)

    const columnNames = billColumns.map(column => column.name)

    if (!columnNames.includes('customer_name')) {
        await db.execAsync(`
            ALTER TABLE Bills
            ADD COLUMN customer_name TEXT;
        `)
    }

    if (!columnNames.includes('customer_count')) {
        await db.execAsync(`
            ALTER TABLE Bills
            ADD COLUMN customer_count INTEGER;
        `)
    }

    if (!columnNames.includes('phone')) {
        await db.execAsync(`
            ALTER TABLE Bills
            ADD COLUMN phone TEXT;
        `)
    }
}

export async function insertTable(db, tables) {
    for (let i = 0; i < tables.length; i++) {
        await db.runAsync(
            `INSERT OR IGNORE INTO Tables (table_name, table_status) VALUES (?, ?)`, [tables[i].Table_Name, tables[i].Status]
        )
    }
}

export async function addToCart(db, menuId, amount, unitPrice, note) {
    await db.runAsync(
        `INSERT INTO Cart
        (menu_id, amount, unit_price, note)
        VALUES (?, ?, ?, ?)`,
        [menuId, amount, unitPrice, note]
    )
}

export async function getCart(db) {
    return await db.getAllAsync(`
        SELECT
            c.cart_id,
            c.menu_id,
            c.amount,
            c.unit_price,
            c.note,
            m.name AS menu_name
        FROM Cart AS c
        JOIN Menu AS m ON c.menu_id = m.menu_id
        ORDER BY c.cart_id
    `)
}

export async function clearCart(db) {
    await db.runAsync(`DELETE FROM Cart`)
}

export async function getAllTable(db) {
    const result = await db.getAllAsync(`SELECT * FROM Tables`)
    return result //คืนค่าเป็น Array ที่เก็บ Objects 
}

export async function getAllOrder(db) {
    const result = await db.getAllAsync(`
        SELECT
            oi.order_item_id,
            oi.amount,
            oi.unit_price,
            oi.status,
            r.order_round_id,
            r.round,
            r.order_at,
            b.bill_id,
            t.table_id,
            t.table_name,
            m.menu_id,
            m.name AS menu_name,
            c.category_id,
            c.category_name
        FROM Order_Items AS oi
        JOIN Order_Rounds AS r ON oi.order_round_id = r.order_round_id
        JOIN Bills AS b ON r.bill_id = b.bill_id
        JOIN Tables AS t ON b.table_id = t.table_id
        JOIN Menu AS m ON oi.menu_id = m.menu_id
        LEFT JOIN Categories AS c ON m.category_id = c.category_id

        WHERE b.status = 'open'
    `)
    return result
}

export async function getAllBill(db) {
    const result = await db.getAllAsync(`
        SELECT *
        FROM Bills
        ORDER BY bill_id DESC
    `)
    return result
}

export async function createOrderRound(db, bill_id, cartItem) {
    await db.withTransactionAsync(async () => {
        const roundResult = await db.getFirstAsync(`
            SELECT MAX(round) AS max_round FROM Order_Rounds WHERE bill_id = ?`, [bill_id]);

        const currentRound = roundResult?.max_round || 0;
        const nextRound = currentRound + 1;

        const roundInsert = await db.runAsync(`
            INSERT INTO Order_Rounds (bill_id, round, order_at) VALUES (?, ?, datetime('now'))`, [bill_id, nextRound]);

        const orderRoundId = roundInsert.lastInsertRowId;
        for (const item of cartItem) {
            await db.runAsync(`
                INSERT INTO Order_Items (order_round_id, menu_id, amount, unit_price, status) VALUES (?, ?, ?, ?, ?)`,
                [orderRoundId, item.menu_id, item.amount, item.unit_price, item.status]);
        }

    })
}

export async function openBill(db, tableId, customerName, customerCount, phone) {
    let bill

    await db.withTransactionAsync(async () => {
        const result = await db.runAsync(
            `INSERT INTO Bills
            (table_id, customer_name, customer_count, phone, open_at, status)
            VALUES (?, ?, ?, ?, datetime('now'), ?)`,
            [tableId, customerName, customerCount, phone, 'open']
        )

        bill = await db.getFirstAsync(
            `SELECT * FROM Bills WHERE bill_id = ?`,
            [result.lastInsertRowId]
        )

        await db.runAsync(
            `UPDATE Tables
             SET table_status = 'occupied'
             WHERE table_id = ?`,
            [tableId]
        )
    })

    return bill
}

export async function getAllMenu(db) {
    const result = await db.getAllAsync(`
        SELECT
            m.menu_id,
            m.name AS menu_name,
            m.unit_price,
            c.category_id,
            c.category_name
        FROM Menu AS m
        LEFT JOIN Categories AS c ON m.category_id = c.category_id    
    `)


    return result
}

export async function getMenu(db, categoryid) {
    const result = await db.getAllAsync(`
        SELECT
            m.menu_id,
            m.name AS menu_name,
            m.unit_price,
            m.category_id
        FROM Menu AS m  
        WHERE m.category_id = ?
    `, [categoryid])


    return result
}



export async function saveMenu(db, menuId, name, unitPrice, categoryId) {
    await db.runAsync(
        `UPDATE Menu
     SET name = ?, unit_price = ?, category_id = ?
     WHERE menu_id = ?`,
        [name, unitPrice, categoryId, menuId]
    )
}

export async function addMenu(db, name, unitPrice, categoryId) {
    await db.runAsync(
        `INSERT INTO Menu (category_id, name, unit_price)
     VALUES (?, ?, ?)`,
        [categoryId, name, unitPrice]
    )
}



export async function getAllCategories(db) {
    return await db.getAllAsync(`
    SELECT category_id, category_name
    FROM Categories
    ORDER BY category_id
  `)
}

export async function addCategory(db, categoryName) {
    await db.runAsync(
        `INSERT INTO Categories (category_name)
     VALUES (?)`,
        [categoryName]
    )
}


export async function deleteMenu(db, menuId) {
    await db.runAsync(
        `DELETE FROM Menu
     WHERE menu_id = ?`,
        [menuId]
    )
}

export async function deleteCategory(db, categoryId) {
    const result = await db.getFirstAsync(
        `SELECT COUNT(*) AS count
     FROM Menu
     WHERE category_id = ?`,
        [categoryId]
    )

    if (result.count > 0) {
        throw new Error('ไม่สามารถลบหมวดหมู่ที่มีเมนูอยู่ได้')
    }

    await db.runAsync(
        `DELETE FROM Categories
     WHERE category_id = ?`,
        [categoryId]
    )
}

export async function getDailySales(db, date) {
    return await db.getAllAsync(`
        SELECT
            m.menu_id,
            m.name AS menu_name,
            m.unit_price,
            SUM(oi.amount) AS quantity,
            SUM(oi.amount * oi.unit_price) AS total_price
        FROM Order_Items AS oi
        JOIN Order_Rounds AS r ON oi.order_round_id = r.order_round_id
        JOIN Bills AS b ON r.bill_id = b.bill_id
        JOIN Menu AS m ON oi.menu_id = m.menu_id
        WHERE DATE(b.open_at) = ?
          AND b.status = 'closed'
        GROUP BY m.menu_id, m.name, m.unit_price
        ORDER BY quantity DESC
    `, [date])
}

export async function getBestSellingMenus(db) {
    return await db.getAllAsync(`
        SELECT
            m.menu_id,
            m.name AS menu_name,
            m.unit_price,
            SUM(oi.amount) AS quantity,
            SUM(oi.amount * oi.unit_price) AS total_price
        FROM Order_Items AS oi
        JOIN Order_Rounds AS r ON oi.order_round_id = r.order_round_id
        JOIN Bills AS b ON r.bill_id = b.bill_id
        JOIN Menu AS m ON oi.menu_id = m.menu_id
        WHERE b.status = 'closed'
        GROUP BY m.menu_id, m.name, m.unit_price
        ORDER BY quantity DESC
    `)
}

export async function getBillHistory(db, date) {
    return await db.getAllAsync(`
        SELECT
            b.bill_id,
            b.open_at,
            b.close_at,
            t.table_name,
            m.name AS menu_name,
            oi.amount,
            oi.unit_price
        FROM Bills AS b
        JOIN Tables AS t ON b.table_id = t.table_id
        JOIN Order_Rounds AS r ON b.bill_id = r.bill_id
        JOIN Order_Items AS oi ON r.order_round_id = oi.order_round_id
        JOIN Menu AS m ON oi.menu_id = m.menu_id
        WHERE DATE(b.open_at) = ? AND b.status = 'closed'
    `, [date])
}

export async function getOpenBillByTable(db, tableId) {
    return await db.getFirstAsync(
        `SELECT *
         FROM Bills
         WHERE table_id = ?
         AND status = 'open'
         ORDER BY bill_id DESC
         LIMIT 1`,
        [tableId]
    )
}