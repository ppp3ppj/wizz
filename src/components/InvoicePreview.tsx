import { createSignal, onMount, onCleanup } from "solid-js";
import _html2pdf from "html2pdf.js";
import { invoice } from "../stores/invoice";
import { InvoiceDocument } from "./InvoiceDocument";

// CJS interop guard
const html2pdf: typeof _html2pdf = (_html2pdf as any).default ?? _html2pdf;

export function InvoicePreview() {
  let containerRef!: HTMLDivElement;
  const [scale, setScale] = createSignal(1);
  const [downloading, setDownloading] = createSignal(false);

  onMount(() => {
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width - 32; // subtract padding
      setScale(Math.min(1, w / 794));
    });
    observer.observe(containerRef);
    onCleanup(() => observer.disconnect());
  });

  async function handleDownloadPDF() {
    const element = document.getElementById("invoice-document");
    if (!element) return;
    setDownloading(true);
    try {
      await html2pdf()
        .set({
          margin: 0,
          filename: `invoice-${invoice.invoiceNumber || "draft"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();
    } finally {
      setDownloading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  // A4 aspect ratio: 297/210
  const previewHeight = () => 794 * (297 / 210) * scale();

  return (
    <div class="flex flex-col h-full">
      {/* Action bar */}
      <div class="flex gap-2 p-3 bg-base-200 border-b border-base-300 shrink-0">
        <button
          class="btn btn-primary btn-sm gap-2"
          onClick={handleDownloadPDF}
          disabled={downloading()}
        >
          {downloading()
            ? <span class="loading loading-spinner loading-xs" />
            : <i class="ri-file-pdf-2-line" />
          }
          {downloading() ? "กำลังสร้าง PDF..." : "ดาวน์โหลด PDF"}
        </button>
        <button class="btn btn-ghost btn-sm gap-2" onClick={handlePrint}>
          <i class="ri-printer-line" />
          พิมพ์
        </button>
      </div>

      {/* Scrollable preview area */}
      <div ref={containerRef} class="flex-1 overflow-y-auto overflow-x-hidden bg-base-300 p-4">
        {/* Height wrapper compensates for scale transform */}
        <div style={{ height: `${previewHeight()}px`, position: "relative", width: "100%" }}>
          <div
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
