export const DATABASE_NAME = 'restaurant_order_final.db'

export const ITEM_STATUS = {
    WAIT: 'รอทำ',
    DOING: 'กำลังทำ',
    DONE: 'เสิร์ฟแล้ว',
    CANCELLED: 'ยกเลิก'
}

/* =========================================================
   INIT
   - onDelete ที่เลือก:
     Menu -> Categories      RESTRICT : ห้ามลบหมวดที่ยังมีเมนู
     Bills -> Tables         RESTRICT : ห้ามลบโต๊ะที่มีประวัติบิล
     Order_Rounds -> Bills   CASCADE  : บิลหาย รอบสั่งหายตาม
     Order_Items -> Rounds   CASCADE  : รอบหาย รายการหายตาม
     Order_Items -> Menu     RESTRICT : เมนูที่เคยขายห้ามลบ (ให้ปิดการขายแทน)
     Cart -> Bills / Menu    CASCADE  : ตะกร้าเป็นข้อมูลชั่วคราว
     Transactions -> Bills   RESTRICT : ห้ามลบบิลที่ชำระเงินแล้ว
========================================================= */

export async function openDATABASE(db) {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS Tables (
            table_id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT NOT NULL UNIQUE,
            table_status TEXT NOT NULL DEFAULT 'available'
                CHECK (table_status IN ('available', 'occupied'))
        );

        CREATE TABLE IF NOT EXISTS Categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS Menu (
            menu_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
            is_available INTEGER NOT NULL DEFAULT 1
                CHECK (is_available IN (0, 1)),
            image TEXT,
            FOREIGN KEY (category_id)
                REFERENCES Categories(category_id) ON DELETE RESTRICT
        );

        CREATE TABLE IF NOT EXISTS Bills (
            bill_id INTEGER PRIMARY KEY,
            table_id INTEGER NOT NULL,
            customer_name TEXT,
            customer_count INTEGER
                CHECK (customer_count IS NULL OR customer_count > 0),
            phone TEXT,
            open_at DATETIME NOT NULL,
            close_at DATETIME,
            status TEXT NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'closed')),
            FOREIGN KEY (table_id)
                REFERENCES Tables(table_id) ON DELETE RESTRICT
        );

        CREATE TABLE IF NOT EXISTS Order_Rounds (
            order_round_id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER NOT NULL,
            round INTEGER NOT NULL CHECK (round > 0),
            order_at DATETIME NOT NULL,
            UNIQUE (bill_id, round),
            FOREIGN KEY (bill_id)
                REFERENCES Bills(bill_id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Order_Items (
            order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_round_id INTEGER NOT NULL,
            menu_id INTEGER NOT NULL,
            amount INTEGER NOT NULL CHECK (amount > 0),
            unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
            note TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'รอทำ'
                CHECK (status IN ('รอทำ', 'กำลังทำ', 'เสิร์ฟแล้ว', 'ยกเลิก')),
            cancelled_at DATETIME,
            FOREIGN KEY (order_round_id)
                REFERENCES Order_Rounds(order_round_id) ON DELETE CASCADE,
            FOREIGN KEY (menu_id)
                REFERENCES Menu(menu_id) ON DELETE RESTRICT
        );

        CREATE TABLE IF NOT EXISTS Cart (
            cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER NOT NULL,
            menu_id INTEGER NOT NULL,
            amount INTEGER NOT NULL CHECK (amount > 0),
            unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
            note TEXT NOT NULL DEFAULT '',
            FOREIGN KEY (bill_id)
                REFERENCES Bills(bill_id) ON DELETE CASCADE,
            FOREIGN KEY (menu_id)
                REFERENCES Menu(menu_id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Transactions (
            transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('paid')),
            total_price INTEGER NOT NULL CHECK (total_price >= 0),
            payment_time DATETIME,
            FOREIGN KEY (bill_id)
                REFERENCES Bills(bill_id) ON DELETE RESTRICT
        );

        CREATE INDEX IF NOT EXISTS idx_menu_category
            ON Menu(category_id);
        CREATE INDEX IF NOT EXISTS idx_rounds_bill
            ON Order_Rounds(bill_id);
        CREATE INDEX IF NOT EXISTS idx_items_round
            ON Order_Items(order_round_id);
        CREATE INDEX IF NOT EXISTS idx_bills_status_close
            ON Bills(status, close_at);
        CREATE UNIQUE INDEX IF NOT EXISTS ux_one_open_bill_per_table
            ON Bills(table_id) WHERE status = 'open';
    `)

    // ใส่โต๊ะ T1-T15 ครั้งเดียวตอนฐานข้อมูลว่าง (ไม่ใส่ซ้ำเมื่อเปิดแอปครั้งต่อไป)
    const t = await db.getFirstAsync(`SELECT COUNT(*) AS n FROM Tables`)
    if (t.n === 0) {
        await db.withTransactionAsync(async () => {
            for (let i = 1; i <= 15; i++) {
                await db.runAsync(
                    `INSERT INTO Tables (table_name, table_status) VALUES (?, 'available')`,
                    [`T${i}`]
                )
            }
        })
    }
}

// ล้างข้อมูลการขายทั้งหมด (เมนู/หมวดหมู่/โต๊ะยังอยู่)
export async function resetSalesData(db) {
    await db.withTransactionAsync(async () => {
        await db.runAsync(`DELETE FROM Transactions`)
        await db.runAsync(`DELETE FROM Cart`)
        await db.runAsync(`DELETE FROM Order_Items`)
        await db.runAsync(`DELETE FROM Order_Rounds`)
        await db.runAsync(`DELETE FROM Bills`)
        await db.runAsync(`UPDATE Tables SET table_status = 'available'`)
    })
}

// ใช้แสดงผล EXPLAIN QUERY PLAN ในรายงาน (เรียกแล้ว console.log ดูได้)
export async function getQueryPlans(db) {
    const plans = {}
    plans.menu_by_category = await db.getAllAsync(
        `EXPLAIN QUERY PLAN SELECT * FROM Menu WHERE category_id = ?`, [1]
    )
    plans.rounds_by_bill = await db.getAllAsync(
        `EXPLAIN QUERY PLAN SELECT * FROM Order_Rounds WHERE bill_id = ?`, [1]
    )
    plans.items_by_round = await db.getAllAsync(
        `EXPLAIN QUERY PLAN SELECT * FROM Order_Items WHERE order_round_id = ?`, [1]
    )
    plans.closed_bills_by_date = await db.getAllAsync(
        `EXPLAIN QUERY PLAN
         SELECT * FROM Bills WHERE status = 'closed' AND close_at >= ?`,
        ['2026-01-01']
    )
    return plans
}


/* =========================================================
   TABLE
========================================================= */

export async function getAllTable(db) {
    return await db.getAllAsync(`SELECT * FROM Tables ORDER BY table_id`)
}


/* =========================================================
   CATEGORY
========================================================= */

export async function getAllCategories(db) {
    return await db.getAllAsync(
        `SELECT category_id, category_name FROM Categories ORDER BY category_id`
    )
}

export async function addCategory(db, categoryName) {
    await db.runAsync(
        `INSERT INTO Categories (category_name) VALUES (?)`,
        [categoryName]
    )
}

export async function deleteCategory(db, categoryId) {
    const r = await db.getFirstAsync(
        `SELECT COUNT(*) AS n FROM Menu WHERE category_id = ?`, [categoryId]
    )
    if (r.n > 0) {
        throw new Error('ไม่สามารถลบหมวดหมู่ที่ยังมีเมนูอยู่ได้')
    }
    await db.runAsync(
        `DELETE FROM Categories WHERE category_id = ?`, [categoryId]
    )
}


/* =========================================================
   MENU  (ข2 ค้นหา/กรองของ, ข5 ตั้งค่าเมนู)
========================================================= */

export async function searchMenu(
    db,
    { categoryId = null, search = '', onlyAvailable = false } = {}
) {
    return await db.getAllAsync(
        `
        SELECT
            m.menu_id,
            m.name AS menu_name,
            m.unit_price,
            m.is_available,
            m.image,
            m.category_id,
            c.category_name
        FROM Menu AS m
        JOIN Categories AS c ON m.category_id = c.category_id
        WHERE (? IS NULL OR m.category_id = ?)
          AND m.name LIKE '%' || ? || '%'
          AND (? = 0 OR m.is_available = 1)
        ORDER BY c.category_id, m.menu_id
        `,
        [categoryId, categoryId, search.trim(), onlyAvailable ? 1 : 0]
    )
}

export async function addMenu(db, name, unitPrice, categoryId, image) {
    await db.runAsync(
        `INSERT INTO Menu (category_id, name, unit_price, is_available, image)
         VALUES (?, ?, ?, 1, ?)`,
        [categoryId, name, unitPrice, image || null]
    )
}

// แก้ราคา: บิลเก่าไม่เปลี่ยน เพราะ Order_Items เก็บ unit_price ณ ตอนสั่งไว้เอง
export async function saveMenu(db, menuId, name, unitPrice, categoryId, image) {
    await db.runAsync(
        `UPDATE Menu
         SET name = ?, unit_price = ?, category_id = ?, image = ?
         WHERE menu_id = ?`,
        [name, unitPrice, categoryId, image || null, menuId]
    )
}

export async function setMenuAvailable(db, menuId, available) {
    await db.runAsync(
        `UPDATE Menu SET is_available = ? WHERE menu_id = ?`,
        [available ? 1 : 0, menuId]
    )
}

export async function deleteMenu(db, menuId) {
    const r = await db.getFirstAsync(
        `SELECT COUNT(*) AS n FROM Order_Items WHERE menu_id = ?`, [menuId]
    )
    if (r.n > 0) {
        throw new Error('เมนูนี้เคยถูกสั่งแล้ว ลบไม่ได้ ให้ใช้ "ปิดการขาย" แทน')
    }
    await db.runAsync(`DELETE FROM Menu WHERE menu_id = ?`, [menuId])
}


/* =========================================================
   CART
========================================================= */

export async function addToCart(db, billId, menuId, amount, note) {
    const qty = Number(amount)
    if (!Number.isInteger(qty) || qty <= 0) {
        throw new Error('จำนวนต้องมากกว่า 0')
    }
    const cleanNote = (note || '').trim()

    await db.withTransactionAsync(async () => {
        const bill = await db.getFirstAsync(
            `SELECT status FROM Bills WHERE bill_id = ?`, [billId]
        )
        if (!bill || bill.status !== 'open') {
            throw new Error('บิลนี้ไม่ได้เปิดอยู่')
        }

        const menu = await db.getFirstAsync(
            `SELECT unit_price, is_available FROM Menu WHERE menu_id = ?`,
            [menuId]
        )
        if (!menu || menu.is_available !== 1) {
            throw new Error('เมนูนี้ปิดการขายอยู่')
        }

        const existing = await db.getFirstAsync(
            `SELECT cart_id FROM Cart
             WHERE bill_id = ? AND menu_id = ? AND note = ?`,
            [billId, menuId, cleanNote]
        )

        if (existing) {
            await db.runAsync(
                `UPDATE Cart SET amount = amount + ? WHERE cart_id = ?`,
                [qty, existing.cart_id]
            )
        } else {
            await db.runAsync(
                `INSERT INTO Cart (bill_id, menu_id, amount, unit_price, note)
                 VALUES (?, ?, ?, ?, ?)`,
                [billId, menuId, qty, menu.unit_price, cleanNote]
            )
        }
    })
}

export async function getCart(db, billId) {
    return await db.getAllAsync(
        `
        SELECT
            c.cart_id, c.bill_id, c.menu_id, c.amount,
            c.unit_price, c.note,
            m.name AS menu_name,
            (c.amount * c.unit_price) AS line_total
        FROM Cart AS c
        JOIN Menu AS m ON c.menu_id = m.menu_id
        WHERE c.bill_id = ?
        ORDER BY c.cart_id
        `,
        [billId]
    )
}

export async function getCartTotal(db, billId) {
    const r = await db.getFirstAsync(
        `SELECT COALESCE(SUM(amount * unit_price), 0) AS total
         FROM Cart WHERE bill_id = ?`,
        [billId]
    )
    return r?.total || 0
}

export async function changeCartAmount(db, cartId, delta) {
    await db.withTransactionAsync(async () => {
        const row = await db.getFirstAsync(
            `SELECT amount FROM Cart WHERE cart_id = ?`, [cartId]
        )
        if (!row) return
        const next = row.amount + delta
        if (next <= 0) {
            await db.runAsync(`DELETE FROM Cart WHERE cart_id = ?`, [cartId])
        } else {
            await db.runAsync(
                `UPDATE Cart SET amount = ? WHERE cart_id = ?`, [next, cartId]
            )
        }
    })
}

export async function removeCartItem(db, cartId) {
    await db.runAsync(`DELETE FROM Cart WHERE cart_id = ?`, [cartId])
}


/* =========================================================
   BILL
========================================================= */

async function makeBillId(db) {
    while (true) {
        const id = Math.floor(100000 + Math.random() * 900000)
        const check = await db.getFirstAsync(
            `SELECT bill_id FROM Bills WHERE bill_id = ?`, [id]
        )
        if (!check) return id
    }
}

export async function openBill(db, tableId, customerName, customerCount, phone) {
    let bill = null

    await db.withTransactionAsync(async () => {
        const already = await db.getFirstAsync(
            `SELECT bill_id FROM Bills WHERE table_id = ? AND status = 'open'`,
            [tableId]
        )
        if (already) {
            throw new Error('โต๊ะนี้มีบิลที่เปิดอยู่แล้ว')
        }

        const billId = await makeBillId(db)

        await db.runAsync(
            `INSERT INTO Bills
                (bill_id, table_id, customer_name, customer_count, phone, open_at, status)
             VALUES (?, ?, ?, ?, ?, datetime('now','localtime'), 'open')`,
            [billId, tableId, customerName || null, customerCount || null, phone || null]
        )

        await db.runAsync(
            `UPDATE Tables SET table_status = 'occupied' WHERE table_id = ?`,
            [tableId]
        )

        bill = await db.getFirstAsync(
            `SELECT * FROM Bills WHERE bill_id = ?`, [billId]
        )
    })

    return bill
}

export async function getOpenBillByTable(db, tableId) {
    return await db.getFirstAsync(
        `SELECT * FROM Bills
         WHERE table_id = ? AND status = 'open'
         ORDER BY open_at DESC LIMIT 1`,
        [tableId]
    )
}

export async function getOpenBillById(db, billId) {
    return await db.getFirstAsync(
        `SELECT * FROM Bills WHERE bill_id = ? AND status = 'open' LIMIT 1`,
        [billId]
    )
}

export async function getBillInfo(db, billId) {
    return await db.getFirstAsync(
        `SELECT b.*, t.table_name
         FROM Bills AS b
         JOIN Tables AS t ON b.table_id = t.table_id
         WHERE b.bill_id = ?`,
        [billId]
    )
}

// ก1: ฝั่งลูกค้าเลือกโต๊ะ -> เข้าบิลที่ค้างอยู่ ถ้าไม่มีก็เปิดบิลใหม่
export async function openOrGetBill(db, tableId) {
    const existing = await getOpenBillByTable(db, tableId)
    if (existing) return existing
    return await openBill(db, tableId, null, null, null)
}


/* =========================================================
   ORDER ROUND (ส่งเข้าครัว 1 รอบ = 1 ทรานแซกชัน)
========================================================= */

export async function createOrderRound(db, billId) {
    let createdRound = null

    await db.withTransactionAsync(async () => {
        const bill = await db.getFirstAsync(
            `SELECT status FROM Bills WHERE bill_id = ?`, [billId]
        )
        if (!bill || bill.status !== 'open') {
            throw new Error('บิลนี้ไม่ได้เปิดอยู่')
        }

        const cnt = await db.getFirstAsync(
            `SELECT COUNT(*) AS n FROM Cart WHERE bill_id = ?`, [billId]
        )
        if (cnt.n === 0) {
            throw new Error('ไม่มีรายการอาหารในตะกร้า')
        }

        const r = await db.getFirstAsync(
            `SELECT COALESCE(MAX(round), 0) AS max_round
             FROM Order_Rounds WHERE bill_id = ?`,
            [billId]
        )
        const nextRound = r.max_round + 1

        const ins = await db.runAsync(
            `INSERT INTO Order_Rounds (bill_id, round, order_at)
             VALUES (?, ?, datetime('now','localtime'))`,
            [billId, nextRound]
        )
        const orderRoundId = ins.lastInsertRowId

        // คัดลอกรายการ + ราคา ณ ตอนสั่ง จากตะกร้า (ราคาบิลเก่าจึงไม่เปลี่ยนตามเมนู)
        await db.runAsync(
            `INSERT INTO Order_Items
                (order_round_id, menu_id, amount, unit_price, note, status)
             SELECT ?, menu_id, amount, unit_price, note, 'รอทำ'
             FROM Cart WHERE bill_id = ? ORDER BY cart_id`,
            [orderRoundId, billId]
        )

        await db.runAsync(`DELETE FROM Cart WHERE bill_id = ?`, [billId])

        createdRound = { orderRoundId, round: nextRound }
    })

    return createdRound
}


/* =========================================================
   KITCHEN
========================================================= */

export async function getKitchenOrders(db) {
    return await db.getAllAsync(`
        SELECT
            oi.order_item_id,
            oi.amount,
            oi.note,
            oi.status,
            oi.cancelled_at,
            r.order_round_id,
            r.round,
            r.order_at,
            b.bill_id,
            t.table_name,
            m.name AS menu_name
        FROM Order_Items AS oi
        JOIN Order_Rounds AS r ON oi.order_round_id = r.order_round_id
        JOIN Bills AS b ON r.bill_id = b.bill_id
        JOIN Tables AS t ON b.table_id = t.table_id
        JOIN Menu AS m ON oi.menu_id = m.menu_id
        WHERE b.status = 'open'
        ORDER BY r.order_at ASC, r.order_round_id ASC, oi.order_item_id ASC
    `)
}

export async function updateOrderItemStatus(db, orderItemId, status) {
    await db.runAsync(
        `UPDATE Order_Items
         SET status = ?
         WHERE order_item_id = ? AND status <> 'ยกเลิก'`,
        [status, orderItemId]
    )
}

// ข3: ยกเลิกได้เฉพาะรายการที่ยัง "รอทำ" และบิลยังเปิดอยู่ พร้อมบันทึกเวลา
export async function cancelOrderItem(db, orderItemId) {
    const res = await db.runAsync(
        `UPDATE Order_Items
         SET status = 'ยกเลิก', cancelled_at = datetime('now','localtime')
         WHERE order_item_id = ?
           AND status = 'รอทำ'
           AND order_round_id IN (
               SELECT r.order_round_id
               FROM Order_Rounds AS r
               JOIN Bills AS b ON r.bill_id = b.bill_id
               WHERE b.status = 'open'
           )`,
        [orderItemId]
    )
    if (res.changes === 0) {
        throw new Error('ยกเลิกไม่ได้ เพราะครัวเริ่มทำแล้วหรือรายการถูกยกเลิกไปแล้ว')
    }
}


/* =========================================================
   BILL SUMMARY (ยอดรวมคำนวณด้วย SQL, ไม่นับรายการที่ยกเลิก)
========================================================= */

export async function getBillOrders(db, billId) {
    return await db.getAllAsync(
        `
        SELECT
            r.order_round_id,
            r.round,
            r.order_at,
            oi.order_item_id,
            oi.amount,
            oi.unit_price,
            oi.note,
            oi.status,
            oi.cancelled_at,
            m.menu_id,
            m.name AS menu_name,
            (oi.amount * oi.unit_price) AS line_total,
            (
                SELECT COALESCE(SUM(x.amount * x.unit_price), 0)
                FROM Order_Items AS x
                WHERE x.order_round_id = r.order_round_id
                  AND x.status <> 'ยกเลิก'
            ) AS round_total
        FROM Order_Rounds AS r
        JOIN Order_Items AS oi ON r.order_round_id = oi.order_round_id
        JOIN Menu AS m ON oi.menu_id = m.menu_id
        WHERE r.bill_id = ?
        ORDER BY r.round, oi.order_item_id
        `,
        [billId]
    )
}

export async function getBillTotal(db, billId) {
    const r = await db.getFirstAsync(
        `
        SELECT COALESCE(SUM(oi.amount * oi.unit_price), 0) AS total_price
        FROM Order_Rounds AS r
        JOIN Order_Items AS oi ON r.order_round_id = oi.order_round_id
        WHERE r.bill_id = ? AND oi.status <> 'ยกเลิก'
        `,
        [billId]
    )
    return r?.total_price || 0
}

export async function closeBill(db, billId) {
    let result = null

    await db.withTransactionAsync(async () => {
        const bill = await db.getFirstAsync(
            `SELECT bill_id, table_id, status FROM Bills WHERE bill_id = ?`,
            [billId]
        )
        if (!bill) throw new Error('ไม่พบบิลนี้')
        if (bill.status !== 'open') throw new Error('บิลนี้ถูกปิดไปแล้ว')

        const totalRow = await db.getFirstAsync(
            `
            SELECT COALESCE(SUM(oi.amount * oi.unit_price), 0) AS total_price
            FROM Order_Rounds AS r
            JOIN Order_Items AS oi ON r.order_round_id = oi.order_round_id
            WHERE r.bill_id = ? AND oi.status <> 'ยกเลิก'
            `,
            [billId]
        )
        const totalPrice = totalRow?.total_price || 0

        await db.runAsync(
            `UPDATE Bills
             SET status = 'closed', close_at = datetime('now','localtime')
             WHERE bill_id = ?`,
            [billId]
        )
        await db.runAsync(`DELETE FROM Cart WHERE bill_id = ?`, [billId])
        await db.runAsync(
            `UPDATE Tables SET table_status = 'available' WHERE table_id = ?`,
            [bill.table_id]
        )
        await db.runAsync(
            `INSERT INTO Transactions (bill_id, status, total_price, payment_time)
             VALUES (?, 'paid', ?, datetime('now','localtime'))`,
            [billId, totalPrice]
        )

        result = { billId, tableId: bill.table_id, totalPrice }
    })

    return result
}


/* =========================================================
   ข4: ย้ายโต๊ะ / แยกบิล (รายการที่สั่งไปแล้วต้องไม่หาย)
========================================================= */

export async function moveTable(db, billId, newTableId) {
    await db.withTransactionAsync(async () => {
        const bill = await db.getFirstAsync(
            `SELECT bill_id, table_id FROM Bills
             WHERE bill_id = ? AND status = 'open'`,
            [billId]
        )
        if (!bill) throw new Error('ไม่พบบิลที่เปิดอยู่')

        const target = await db.getFirstAsync(
            `SELECT table_status FROM Tables WHERE table_id = ?`, [newTableId]
        )
        if (!target || target.table_status !== 'available') {
            throw new Error('โต๊ะปลายทางไม่ว่าง')
        }

        await db.runAsync(
            `UPDATE Bills SET table_id = ? WHERE bill_id = ?`,
            [newTableId, billId]
        )
        await db.runAsync(
            `UPDATE Tables SET table_status = 'available' WHERE table_id = ?`,
            [bill.table_id]
        )
        await db.runAsync(
            `UPDATE Tables SET table_status = 'occupied' WHERE table_id = ?`,
            [newTableId]
        )
    })
}

// แยกรายการที่เลือกไปเป็นบิลใหม่ที่โต๊ะว่าง (ย้ายรายการ ไม่ลบ ไม่คัดลอก)
export async function splitBill(db, billId, orderItemIds, targetTableId) {
    const ids = [...new Set(orderItemIds || [])]
    if (ids.length === 0) {
        throw new Error('กรุณาเลือกรายการที่ต้องการแยก')
    }

    let newBill = null

    await db.withTransactionAsync(async () => {
        const bill = await db.getFirstAsync(
            `SELECT * FROM Bills WHERE bill_id = ? AND status = 'open'`,
            [billId]
        )
        if (!bill) throw new Error('ไม่พบบิลที่เปิดอยู่')

        const target = await db.getFirstAsync(
            `SELECT table_status FROM Tables WHERE table_id = ?`,
            [targetTableId]
        )
        if (!target || target.table_status !== 'available') {
            throw new Error('โต๊ะปลายทางไม่ว่าง')
        }

        // ตรวจรายการ และจัดกลุ่มตามรอบเดิม
        const sourceRounds = new Map()
        for (const id of ids) {
            const it = await db.getFirstAsync(
                `SELECT oi.order_item_id, oi.status,
                        r.order_round_id, r.round, r.order_at
                 FROM Order_Items AS oi
                 JOIN Order_Rounds AS r ON oi.order_round_id = r.order_round_id
                 WHERE oi.order_item_id = ? AND r.bill_id = ?`,
                [id, billId]
            )
            if (!it) throw new Error('มีรายการที่ไม่ได้อยู่ในบิลนี้')
            if (it.status === 'ยกเลิก') throw new Error('แยกรายการที่ยกเลิกแล้วไม่ได้')

            if (!sourceRounds.has(it.order_round_id)) {
                sourceRounds.set(it.order_round_id, {
                    order_round_id: it.order_round_id,
                    round: it.round,
                    order_at: it.order_at,
                    items: []
                })
            }
            sourceRounds.get(it.order_round_id).items.push(id)
        }

        const newBillId = await makeBillId(db)

        await db.runAsync(
            `INSERT INTO Bills
                (bill_id, table_id, customer_name, customer_count, phone, open_at, status)
             VALUES (?, ?, ?, NULL, ?, datetime('now','localtime'), 'open')`,
            [newBillId, targetTableId, bill.customer_name, bill.phone]
        )
        await db.runAsync(
            `UPDATE Tables SET table_status = 'occupied' WHERE table_id = ?`,
            [targetTableId]
        )

        const rounds = [...sourceRounds.values()].sort((a, b) => a.round - b.round)
        let roundNo = 0
        for (const sr of rounds) {
            roundNo += 1
            const ins = await db.runAsync(
                `INSERT INTO Order_Rounds (bill_id, round, order_at)
                 VALUES (?, ?, ?)`,
                [newBillId, roundNo, sr.order_at]
            )
            for (const itemId of sr.items) {
                await db.runAsync(
                    `UPDATE Order_Items SET order_round_id = ?
                     WHERE order_item_id = ?`,
                    [ins.lastInsertRowId, itemId]
                )
            }
            const left = await db.getFirstAsync(
                `SELECT COUNT(*) AS n FROM Order_Items WHERE order_round_id = ?`,
                [sr.order_round_id]
            )
            if (left.n === 0) {
                await db.runAsync(
                    `DELETE FROM Order_Rounds WHERE order_round_id = ?`,
                    [sr.order_round_id]
                )
            }
        }

        newBill = await db.getFirstAsync(
            `SELECT * FROM Bills WHERE bill_id = ?`, [newBillId]
        )
    })

    return newBill
}


/* =========================================================
   REPORT (ข1, ข6, ประวัติบิล)  date = 'yyyy-mm-dd'
========================================================= */

export async function getDailySalesByCategory(db, date) {
    return await db.getAllAsync(
        `
        SELECT
            c.category_id,
            c.category_name,
            SUM(oi.amount) AS quantity,
            SUM(oi.amount * oi.unit_price) AS total_price
        FROM Order_Items AS oi
        JOIN Order_Rounds AS r ON oi.order_round_id = r.order_round_id
        JOIN Bills AS b ON r.bill_id = b.bill_id
        JOIN Menu AS m ON oi.menu_id = m.menu_id
        JOIN Categories AS c ON m.category_id = c.category_id
        WHERE b.status = 'closed'
          AND DATE(b.close_at) = ?
          AND oi.status <> 'ยกเลิก'
        GROUP BY c.category_id, c.category_name
        ORDER BY total_price DESC
        `,
        [date]
    )
}

export async function getDailyTotal(db, date) {
    const r = await db.getFirstAsync(
        `
        SELECT
            COALESCE(SUM(oi.amount * oi.unit_price), 0) AS total_price,
            COALESCE(SUM(oi.amount), 0) AS quantity,
            COUNT(DISTINCT b.bill_id) AS bills
        FROM Order_Items AS oi
        JOIN Order_Rounds AS r ON oi.order_round_id = r.order_round_id
        JOIN Bills AS b ON r.bill_id = b.bill_id
        WHERE b.status = 'closed'
          AND DATE(b.close_at) = ?
          AND oi.status <> 'ยกเลิก'
        `,
        [date]
    )
    return r || { total_price: 0, quantity: 0, bills: 0 }
}

export async function getBestSellingMenus(db, fromDate, toDate) {
    return await db.getAllAsync(
        `
        SELECT
            m.menu_id,
            m.name AS menu_name,
            SUM(oi.amount) AS quantity,
            SUM(oi.amount * oi.unit_price) AS total_price
        FROM Order_Items AS oi
        JOIN Order_Rounds AS r ON oi.order_round_id = r.order_round_id
        JOIN Bills AS b ON r.bill_id = b.bill_id
        JOIN Menu AS m ON oi.menu_id = m.menu_id
        WHERE b.status = 'closed'
          AND DATE(b.close_at) BETWEEN ? AND ?
          AND oi.status <> 'ยกเลิก'
        GROUP BY m.menu_id, m.name
        ORDER BY quantity DESC, total_price DESC
        LIMIT 10
        `,
        [fromDate, toDate]
    )
}

export async function getClosedBillsByDate(db, date) {
    return await db.getAllAsync(
        `
        SELECT
            b.bill_id,
            t.table_name,
            b.open_at,
            b.close_at,
            (
                SELECT COALESCE(SUM(oi.amount * oi.unit_price), 0)
                FROM Order_Rounds AS r
                JOIN Order_Items AS oi ON r.order_round_id = oi.order_round_id
                WHERE r.bill_id = b.bill_id AND oi.status <> 'ยกเลิก'
            ) AS total_price
        FROM Bills AS b
        JOIN Tables AS t ON b.table_id = t.table_id
        WHERE b.status = 'closed' AND DATE(b.close_at) = ?
        ORDER BY b.close_at DESC
        `,
        [date]
    )
}