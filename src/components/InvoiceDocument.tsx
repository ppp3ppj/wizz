import { For, Show } from "solid-js";
import { invoice, totals } from "../stores/invoice";

function thb(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function docTitle() {
  if (invoice.documentType === "tax") return "ใบกำกับภาษี";
  if (invoice.documentType === "receipt") return "ใบเสร็จรับเงิน";
  return "ใบกำกับภาษี / ใบเสร็จรับเงิน";
}

const cellStyle = "border: 1px solid #d1d5db; padding: 4px 8px;";
const headerCellStyle = `${cellStyle} background: #f3f4f6; font-weight: 600; text-align: center;`;

export function InvoiceDocument() {
  return (
    <div
      id="invoice-document"
      style={{
        width: "210mm",
        "min-height": "297mm",
        padding: "15mm 20mm",
        "font-family": "'Sarabun', 'Noto Sans Thai', 'TH Sarabun New', 'Tahoma', sans-serif",
        "font-size": "11pt",
        background: "white",
        color: "black",
        "box-sizing": "border-box",
        "line-height": "1.6",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", "justify-content": "space-between", "align-items": "flex-start", "margin-bottom": "12px", "border-bottom": "2px solid #1f2937", "padding-bottom": "10px" }}>
        <div>
          <div style={{ "font-size": "18pt", "font-weight": "700", color: "#111827" }}>{docTitle()}</div>
          <Show when={invoice.documentType === "both"}>
            <div style={{ "font-size": "9pt", color: "#6b7280" }}>ต้นฉบับ / Original</div>
          </Show>
        </div>
        <div style={{ "text-align": "right", "font-size": "10pt" }}>
          <div><span style={{ color: "#6b7280" }}>เลขที่: </span><strong>{invoice.invoiceNumber || "-"}</strong></div>
          <div><span style={{ color: "#6b7280" }}>วันที่: </span><strong>{formatDate(invoice.invoiceDate)}</strong></div>
        </div>
      </div>

      {/* Party info: seller | buyer */}
      <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "16px", "margin-bottom": "16px" }}>
        {/* Seller */}
        <div style={{ border: "1px solid #e5e7eb", "border-radius": "4px", padding: "10px" }}>
          <div style={{ "font-weight": "700", "font-size": "10pt", color: "#374151", "margin-bottom": "6px", "border-bottom": "1px solid #e5e7eb", "padding-bottom": "4px" }}>
            ผู้ขาย / Seller
          </div>
          <PartyBlock name={invoice.seller.name} address={invoice.seller.address} taxId={invoice.seller.taxId} branch={invoice.seller.branch} phone={invoice.seller.phone} />
        </div>
        {/* Buyer */}
        <div style={{ border: "1px solid #e5e7eb", "border-radius": "4px", padding: "10px" }}>
          <div style={{ "font-weight": "700", "font-size": "10pt", color: "#374151", "margin-bottom": "6px", "border-bottom": "1px solid #e5e7eb", "padding-bottom": "4px" }}>
            ผู้ซื้อ / Buyer
          </div>
          <PartyBlock name={invoice.buyer.name} address={invoice.buyer.address} taxId={invoice.buyer.taxId} branch={invoice.buyer.branch} phone={invoice.buyer.phone} />
        </div>
      </div>

      {/* Items table */}
      <table style={{ width: "100%", "border-collapse": "collapse", "margin-bottom": "8px", "font-size": "10pt" }}>
        <thead>
          <tr>
            <th style={`${headerCellStyle} width: 36px;`}>#</th>
            <th style={`${headerCellStyle} text-align: left;`}>รายการสินค้า / บริการ</th>
            <th style={`${headerCellStyle} width: 60px;`}>จำนวน</th>
            <th style={`${headerCellStyle} width: 100px;`}>ราคา/หน่วย</th>
            <th style={`${headerCellStyle} width: 110px;`}>จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody>
          <For each={invoice.items}>
            {(item, index) => (
              <tr>
                <td style={`${cellStyle} text-align: center; color: #6b7280;`}>{index() + 1}</td>
                <td style={cellStyle}>{item.description || <span style={{ color: "#9ca3af" }}>-</span>}</td>
                <td style={`${cellStyle} text-align: center;`}>{item.qty}</td>
                <td style={`${cellStyle} text-align: right;`}>{thb(item.unitPrice)}</td>
                <td style={`${cellStyle} text-align: right; font-weight: 500;`}>{thb(item.qty * item.unitPrice)}</td>
              </tr>
            )}
          </For>
          {/* Filler rows for short invoices */}
          <For each={Array(Math.max(0, 5 - invoice.items.length)).fill(0)}>
            {() => (
              <tr>
                <td style={`${cellStyle} color: transparent;`}>-</td>
                <td style={cellStyle}>&nbsp;</td>
                <td style={cellStyle}>&nbsp;</td>
                <td style={cellStyle}>&nbsp;</td>
                <td style={cellStyle}>&nbsp;</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>

      {/* Totals block */}
      <div style={{ display: "flex", "justify-content": "flex-end", "margin-bottom": "16px" }}>
        <table style={{ "border-collapse": "collapse", "font-size": "10pt", "min-width": "260px" }}>
          <tbody>
            <tr>
              <td style={{ padding: "3px 12px", color: "#374151" }}>ยอดก่อนภาษีมูลค่าเพิ่ม</td>
              <td style={{ padding: "3px 12px", "text-align": "right", "border-left": "1px solid #e5e7eb" }}>{thb(totals().subtotal)}</td>
            </tr>
            <Show when={invoice.vatEnabled}>
              <tr>
                <td style={{ padding: "3px 12px", color: "#374151" }}>ภาษีมูลค่าเพิ่ม 7%</td>
                <td style={{ padding: "3px 12px", "text-align": "right", "border-left": "1px solid #e5e7eb" }}>{thb(totals().vatAmount)}</td>
              </tr>
            </Show>
            <tr style={{ "border-top": "2px solid #1f2937" }}>
              <td style={{ padding: "5px 12px", "font-weight": "700", "font-size": "11pt" }}>ยอดรวมทั้งสิ้น</td>
              <td style={{ padding: "5px 12px", "text-align": "right", "font-weight": "700", "font-size": "11pt", "border-left": "2px solid #1f2937" }}>{thb(totals().grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes */}
      <Show when={invoice.notes}>
        <div style={{ "border-top": "1px solid #e5e7eb", "padding-top": "8px", "margin-bottom": "16px", "font-size": "10pt" }}>
          <span style={{ "font-weight": "600", color: "#374151" }}>หมายเหตุ: </span>
          <span style={{ color: "#4b5563" }}>{invoice.notes}</span>
        </div>
      </Show>

      {/* Signature row */}
      <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "32px", "margin-top": "auto", "padding-top": "24px", "border-top": "1px solid #e5e7eb" }}>
        <SignatureBlock label="ผู้รับเงิน / Received by" />
        <SignatureBlock label="ผู้จ่ายเงิน / Paid by" />
      </div>
    </div>
  );
}

function PartyBlock(props: { name: string; address: string; taxId: string; branch: string; phone: string }) {
  const empty = <span style={{ color: "#9ca3af" }}>-</span>;
  return (
    <div style={{ "font-size": "10pt", display: "flex", "flex-direction": "column", gap: "2px" }}>
      <div><strong>{props.name || empty}</strong></div>
      <Show when={props.address}>
        <div style={{ color: "#4b5563", "white-space": "pre-wrap" }}>{props.address}</div>
      </Show>
      <div>
        <span style={{ color: "#6b7280" }}>เลขประจำตัวผู้เสียภาษี: </span>
        {props.taxId || empty}
      </div>
      <div style={{ display: "flex", gap: "16px" }}>
        <span><span style={{ color: "#6b7280" }}>สาขา: </span>{props.branch || empty}</span>
        <Show when={props.phone}>
          <span><span style={{ color: "#6b7280" }}>โทร: </span>{props.phone}</span>
        </Show>
      </div>
    </div>
  );
}

function SignatureBlock(props: { label: string }) {
  const lineStyle = "border-bottom: 1px solid #9ca3af; margin: 0 16px;";
  return (
    <div style={{ "text-align": "center", "font-size": "10pt" }}>
      <div style={{ "font-weight": "600", color: "#374151", "margin-bottom": "32px" }}>{props.label}</div>
      <div style={lineStyle}>&nbsp;</div>
      <div style={{ color: "#6b7280", margin: "4px 0" }}>( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )</div>
      <div style={{ display: "flex", "justify-content": "center", gap: "8px", color: "#6b7280" }}>
        <span>วันที่</span>
        <span style={{ "border-bottom": "1px solid #9ca3af", width: "120px", display: "inline-block" }}>&nbsp;</span>
      </div>
    </div>
  );
}
