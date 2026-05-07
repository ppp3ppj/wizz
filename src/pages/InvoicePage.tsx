import { InvoiceForm } from "../components/InvoiceForm";
import { InvoicePreview } from "../components/InvoicePreview";

export function InvoicePage() {
  return (
    <div class="flex h-[calc(100vh-4rem)]">
      {/* Left: Form panel */}
      <div class="w-[40%] min-w-[340px] overflow-y-auto border-r border-base-300 bg-base-100">
        <InvoiceForm />
      </div>
      {/* Right: Preview panel */}
      <div class="flex-1 overflow-hidden bg-base-200">
        <InvoicePreview />
      </div>
    </div>
  );
}
