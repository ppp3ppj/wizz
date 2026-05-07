import { For } from "solid-js";
import {
  invoice, setInvoice,
  addItem, removeItem, updateItem,
  updateSeller, updateBuyer,
  resetInvoice, totals,
} from "../stores/invoice";
import type { PartyInfo } from "../types/invoice";

function thb(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function safeNum(val: string) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

export function InvoiceForm() {
  return (
    <div class="flex flex-col gap-3 p-4">

      {/* Section 1: Document settings */}
      <details class="collapse collapse-arrow bg-base-200 border border-base-300" open>
        <summary class="collapse-title font-semibold text-sm min-h-0 py-3">
          <i class="ri-settings-3-line mr-2 text-primary" />
          ตั้งค่าเอกสาร
        </summary>
        <div class="collapse-content flex flex-col gap-3 pt-2">

          {/* Document type */}
          <fieldset class="fieldset p-0">
            <legend class="fieldset-legend">ประเภทเอกสาร</legend>
            <div class="join w-full">
              {(["both", "tax", "receipt"] as const).map((type) => (
                <input
                  class="join-item btn btn-sm flex-1"
                  type="radio"
                  name="doc-type"
                  aria-label={type === "tax" ? "ใบกำกับภาษี" : type === "receipt" ? "ใบเสร็จรับเงิน" : "ทั้งคู่"}
                  checked={invoice.documentType === type}
                  onChange={() => setInvoice("documentType", type)}
                />
              ))}
            </div>
          </fieldset>

          {/* Invoice number + date */}
          <div class="grid grid-cols-2 gap-2">
            <fieldset class="fieldset p-0">
              <legend class="fieldset-legend">เลขที่เอกสาร</legend>
              <label class="input input-sm w-full">
                <input
                  type="text"
                  placeholder="เช่น INV-2024-001"
                  value={invoice.invoiceNumber}
                  onInput={(e) => setInvoice("invoiceNumber", e.currentTarget.value)}
                />
              </label>
            </fieldset>
            <fieldset class="fieldset p-0">
              <legend class="fieldset-legend">วันที่</legend>
              <label class="input input-sm w-full">
                <input
                  type="date"
                  value={invoice.invoiceDate}
                  onInput={(e) => setInvoice("invoiceDate", e.currentTarget.value)}
                />
              </label>
            </fieldset>
          </div>

          {/* VAT toggle */}
          <label class="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              class="toggle toggle-primary toggle-sm"
              checked={invoice.vatEnabled}
              onChange={(e) => setInvoice("vatEnabled", e.currentTarget.checked)}
            />
            <span class="text-sm">ภาษีมูลค่าเพิ่ม 7%</span>
          </label>
        </div>
      </details>

      {/* Section 2: Seller */}
      <details class="collapse collapse-arrow bg-base-200 border border-base-300" open>
        <summary class="collapse-title font-semibold text-sm min-h-0 py-3">
          <i class="ri-store-2-line mr-2 text-primary" />
          ข้อมูลผู้ขาย
        </summary>
        <div class="collapse-content pt-2">
          <PartyFields
            values={invoice.seller}
            onUpdate={updateSeller}
            taxIdRequired
          />
        </div>
      </details>

      {/* Section 3: Buyer */}
      <details class="collapse collapse-arrow bg-base-200 border border-base-300" open>
        <summary class="collapse-title font-semibold text-sm min-h-0 py-3">
          <i class="ri-user-3-line mr-2 text-primary" />
          ข้อมูลผู้ซื้อ
        </summary>
        <div class="collapse-content pt-2">
          <PartyFields
            values={invoice.buyer}
            onUpdate={updateBuyer}
            taxIdRequired={false}
          />
        </div>
      </details>

      {/* Section 4: Line items */}
      <details class="collapse collapse-arrow bg-base-200 border border-base-300" open>
        <summary class="collapse-title font-semibold text-sm min-h-0 py-3">
          <i class="ri-list-check-3 mr-2 text-primary" />
          รายการสินค้า / บริการ
        </summary>
        <div class="collapse-content pt-2 flex flex-col gap-2">
          <For each={invoice.items}>
            {(item, index) => (
              <div class="bg-base-100 border border-base-300 rounded-box p-3 flex flex-col gap-2">
                {/* Row 1: index badge + delete */}
                <div class="flex items-center justify-between">
                  <span class="badge badge-soft badge-primary badge-sm">รายการที่ {index() + 1}</span>
                  <button
                    class="btn btn-ghost btn-xs btn-circle text-error"
                    onClick={() => removeItem(item.id)}
                    disabled={invoice.items.length === 1}
                    title="ลบรายการ"
                  >
                    <i class="ri-delete-bin-line" />
                  </button>
                </div>

                {/* Row 2: description — full width */}
                <fieldset class="fieldset p-0">
                  <legend class="fieldset-legend">ชื่อสินค้า / รายละเอียด</legend>
                  <label class="input input-sm w-full">
                    <input
                      type="text"
                      placeholder="ระบุชื่อสินค้าหรือบริการ"
                      value={item.description}
                      onInput={(e) => updateItem(item.id, "description", e.currentTarget.value)}
                    />
                  </label>
                </fieldset>

                {/* Row 3: qty | unit price | total */}
                <div class="grid grid-cols-3 gap-2 items-end">
                  <fieldset class="fieldset p-0">
                    <legend class="fieldset-legend">จำนวน</legend>
                    <label class="input input-sm w-full">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.qty}
                        onInput={(e) => updateItem(item.id, "qty", safeNum(e.currentTarget.value) || 1)}
                      />
                    </label>
                  </fieldset>

                  <fieldset class="fieldset p-0">
                    <legend class="fieldset-legend">ราคา / หน่วย (฿)</legend>
                    <label class="input input-sm w-full">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onInput={(e) => updateItem(item.id, "unitPrice", safeNum(e.currentTarget.value))}
                      />
                    </label>
                  </fieldset>

                  <fieldset class="fieldset p-0">
                    <legend class="fieldset-legend">รวม (฿)</legend>
                    <div class="input input-sm w-full bg-base-200 text-right font-semibold tabular-nums text-primary pointer-events-none select-none">
                      {thb(item.qty * item.unitPrice)}
                    </div>
                  </fieldset>
                </div>
              </div>
            )}
          </For>

          <button class="btn btn-outline btn-sm gap-2 w-full" onClick={addItem}>
            <i class="ri-add-line" />
            เพิ่มรายการ
          </button>

          {/* Totals summary */}
          <div class="bg-base-100 rounded-box p-3 text-sm flex flex-col gap-1 mt-1">
            <div class="flex justify-between text-base-content/70">
              <span>ยอดก่อนภาษี</span>
              <span class="tabular-nums">{thb(totals().subtotal)}</span>
            </div>
            {invoice.vatEnabled && (
              <div class="flex justify-between text-base-content/70">
                <span>ภาษีมูลค่าเพิ่ม 7%</span>
                <span class="tabular-nums">{thb(totals().vatAmount)}</span>
              </div>
            )}
            <div class="flex justify-between font-bold text-base pt-1 border-t border-base-300">
              <span>ยอดรวมทั้งสิ้น</span>
              <span class="tabular-nums text-primary">{thb(totals().grandTotal)}</span>
            </div>
          </div>
        </div>
      </details>

      {/* Section 5: Notes */}
      <details class="collapse collapse-arrow bg-base-200 border border-base-300">
        <summary class="collapse-title font-semibold text-sm min-h-0 py-3">
          <i class="ri-sticky-note-line mr-2 text-primary" />
          หมายเหตุ
        </summary>
        <div class="collapse-content pt-2">
          <textarea
            class="textarea w-full textarea-sm"
            rows="3"
            placeholder="หมายเหตุเพิ่มเติม..."
            value={invoice.notes}
            onInput={(e) => setInvoice("notes", e.currentTarget.value)}
          />
        </div>
      </details>

      {/* Reset button */}
      <button class="btn btn-outline btn-sm btn-error gap-2 mt-1" onClick={resetInvoice}>
        <i class="ri-refresh-line" />
        เริ่มใหม่
      </button>
    </div>
  );
}

function PartyFields(props: {
  values: PartyInfo;
  onUpdate: (field: keyof PartyInfo, value: string) => void;
  taxIdRequired: boolean;
}) {
  return (
    <div class="flex flex-col gap-2">
      <fieldset class="fieldset p-0">
        <legend class="fieldset-legend">ชื่อ / บริษัท</legend>
        <label class="input input-sm w-full">
          <input
            type="text"
            placeholder="ชื่อบริษัท หรือชื่อผู้ประกอบการ"
            value={props.values.name}
            onInput={(e) => props.onUpdate("name", e.currentTarget.value)}
          />
        </label>
      </fieldset>

      <fieldset class="fieldset p-0">
        <legend class="fieldset-legend">ที่อยู่</legend>
        <textarea
          class="textarea textarea-sm w-full"
          rows="2"
          placeholder="ที่อยู่"
          value={props.values.address}
          onInput={(e) => props.onUpdate("address", e.currentTarget.value)}
        />
      </fieldset>

      <div class="grid grid-cols-2 gap-2">
        <fieldset class="fieldset p-0">
          <legend class="fieldset-legend">
            เลขประจำตัวผู้เสียภาษี
            {props.taxIdRequired && <span class="text-error ml-1">*</span>}
          </legend>
          <label class="input input-sm w-full">
            <input
              type="text"
              maxlength="13"
              placeholder="0000000000000"
              value={props.values.taxId}
              onInput={(e) => props.onUpdate("taxId", e.currentTarget.value)}
            />
          </label>
        </fieldset>
        <fieldset class="fieldset p-0">
          <legend class="fieldset-legend">สาขา</legend>
          <label class="input input-sm w-full">
            <input
              type="text"
              placeholder="สำนักงานใหญ่"
              value={props.values.branch}
              onInput={(e) => props.onUpdate("branch", e.currentTarget.value)}
            />
          </label>
        </fieldset>
      </div>

      <fieldset class="fieldset p-0">
        <legend class="fieldset-legend">โทรศัพท์</legend>
        <label class="input input-sm w-full">
          <i class="ri-phone-line text-base-content/40 text-sm" />
          <input
            type="tel"
            placeholder="02-xxx-xxxx"
            value={props.values.phone}
            onInput={(e) => props.onUpdate("phone", e.currentTarget.value)}
          />
        </label>
      </fieldset>
    </div>
  );
}
