import { type Page, currentPage, setCurrentPage } from "../stores/router";

interface NavItem {
  page: Page;
  icon: string;
  label: string;
}

const items: NavItem[] = [
  { page: "invoice",  icon: "ri-file-add-line",       label: "สร้างใหม่" },
  { page: "history",  icon: "ri-history-line",         label: "ประวัติ"   },
  { page: "contacts", icon: "ri-contacts-book-line",   label: "รายชื่อ"  },
];

export function Sidebar() {
  return (
    <aside class="flex flex-col items-center w-16 shrink-0 bg-base-200 border-r border-base-300 py-3 gap-1">
      {items.map((item) => (
        <button
          class={`flex flex-col items-center gap-1 w-full py-2 px-1 rounded-lg transition-colors text-xs
            ${currentPage() === item.page
              ? "bg-primary text-primary-content"
              : "text-base-content/60 hover:bg-base-300 hover:text-base-content"
            }`}
          onClick={() => setCurrentPage(item.page)}
          title={item.label}
        >
          <i class={`${item.icon} text-xl`} />
          <span class="leading-none">{item.label}</span>
        </button>
      ))}
    </aside>
  );
}
