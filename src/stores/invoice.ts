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

const [invoice, setInvoice] = createStore<InvoiceData>(defaultInvoice());

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
