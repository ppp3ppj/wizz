import { createSignal, onMount, onCleanup } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { invoice } from "../stores/invoice";
import { InvoiceDocument } from "./InvoiceDocument";

export function InvoicePreview() {
  let containerRef!: HTMLDivElement;
  const [scale, setScale] = createSignal(1);
  const [busy, setBusy] = createSignal(false);
  const [message, setMessage] = createSignal<{ text: string; ok: boolean } | null>(null);

  onMount(() => {
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width - 32;
      setScale(Math.min(1, w / 794));
    });
    observer.observe(containerRef);
    onCleanup(() => observer.disconnect());
  });

  function showMessage(text: string, ok: boolean) {
    setMessage({ text, ok });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleDownloadPDF() {
    const element = document.getElementById("invoice-document");
    if (!element) return;
    setBusy(true);
    try {
      const html = element.outerHTML;
      const filename = `invoice-${invoice.invoiceNumber || "draft"}.pdf`;
      // Rust handles dialog + Edge headless generation — JS thread stays free
      const saved = await invoke<boolean>("save_invoice_pdf", { html, filename });
      if (saved) showMessage("บันทึก PDF เรียบร้อยแล้ว", true);
    } catch (e: any) {
      showMessage(`เกิดข้อผิดพลาด: ${e}`, false);
    } finally {
      setBusy(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const previewHeight = () => 794 * (297 / 210) * scale();

  return (
    <div class="flex flex-col h-full">
      {/* Action bar */}
      <div class="flex items-center gap-2 p-3 bg-base-200 border-b border-base-300 shrink-0">
        <button class="btn btn-primary btn-sm gap-2" onClick={handleDownloadPDF} disabled={busy()}>
          {busy()
            ? <span class="loading loading-spinner loading-xs" />
            : <i class="ri-file-pdf-2-line" />
          }
          {busy() ? "กำลังสร้าง PDF..." : "ดาวน์โหลด PDF"}
        </button>
        <button class="btn btn-ghost btn-sm gap-2" onClick={handlePrint} disabled={busy()}>
          <i class="ri-printer-line" />
          พิมพ์
        </button>

        {/* Inline status message */}
        {message() && (
          <span class={`text-sm ml-2 ${message()!.ok ? "text-success" : "text-error"}`}>
            <i class={`${message()!.ok ? "ri-checkbox-circle-line" : "ri-error-warning-line"} mr-1`} />
            {message()!.text}
          </span>
        )}
      </div>

      {/* Scrollable preview area */}
      <div ref={containerRef} class="flex-1 overflow-y-auto overflow-x-hidden bg-base-300 p-4">
        {/* invoice-height-wrapper: collapses in print CSS */}
        <div class="invoice-height-wrapper" style={{ height: `${previewHeight()}px`, position: "relative", width: "100%" }}>
          {/* invoice-scale-wrapper: transform reset in print CSS */}
          <div
            class="invoice-scale-wrapper"
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              "transform-origin": "top left",
              transform: `scale(${scale()})`,
              width: "794px",
            }}
          >
            <div class="shadow-2xl">
              <InvoiceDocument />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
