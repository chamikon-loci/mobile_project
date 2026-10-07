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
            bill_id INTEGER PRIMARY KEY,
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
            bill_id INTEGER NOT NULL,
            menu_id INTEGER NOT NULL,
            amount INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            note TEXT,
            FOREIGN KEY (bill_id) REFERENCES Bills(bill_id),
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


    /* =========================================================
       MIGRATION : CART
    ========================================================= */

    const cartColumns = await db.getAllAsync(
        `PRAGMA table_info(Cart)`
    )

    const cartColumnNames = cartColumns.map(
        column => column.name
    )

    if (!cartColumnNames.includes('bill_id')) {
        await db.execAsync(`
            ALTER TABLE Cart
            ADD COLUMN bill_id INTEGER;
        `)
    }


    /* =========================================================
       MIGRATION : BILLS
    ========================================================= */

    const billColumns = await db.getAllAsync(
        `PRAGMA table_info(Bills)`
    )

    const columnNames = billColumns.map(
        column => column.name
    )

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


    /* =========================================================
       MIGRATION : ORDER_ITEMS
    ========================================================= */

    const orderItemColumns = await db.getAllAsync(
        `PRAGMA table_info(Order_Items)`
    )

    const orderItemColumnNames = orderItemColumns.map(
        column => column.name
    )

    if (!orderItemColumnNames.includes('extra')) {
        await db.execAsync(`
            ALTER TABLE Order_Items
            ADD COLUMN extra TEXT;
        `)
    }
}


/* =========================================================
   TABLE
========================================================= */

export async function insertTable(db, tables) {
    for (let i = 0; i < tables.length; i++) {
        await db.runAsync(
            `
            INSERT OR IGNORE INTO Tables
            (table_name, table_status)
            VALUES (?, ?)
            `,
            [
                tables[i].Table_Name,
                tables[i].Status
            ]
        )
    }
}


export async function getAllTable(db) {
    return await db.getAllAsync(
        `SELECT * FROM Tables`
    )
}


/* =========================================================
   CART
========================================================= */

export async function addToCart(
    db,
    billId,
    menuId,
    amount,
    unitPrice,
    note
) {
    const existing = await db.getFirstAsync(
        `
        SELECT *
        FROM Cart
        WHERE bill_id = ?
        AND menu_id = ?
        LIMIT 1
        `,
        [
            billId,
            menuId
        ]
    )

    if (existing) {
        const newAmount =
            existing.amount + amount

        let newNote =
            existing.note || ''

        if (
            note &&
            note.trim() !== ''
        ) {
            if (
                newNote.trim() !== ''
            ) {
                newNote =
                    `${newNote}, ${note.trim()}`
            } else {
                newNote = note.trim()
            }
        }

        await db.runAsync(
            `
            UPDATE Cart
            SET
                amount = ?,
                unit_price = ?,
                note = ?
            WHERE cart_id = ?
            `,
            [
                newAmount,
                unitPrice,
                newNote,
                existing.cart_id
            ]
        )
    } else {
        await db.runAsync(
            `
            INSERT INTO Cart
            (
                bill_id,
                menu_id,
                amount,
                unit_price,
                note
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                billId,
                menuId,
                amount,
                unitPrice,
                note?.trim() || ''
            ]
        )
    }
}


export async function getCart(
    db,
    billId
) {
    return await db.getAllAsync(
        `
        SELECT
            c.cart_id,
            c.bill_id,
            c.menu_id,
            c.amount,
            c.unit_price,
            c.note,
            m.name AS menu_name
        FROM Cart AS c
        JOIN Menu AS m
            ON c.menu_id = m.menu_id
        WHERE c.bill_id = ?
        ORDER BY c.cart_id
        `,
        [billId]
    )
}


export async function clearCart(
    db,
    billId
) {
    await db.runAsync(
        `
        DELETE FROM Cart
        WHERE bill_id = ?
        `,
        [billId]
    )
}


/* =========================================================
   MENU
========================================================= */

export async function getAllMenu(db) {
    const result =
        await db.getAllAsync(`
            SELECT
                m.menu_id,
                m.name AS menu_name,
                m.unit_price,
                c.category_id,
                c.category_name
            FROM Menu AS m
            LEFT JOIN Categories AS c
                ON m.category_id =
                   c.category_id
        `)

    return result
}


export async function getMenu(
    db,
    categoryid
) {
    const result =
        await db.getAllAsync(
            `
            SELECT
                m.menu_id,
                m.name AS menu_name,
                m.unit_price,
                m.category_id
            FROM Menu AS m
            WHERE m.category_id = ?
            `,
            [categoryid]
        )

    return result
}


export async function saveMenu(
    db,
    menuId,
    name,
    unitPrice,
    categoryId
) {
    await db.runAsync(
        `
        UPDATE Menu
        SET
            name = ?,
            unit_price = ?,
            category_id = ?
        WHERE menu_id = ?
        `,
        [
            name,
            unitPrice,
            categoryId,
            menuId
        ]
    )
}


export async function addMenu(
    db,
    name,
    unitPrice,
    categoryId
) {
    await db.runAsync(
        `
        INSERT INTO Menu
        (
            category_id,
            name,
            unit_price
        )
        VALUES (?, ?, ?)
        `,
        [
            categoryId,
            name,
            unitPrice
        ]
    )
}


export async function deleteMenu(
    db,
    menuId
) {
    await db.runAsync(
        `
        DELETE FROM Menu
        WHERE menu_id = ?
        `,
        [menuId]
    )
}


/* =========================================================
   CATEGORY
========================================================= */

export async function getAllCategories(
    db
) {
    return await db.getAllAsync(`
        SELECT
            category_id,
            category_name
        FROM Categories
        ORDER BY category_id
    `)
}


export async function addCategory(
    db,
    categoryName
) {
    await db.runAsync(
        `
        INSERT INTO Categories
        (category_name)
        VALUES (?)
        `,
        [categoryName]
    )
}


export async function deleteCategory(
    db,
    categoryId
) {
    const result =
        await db.getFirstAsync(
            `
            SELECT COUNT(*) AS count
            FROM Menu
            WHERE category_id = ?
            `,
            [categoryId]
        )

    if (result.count > 0) {
        throw new Error(
            'ไม่สามารถลบหมวดหมู่ที่มีเมนูอยู่ได้'
        )
    }

    await db.runAsync(
        `
        DELETE FROM Categories
        WHERE category_id = ?
        `,
        [categoryId]
    )
}


/* =========================================================
   BILL
========================================================= */

function generateBillId() {
    return Math.floor(
        100000 +
        Math.random() * 900000
    )
}


export async function openBill(
    db,
    tableId,
    customerName,
    customerCount,
    phone
) {
    let bill

    await db.withTransactionAsync(
        async () => {

            let billId
            let exists = true

            while (exists) {

                billId =
                    generateBillId()

                const check =
                    await db.getFirstAsync(
                        `
                        SELECT bill_id
                        FROM Bills
                        WHERE bill_id = ?
                        `,
                        [billId]
                    )

                exists = !!check
            }

            await db.runAsync(
                `
                INSERT INTO Bills
                (
                    bill_id,
                    table_id,
                    customer_name,
                    customer_count,
                    phone,
                    open_at,
                    status
                )
                VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    datetime('now'),
                    ?
                )
                `,
                [
                    billId,
                    tableId,
                    customerName,
                    customerCount,
                    phone,
                    'open'
                ]
            )

            bill =
                await db.getFirstAsync(
                    `
                    SELECT *
                    FROM Bills
                    WHERE bill_id = ?
                    `,
                    [billId]
                )

            await db.runAsync(
                `
                UPDATE Tables
                SET table_status = 'occupied'
                WHERE table_id = ?
                `,
                [tableId]
            )
        }
    )

    return bill
}


export async function getOpenBillByTable(
    db,
    tableId
) {
    return await db.getFirstAsync(
        `
        SELECT *
        FROM Bills
        WHERE table_id = ?
        AND status = 'open'
        ORDER BY open_at DESC
        LIMIT 1
        `,
        [tableId]
    )
}


export async function getOpenBillById(
    db,
    billId
) {
    return await db.getFirstAsync(
        `
        SELECT *
        FROM Bills
        WHERE bill_id = ?
        AND status = 'open'
        LIMIT 1
        `,
        [billId]
    )
}


export async function getAllBill(db) {
    return await db.getAllAsync(`
        SELECT *
        FROM Bills
        ORDER BY bill_id DESC
    `)
}


/* =========================================================
   ORDER ROUND
========================================================= */

export async function createOrderRound(
    db,
    billId
) {
    let createdRound = null

    await db.withTransactionAsync(
        async () => {

            const cartItems =
                await db.getAllAsync(
                    `
                    SELECT
                        cart_id,
                        bill_id,
                        menu_id,
                        amount,
                        unit_price,
                        note
                    FROM Cart
                    WHERE bill_id = ?
                    ORDER BY cart_id
                    `,
                    [billId]
                )

            if (cartItems.length === 0) {
                throw new Error(
                    'ไม่มีรายการอาหารในตะกร้า'
                )
            }

            const roundResult =
                await db.getFirstAsync(
                    `
                    SELECT
                        MAX(round) AS max_round
                    FROM Order_Rounds
                    WHERE bill_id = ?
                    `,
                    [billId]
                )

            const currentRound =
                roundResult?.max_round || 0

            const nextRound =
                currentRound + 1

            const roundInsert =
                await db.runAsync(
                    `
                    INSERT INTO Order_Rounds
                    (
                        bill_id,
                        round,
                        order_at
                    )
                    VALUES (
                        ?,
                        ?,
                        datetime('now')
                    )
                    `,
                    [
                        billId,
                        nextRound
                    ]
                )

            const orderRoundId =
                roundInsert.lastInsertRowId

            for (const item of cartItems) {

                await db.runAsync(
                    `
                    INSERT INTO Order_Items
                    (
                        order_round_id,
                        menu_id,
                        amount,
                        unit_price,
                        extra,
                        note,
                        status
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        orderRoundId,
                        item.menu_id,
                        item.amount,
                        item.unit_price,
                        null,
                        item.note || '',
                        'รอทำ'
                    ]
                )
            }

            await db.runAsync(
                `
                DELETE FROM Cart
                WHERE bill_id = ?
                `,
                [billId]
            )

            createdRound = {
                orderRoundId,
                round: nextRound
            }
        }
    )

    return createdRound
}


/* =========================================================
   ORDER
========================================================= */

export async function getAllOrder(db) {
    return await db.getAllAsync(`
        SELECT
            oi.order_item_id,
            oi.amount,
            oi.unit_price,
            oi.extra,
            oi.note,
            oi.status,

            r.order_round_id,
            r.bill_id,
            r.round,
            r.order_at,

            t.table_name,

            m.name AS order_menu_name

        FROM Order_Items AS oi

        JOIN Order_Rounds AS r
            ON oi.order_round_id =
               r.order_round_id

        JOIN Bills AS b
            ON r.bill_id =
               b.bill_id

        JOIN Tables AS t
            ON b.table_id =
               t.table_id

        JOIN Menu AS m
            ON oi.menu_id =
               m.menu_id

        ORDER BY
            r.order_at ASC,
            oi.order_item_id ASC
    `)
}


/* =========================================================
   CUSTOMER - BILL SUMMARY
========================================================= */

export async function getBillOrders(
    db,
    billId
) {
    return await db.getAllAsync(
        `
        SELECT
            r.order_round_id,
            r.round,
            r.order_at,

            oi.order_item_id,
            oi.amount,
            oi.unit_price,
            oi.extra,
            oi.note,
            oi.status,

            m.menu_id,
            m.name AS menu_name,

            (
                oi.amount *
                oi.unit_price
            ) AS total_price

        FROM Order_Rounds AS r

        JOIN Order_Items AS oi
            ON r.order_round_id =
               oi.order_round_id

        JOIN Menu AS m
            ON oi.menu_id =
               m.menu_id

        WHERE r.bill_id = ?

        ORDER BY
            r.round,
            oi.order_item_id
        `,
        [billId]
    )
}


export async function getBillTotal(
    db,
    billId
) {
    const result =
        await db.getFirstAsync(
            `
            SELECT
                COALESCE(
                    SUM(
                        oi.amount *
                        oi.unit_price
                    ),
                    0
                ) AS total_price

            FROM Order_Rounds AS r

            JOIN Order_Items AS oi
                ON r.order_round_id =
                   oi.order_round_id

            WHERE r.bill_id = ?
            `,
            [billId]
        )

    return result?.total_price || 0
}


/* =========================================================
   KITCHEN
========================================================= */

export async function getKitchenOrders(
    db
) {
    return await db.getAllAsync(`
        SELECT
            oi.order_item_id,
            oi.amount,
            oi.unit_price,
            oi.extra,
            oi.note,
            oi.status,

            r.order_round_id,
            r.round,
            r.order_at,

            b.bill_id,

            t.table_id,
            t.table_name,

            m.menu_id,
            m.name AS menu_name

        FROM Order_Items AS oi

        JOIN Order_Rounds AS r
            ON oi.order_round_id =
               r.order_round_id

        JOIN Bills AS b
            ON r.bill_id =
               b.bill_id

        JOIN Tables AS t
            ON b.table_id =
               t.table_id

        JOIN Menu AS m
            ON oi.menu_id =
               m.menu_id

        ORDER BY
            r.order_at ASC,
            oi.order_item_id ASC
    `)
}


export async function updateOrderItemStatus(
    db,
    orderItemId,
    status
) {
    await db.runAsync(
        `
        UPDATE Order_Items
        SET status = ?
        WHERE order_item_id = ?
        `,
        [
            status,
            orderItemId
        ]
    )
}


/* =========================================================
   EXISTING REPORT FUNCTIONS
========================================================= */

export async function getDailySales(
    db,
    date
) {
    return await db.getAllAsync(
        `
        SELECT
            m.menu_id,
            m.name AS menu_name,
            m.unit_price,

            SUM(oi.amount) AS quantity,

            SUM(
                oi.amount *
                oi.unit_price
            ) AS total_price

        FROM Order_Items AS oi

        JOIN Order_Rounds AS r
            ON oi.order_round_id =
               r.order_round_id

        JOIN Bills AS b
            ON r.bill_id =
               b.bill_id

        JOIN Menu AS m
            ON oi.menu_id =
               m.menu_id

        WHERE DATE(b.open_at) = ?

        AND b.status = 'closed'

        GROUP BY
            m.menu_id,
            m.name,
            m.unit_price

        ORDER BY quantity DESC
        `,
        [date]
    )
}


export async function getBestSellingMenus(
    db
) {
    return await db.getAllAsync(`
        SELECT
            m.menu_id,
            m.name AS menu_name,
            m.unit_price,

            SUM(oi.amount) AS quantity,

            SUM(
                oi.amount *
                oi.unit_price
            ) AS total_price

        FROM Order_Items AS oi

        JOIN Order_Rounds AS r
            ON oi.order_round_id =
               r.order_round_id

        JOIN Bills AS b
            ON r.bill_id =
               b.bill_id

        JOIN Menu AS m
            ON oi.menu_id =
               m.menu_id

        WHERE b.status = 'closed'

        GROUP BY
            m.menu_id,
            m.name,
            m.unit_price

        ORDER BY quantity DESC
    `)
}


export async function getBillHistory(
    db,
    date
) {
    return await db.getAllAsync(
        `
        SELECT
            b.bill_id,
            b.open_at,
            b.close_at,

            t.table_name,

            m.name AS menu_name,

            oi.amount,
            oi.unit_price

        FROM Bills AS b

        JOIN Tables AS t
            ON b.table_id =
               t.table_id

        JOIN Order_Rounds AS r
            ON b.bill_id =
               r.bill_id

        JOIN Order_Items AS oi
            ON r.order_round_id =
               oi.order_round_id

        JOIN Menu AS m
            ON oi.menu_id =
               m.menu_id

        WHERE DATE(b.open_at) = ?

        AND b.status = 'closed'
        `,
        [date]
    )
}

const orderItemColumns = await db.getAllAsync(
    `PRAGMA table_info(Order_Items)`
)

const orderItemColumnNames = orderItemColumns.map(
    column => column.name
)

if (!orderItemColumnNames.includes('extra')) {
    await db.execAsync(`
        ALTER TABLE Order_Items
        ADD COLUMN extra TEXT;
    `)
}