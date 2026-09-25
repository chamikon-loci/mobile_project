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