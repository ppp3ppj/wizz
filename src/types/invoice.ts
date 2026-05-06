export type DocumentType = "tax" | "receipt" | "both";

export interface PartyInfo {
  name: string;
  address: string;
  taxId: string;
  branch: string;
  phone: string;
}

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface InvoiceData {
  documentType: DocumentType;
  invoiceNumber: string;
  invoiceDate: string;
  seller: PartyInfo;
  buyer: PartyInfo;
  items: LineItem[];
  vatEnabled: boolean;
  notes: string;
}

export interface InvoiceTotals {
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
}
