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
            status TEXT NOT NULL,
            FOREIGN KEY (order_round_id) REFERENCES Order_Rounds(order_round_id),
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
}

export async function insertTable(db, tables) {
    for (let i = 0; i < tables.length; i++) {
        await db.runAsync(
            `INSERT OR IGNORE INTO Tables (table_name, table_status) VALUES (?, ?)`,[tables[i].table_name,tables[i].status]
        )
    }
}

export async function getAllTable(db) {
    const result = await db.getAllAsync(`SELECT * FROM Tables`)
    return result //คืนค่าเป็น Array ที่เก็บ Objects 
}

export async function getAllOrder(db) {
    const result = await db.getAllAsync(`
        SELECT
            t.table_name AS table_name,
            b.bill_id AS bill_id,
            r.round AS round,
            m.name AS menu_name,
            c.category_name AS category_name
        FROM Bills AS b
        JOIN Tables AS t ON b.table_id = t.table_id
        JOIN Order_Rounds AS r ON r.bill_id = b.bill_id
        JOIN Order_Items AS oi ON oi.order_round_id = r.order_round_id
        JOIN Menu AS m ON oi.menu_id = m.menu_id
        JOIN Categories AS c ON c.category_id = m.category_id
    `)

    return result
}

export async function getAllBill(db) {
    const result = await getAllAsync(`
        
    `)
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
        for(const item of cartItem) {
            await db.runAsync(`
                INSERT INTO Order_Items (order_round_id, menu_id, amount, unit_price, status) VALUES (?, ?, ?, ?, ?)`, 
                [orderRoundId, item.menu_id, item.amount, item.unit_price, item.status]);
            }
    
        })
}
