import { createMemo } from "solid-js";
import { createStore } from "solid-js/store";
import type { InvoiceData, InvoiceTotals, LineItem, PartyInfo } from "../types/invoice";

function defaultParty(): PartyInfo {
  return { name: "", address: "", taxId: "", branch: "สำนักงานใหญ่", phone: "" };
}

function defaultItem(): LineItem {
  return { id: crypto.randomUUID(), description: "", qty: 1, unitPrice: 0 };
}

function defaultInvoice(): InvoiceData {
  const today = new Date().toISOString().split("T")[0];
  return {
    documentType: "both",
    invoiceNumber: "",
    invoiceDate: today,
    seller: defaultParty(),
    buyer: defaultParty(),
    items: [defaultItem()],
    vatEnabled: true,
    notes: "",
  };
}

function mockInvoice(): InvoiceData {
  return {
    documentType: "both",
    invoiceNumber: "INV-2567-00142",
    invoiceDate: new Date().toISOString().split("T")[0],
    seller: {
      name: "บริษัท วิซซ์ เทคโนโลยี จำกัด",
      address: "123/45 อาคารสยามพารากอน ชั้น 10\nถนนพระรามที่ 1 แขวงปทุมวัน\nเขตปทุมวัน กรุงเทพมหานคร 10330",
      taxId: "0105567012345",
      branch: "สำนักงานใหญ่",
      phone: "02-610-9000",
    },
    buyer: {
      name: "บริษัท ลูกค้า ดีมาก จำกัด",
      address: "88/8 ถนนสุขุมวิท 21 (อโศก)\nแขวงคลองเตยเหนือ เขตวัฒนา\nกรุงเทพมหานคร 10110",
      taxId: "0105560098765",
      branch: "สำนักงานใหญ่",
      phone: "02-260-1234",
    },
    items: [
      { id: crypto.randomUUID(), description: "ค่าพัฒนาซอฟต์แวร์ระบบ ERP (เดือนพฤษภาคม 2567)", qty: 1, unitPrice: 85000 },
      { id: crypto.randomUUID(), description: "ค่าบริการติดตั้งและตั้งค่าระบบ", qty: 1, unitPrice: 12000 },
      { id: crypto.randomUUID(), description: "ค่าอบรมการใช้งาน (จำนวน 2 วัน)", qty: 2, unitPrice: 8500 },
      { id: crypto.randomUUID(), description: "ค่า Hosting รายปี (AWS Cloud Server)", qty: 1, unitPrice: 24000 },
    ],
    vatEnabled: true,
    notes: "กรุณาชำระเงินภายใน 30 วัน นับจากวันที่ออกใบแจ้งหนี้\nโอนเงินผ่านบัญชี ธ.กสิกรไทย เลขที่ 012-3-45678-9 ชื่อบัญชี บริษัท วิซซ์ เทคโนโลยี จำกัด",
  };
}

const [invoice, setInvoice] = createStore<InvoiceData>(mockInvoice());

const totals = createMemo<InvoiceTotals>(() => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const vatAmount = invoice.vatEnabled ? subtotal * 0.07 : 0;
  return { subtotal, vatAmount, grandTotal: subtotal + vatAmount };
});

function addItem() {
  setInvoice("items", (items) => [...items, defaultItem()]);
}

function removeItem(id: string) {
  setInvoice("items", (items) => items.filter((i) => i.id !== id));
}

function updateItem(id: string, field: keyof Omit<LineItem, "id">, value: string | number) {
  setInvoice("items", (item) => item.id === id, field, value as never);
}

function updateSeller(field: keyof PartyInfo, value: string) {
  setInvoice("seller", field, value);
}

function updateBuyer(field: keyof PartyInfo, value: string) {
  setInvoice("buyer", field, value);
}

function resetInvoice() {
  setInvoice(defaultInvoice());
}

export { invoice, setInvoice, totals, addItem, removeItem, updateItem, updateSeller, updateBuyer, resetInvoice };
