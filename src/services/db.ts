import Database from "@tauri-apps/plugin-sql";
import type { InvoiceData, InvoiceTotals, ContactRow, InvoiceSummary } from "../types/invoice";

let _db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!_db) {
    _db = await Database.load("sqlite:wizz.db");
    await runMigrations(_db);
  }
  return _db;
}

async function runMigrations(db: Database) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS contacts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      type       TEXT NOT NULL,
      name       TEXT NOT NULL DEFAULT '',
      address    TEXT NOT NULL DEFAULT '',
      tax_id     TEXT NOT NULL DEFAULT '',
      branch     TEXT NOT NULL DEFAULT 'สำนักงานใหญ่',
      phone      TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS invoices (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      document_type  TEXT NOT NULL DEFAULT 'both',
      invoice_number TEXT NOT NULL DEFAULT '',
      invoice_date   TEXT NOT NULL,
      seller_name    TEXT NOT NULL DEFAULT '',
      seller_address TEXT NOT NULL DEFAULT '',
      seller_tax_id  TEXT NOT NULL DEFAULT '',
      seller_branch  TEXT NOT NULL DEFAULT '',
      seller_phone   TEXT NOT NULL DEFAULT '',
      buyer_name     TEXT NOT NULL DEFAULT '',
      buyer_address  TEXT NOT NULL DEFAULT '',
      buyer_tax_id   TEXT NOT NULL DEFAULT '',
      buyer_branch   TEXT NOT NULL DEFAULT '',
      buyer_phone    TEXT NOT NULL DEFAULT '',
      vat_enabled    INTEGER NOT NULL DEFAULT 1,
      notes          TEXT NOT NULL DEFAULT '',
      subtotal       REAL NOT NULL DEFAULT 0,
      vat_amount     REAL NOT NULL DEFAULT 0,
      grand_total    REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id  INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      qty         REAL NOT NULL DEFAULT 1,
      unit_price  REAL NOT NULL DEFAULT 0
    )
  `);
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export async function dbSaveInvoice(
  data: InvoiceData,
  totals: InvoiceTotals,
): Promise<number> {
  const db = await getDb();
  const result = await db.execute(
    `INSERT INTO invoices (
      document_type, invoice_number, invoice_date,
      seller_name, seller_address, seller_tax_id, seller_branch, seller_phone,
      buyer_name, buyer_address, buyer_tax_id, buyer_branch, buyer_phone,
      vat_enabled, notes, subtotal, vat_amount, grand_total
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      data.documentType, data.invoiceNumber, data.invoiceDate,
      data.seller.name, data.seller.address, data.seller.taxId, data.seller.branch, data.seller.phone,
      data.buyer.name, data.buyer.address, data.buyer.taxId, data.buyer.branch, data.buyer.phone,
      data.vatEnabled ? 1 : 0, data.notes,
      totals.subtotal, totals.vatAmount, totals.grandTotal,
    ],
  );
  const id = result.lastInsertId as number;
  await insertItems(db, id, data);
  return id;
}

export async function dbUpdateInvoice(
  id: number,
  data: InvoiceData,
  totals: InvoiceTotals,
): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE invoices SET
      document_type=?, invoice_number=?, invoice_date=?,
      seller_name=?, seller_address=?, seller_tax_id=?, seller_branch=?, seller_phone=?,
      buyer_name=?, buyer_address=?, buyer_tax_id=?, buyer_branch=?, buyer_phone=?,
      vat_enabled=?, notes=?, subtotal=?, vat_amount=?, grand_total=?,
      updated_at=datetime('now','localtime')
    WHERE id=?`,
    [
      data.documentType, data.invoiceNumber, data.invoiceDate,
      data.seller.name, data.seller.address, data.seller.taxId, data.seller.branch, data.seller.phone,
      data.buyer.name, data.buyer.address, data.buyer.taxId, data.buyer.branch, data.buyer.phone,
      data.vatEnabled ? 1 : 0, data.notes,
      totals.subtotal, totals.vatAmount, totals.grandTotal,
      id,
    ],
  );
  await db.execute(`DELETE FROM invoice_items WHERE invoice_id=?`, [id]);
  await insertItems(db, id, data);
}

async function insertItems(db: Database, invoiceId: number, data: InvoiceData) {
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    await db.execute(
      `INSERT INTO invoice_items (invoice_id, sort_order, description, qty, unit_price)
       VALUES (?,?,?,?,?)`,
      [invoiceId, i, item.description, item.qty, item.unitPrice],
    );
  }
}

export async function dbGetInvoices(): Promise<InvoiceSummary[]> {
  const db = await getDb();
  const rows = await db.select<any[]>(
    `SELECT id, invoice_number, invoice_date, buyer_name, grand_total, document_type, created_at
     FROM invoices ORDER BY created_at DESC`,
  );
  return rows.map((r) => ({
    id: r.id,
    invoiceNumber: r.invoice_number,
    invoiceDate: r.invoice_date,
    buyerName: r.buyer_name,
    grandTotal: r.grand_total,
    documentType: r.document_type,
    createdAt: r.created_at,
  }));
}

export async function dbGetInvoice(id: number): Promise<InvoiceData> {
  const db = await getDb();
  const [row] = await db.select<any[]>(`SELECT * FROM invoices WHERE id=?`, [id]);
  const items = await db.select<any[]>(
    `SELECT * FROM invoice_items WHERE invoice_id=? ORDER BY sort_order`,
    [id],
  );
  return {
    documentType: row.document_type,
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date,
    seller: {
      name: row.seller_name,
      address: row.seller_address,
      taxId: row.seller_tax_id,
      branch: row.seller_branch,
      phone: row.seller_phone,
    },
    buyer: {
      name: row.buyer_name,
      address: row.buyer_address,
      taxId: row.buyer_tax_id,
      branch: row.buyer_branch,
      phone: row.buyer_phone,
    },
    items: items.map((it) => ({
      id: crypto.randomUUID(),
      description: it.description,
      qty: it.qty,
      unitPrice: it.unit_price,
    })),
    vatEnabled: row.vat_enabled === 1,
    notes: row.notes,
  };
}

export async function dbDeleteInvoice(id: number): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM invoices WHERE id=?`, [id]);
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export async function dbGetContacts(type: "seller" | "buyer"): Promise<ContactRow[]> {
  const db = await getDb();
  const rows = await db.select<any[]>(
    `SELECT * FROM contacts WHERE type=? ORDER BY name`,
    [type],
  );
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    name: r.name,
    address: r.address,
    taxId: r.tax_id,
    branch: r.branch,
    phone: r.phone,
  }));
}

export async function dbSaveContact(c: Omit<ContactRow, "id">): Promise<number> {
  const db = await getDb();
  const result = await db.execute(
    `INSERT INTO contacts (type, name, address, tax_id, branch, phone) VALUES (?,?,?,?,?,?)`,
    [c.type, c.name, c.address, c.taxId, c.branch, c.phone],
  );
  return result.lastInsertId as number;
}

export async function dbUpdateContact(id: number, c: Omit<ContactRow, "id">): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE contacts SET name=?, address=?, tax_id=?, branch=?, phone=?,
     updated_at=datetime('now','localtime') WHERE id=?`,
    [c.name, c.address, c.taxId, c.branch, c.phone, id],
  );
}

export async function dbDeleteContact(id: number): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM contacts WHERE id=?`, [id]);
}
