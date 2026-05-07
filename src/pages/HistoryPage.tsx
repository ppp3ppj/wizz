import { createSignal, createResource, For, Show } from "solid-js";
import { dbGetInvoices, dbGetInvoice, dbDeleteInvoice } from "../services/db";
import { setInvoice } from "../stores/invoice";
import { setCurrentPage, setSavedId } from "../stores/router";
import type { InvoiceSummary } from "../types/invoice";

function thb(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function docLabel(type: string) {
  if (type === "tax") return "ใบกำกับภาษี";
  if (type === "receipt") return "ใบเสร็จรับเงิน";
  return "ทั้งคู่";
}

export function HistoryPage() {
  const [search, setSearch] = createSignal("");
  const [invoices, { refetch }] = createResource<InvoiceSummary[]>(dbGetInvoices, { initialValue: [] });
  const [loading, setLoading] = createSignal(false);

  const filtered = () => {
    const q = search().toLowerCase();
    return (invoices() ?? []).filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.buyerName.toLowerCase().includes(q),
    );
  };

  async function handleLoad(id: number) {
    setLoading(true);
    try {
      const data = await dbGetInvoice(id);
      setInvoice(data);
      setSavedId(id);
      setCurrentPage("invoice");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(inv: InvoiceSummary) {
    const label = inv.invoiceNumber || `#${inv.id}`;
    if (!confirm(`ลบใบกำกับ ${label} ใช่หรือไม่?`)) return;
    await dbDeleteInvoice(inv.id);
    refetch();
  }

  return (
    <div class="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header */}
      <div class="flex items-center gap-3 p-4 bg-base-200 border-b border-base-300 shrink-0">
        <i class="ri-history-line text-primary text-lg" />
        <h2 class="font-bold text-base">ประวัติใบกำกับภาษี</h2>
        <div class="flex-1" />
        <label class="input input-sm w-64">
          <i class="ri-search-line text-base-content/40" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่หรือผู้ซื้อ..."
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
          />
        </label>
      </div>

      {/* Table */}
      <div class="flex-1 overflow-y-auto p-4">
        <Show
          when={!invoices.loading}
          fallback={
            <div class="flex justify-center items-center h-40">
              <span class="loading loading-spinner loading-md text-primary" />
            </div>
          }
        >
          <Show
            when={filtered().length > 0}
            fallback={
              <div class="flex flex-col items-center justify-center h-48 gap-3 text-base-content/40">
                <i class="ri-file-search-line text-5xl" />
                <p class="text-sm">ยังไม่มีใบกำกับที่บันทึกไว้</p>
              </div>
            }
          >
            <table class="table table-sm w-full">
              <thead>
                <tr>
                  <th>เลขที่เอกสาร</th>
                  <th>วันที่</th>
                  <th>ผู้ซื้อ</th>
                  <th class="text-right">ยอดรวม (฿)</th>
                  <th>ประเภท</th>
                  <th>บันทึกเมื่อ</th>
                  <th class="text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <For each={filtered()}>
                  {(inv) => (
                    <tr class="hover">
                      <td class="font-medium">{inv.invoiceNumber || <span class="text-base-content/40">-</span>}</td>
                      <td>{inv.invoiceDate}</td>
                      <td class="max-w-[180px] truncate">{inv.buyerName || <span class="text-base-content/40">-</span>}</td>
                      <td class="text-right tabular-nums font-medium">{thb(inv.grandTotal)}</td>
                      <td>
                        <span class="badge badge-outline badge-xs">{docLabel(inv.documentType)}</span>
                      </td>
                      <td class="text-base-content/60 text-xs">{inv.createdAt}</td>
                      <td>
                        <div class="flex justify-center gap-1">
                          <button
                            class="btn btn-ghost btn-xs gap-1"
                            onClick={() => handleLoad(inv.id)}
                            disabled={loading()}
                            title="โหลดและแก้ไข"
                          >
                            <i class="ri-edit-line" />
                            โหลด
                          </button>
                          <button
                            class="btn btn-ghost btn-xs text-error"
                            onClick={() => handleDelete(inv)}
                            title="ลบ"
                          >
                            <i class="ri-delete-bin-line" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </Show>
        </Show>
      </div>
    </div>
  );
}
