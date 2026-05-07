import { Switch, Match } from "solid-js";
import { isDark, setIsDark } from "./stores/theme";
import { currentPage } from "./stores/router";
import { Sidebar } from "./components/Sidebar";
import { InvoicePage } from "./pages/InvoicePage";
import { HistoryPage } from "./pages/HistoryPage";
import { ContactsPage } from "./pages/ContactsPage";
import "./App.css";

function App() {
  return (
    <div class="min-h-screen bg-base-100 text-base-content flex flex-col">
      {/* Navbar */}
      <div class="navbar bg-base-200 shadow-sm px-4 h-16 shrink-0">
        <div class="flex-1 gap-2">
          <i class="ri-file-text-line text-primary text-xl" />
          <span class="font-bold text-lg">ระบบออกใบกำกับภาษี</span>
        </div>
        <div class="flex-none">
          <button
            class="btn btn-ghost btn-circle"
            onClick={() => setIsDark(!isDark())}
            title={isDark() ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
          >
            {isDark()
              ? <i class="ri-sun-line text-xl" />
              : <i class="ri-moon-line text-xl" />
            }
          </button>
        </div>
      </div>

      {/* Body: sidebar + page content */}
      <div class="flex flex-1 overflow-hidden">
        <Sidebar />
        <div class="flex-1 overflow-hidden">
          <Switch>
            <Match when={currentPage() === "invoice"}>
              <InvoicePage />
            </Match>
            <Match when={currentPage() === "history"}>
              <HistoryPage />
            </Match>
            <Match when={currentPage() === "contacts"}>
              <ContactsPage />
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
}

export default App;
