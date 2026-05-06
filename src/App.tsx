import { isDark, setIsDark } from "./stores/theme";
import { InvoicePage } from "./pages/InvoicePage";
import "./App.css";

function App() {
  return (
    <div class="min-h-screen bg-base-100 text-base-content">
      <div class="navbar bg-base-200 shadow-sm px-4 h-16">
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
      <InvoicePage />
    </div>
  );
}

export default App;
