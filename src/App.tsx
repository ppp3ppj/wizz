import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { isDark, setIsDark } from "./stores/theme";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = createSignal("");
  const [name, setName] = createSignal("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name: name() }));
  }

  return (
    <div class="min-h-screen bg-base-100 text-base-content">

      {/* Navbar */}
      <div class="navbar bg-base-200 shadow-sm px-4">
        <div class="flex-1 gap-2">
          <i class="ri-apps-2-line text-primary text-xl" />
          <span class="font-bold text-lg">Wizz</span>
        </div>
        <div class="flex-none gap-2">
          <button
            class="btn btn-ghost btn-circle"
            onClick={() => setIsDark(!isDark())}
            title="Toggle theme"
          >
            {isDark()
              ? <i class="ri-sun-line text-xl" />
              : <i class="ri-moon-line text-xl" />
            }
          </button>
        </div>
      </div>

      {/* Hero */}
      <div class="hero py-16">
        <div class="hero-content text-center flex-col gap-6">
          <div class="flex gap-4 text-5xl text-primary">
            <i class="ri-tauri-line" />
            <i class="ri-flashlight-line" />
            <i class="ri-code-s-slash-line" />
          </div>
          <div>
            <h1 class="text-4xl font-bold">Welcome to Tauri + Solid</h1>
            <p class="py-4 text-base-content/70">
              Click the icons below to learn more about each technology.
            </p>
          </div>

          {/* Tech badges */}
          <div class="flex gap-3 flex-wrap justify-center">
            <a href="https://tauri.app" target="_blank" class="badge badge-outline badge-lg gap-2 p-4 hover:badge-primary transition-colors">
              <i class="ri-shield-line" />
              Tauri
            </a>
            <a href="https://vite.dev" target="_blank" class="badge badge-outline badge-lg gap-2 p-4 hover:badge-secondary transition-colors">
              <i class="ri-flashlight-line" />
              Vite
            </a>
            <a href="https://solidjs.com" target="_blank" class="badge badge-outline badge-lg gap-2 p-4 hover:badge-accent transition-colors">
              <i class="ri-code-s-slash-line" />
              SolidJS
            </a>
          </div>

          {/* Greet card */}
          <div class="card bg-base-200 shadow-md w-full max-w-md">
            <div class="card-body gap-4">
              <h2 class="card-title justify-center gap-2">
                <i class="ri-chat-smile-2-line text-primary" />
                Say Hello
              </h2>
              <form
                class="flex gap-2"
                onSubmit={(e) => { e.preventDefault(); greet(); }}
              >
                <label class="input flex-1 flex items-center gap-2">
                  <i class="ri-user-line text-base-content/50" />
                  <input
                    type="text"
                    class="grow"
                    placeholder="Enter your name…"
                    onInput={(e) => setName(e.currentTarget.value)}
                  />
                </label>
                <button type="submit" class="btn btn-primary gap-2">
                  <i class="ri-send-plane-line" />
                  Greet
                </button>
              </form>
              {greetMsg() && (
                <div class="alert alert-success gap-2">
                  <i class="ri-checkbox-circle-line text-lg" />
                  <span>{greetMsg()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Remix icon showcase */}
      <div class="container mx-auto px-4 pb-12">
        <div class="divider">
          <i class="ri-remixicon-line mr-2" />
          Remix Icons
        </div>
        <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
          {[
            { icon: "ri-home-4-line", label: "Home" },
            { icon: "ri-settings-3-line", label: "Settings" },
            { icon: "ri-notification-line", label: "Notif" },
            { icon: "ri-search-line", label: "Search" },
            { icon: "ri-heart-line", label: "Heart" },
            { icon: "ri-star-line", label: "Star" },
            { icon: "ri-download-line", label: "Download" },
            { icon: "ri-upload-line", label: "Upload" },
            { icon: "ri-file-line", label: "File" },
            { icon: "ri-folder-line", label: "Folder" },
            { icon: "ri-image-line", label: "Image" },
            { icon: "ri-camera-line", label: "Camera" },
            { icon: "ri-video-line", label: "Video" },
            { icon: "ri-music-line", label: "Music" },
            { icon: "ri-map-pin-line", label: "Map" },
            { icon: "ri-global-line", label: "Global" },
          ].map(({ icon, label }) => (
            <div class="flex flex-col items-center gap-1 p-3 rounded-box bg-base-200 hover:bg-base-300 transition-colors cursor-default">
              <i class={`${icon} text-2xl text-primary`} />
              <span class="text-xs text-base-content/60">{label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default App;
