// ราคาในฐานข้อมูลเก็บเป็นสตางค์ (INTEGER) แปลงเป็นบาทตอนแสดงผลเท่านั้น
export function formatBaht(satang) {
    const n = Number(satang) || 0
    return (n / 100).toFixed(2)
}

// "60" -> 6000, "59.5" -> 5950, ค่าที่ไม่ถูกต้อง -> null
export function bahtToSatang(text) {
    const s = String(text ?? '').trim().replace(/,/g, '')
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return null
    const [i, d = ''] = s.split('.')
    return Number(i) * 100 + Number(d.padEnd(2, '0'))
}

const pad2 = n => String(n).padStart(2, '0')

function ymd(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function todayStr() {
    return ymd(new Date())
}

export function addDays(dateStr, days) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return ymd(new Date(y, m - 1, d + days))
}

// รับ dd/mm/yyyy หรือ yyyy-mm-dd (ปี พ.ศ. หรือ ค.ศ.) -> 'yyyy-mm-dd' หรือ null
export function parseDate(text) {
    const s = String(text ?? '').trim()
    let y, m, d
    let match = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/)
    if (match) {
        d = Number(match[1]); m = Number(match[2]); y = Number(match[3])
    } else {
        match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
        if (!match) return null
        y = Number(match[1]); m = Number(match[2]); d = Number(match[3])
    }
    if (y > 2400) y -= 543
    const test = new Date(y, m - 1, d)
    if (test.getFullYear() !== y || test.getMonth() !== m - 1 || test.getDate() !== d) {
        return null
    }
    return `${y}-${pad2(m)}-${pad2(d)}`
}

// 'yyyy-mm-dd' -> 'dd/mm/yyyy'
export function showDate(dateStr) {
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
}